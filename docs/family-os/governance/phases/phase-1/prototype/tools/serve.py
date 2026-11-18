#!/usr/bin/env python3
"""يشغّل النموذج محلياً بلا تخزين مؤقت في المتصفح، فيظهر كل تعديل عند أول تحديث للصفحة.

التشغيل من مجلد النموذج:  python3 tools/serve.py [المنفذ]      (الافتراضي 8001)
"""
import functools
import http.server
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_response(self, code, message=None):
        # لا «304 لم يتغير»: المتصفح يأخذ الملف كاملاً في كل مرة
        for h in ("If-Modified-Since", "If-None-Match"):
            if h in self.headers:
                del self.headers[h]
        super().send_response(code, message)

    def send_head(self):
        for h in ("If-Modified-Since", "If-None-Match"):
            if h in self.headers:
                del self.headers[h]
        return super().send_head()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    handler = functools.partial(NoCache, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("0.0.0.0", port), handler) as srv:
        print(f"prototype on http://0.0.0.0:{port}/ (no browser cache)", flush=True)
        srv.serve_forever()
