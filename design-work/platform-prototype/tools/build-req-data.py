#!/usr/bin/env python3
"""يستخرج متطلبات المرحلة 1 (REQ) من مواصفات الحوكمة المعتمدة ويولّد assets/js/req-data.js.
المصدر الوحيد: docs/family-os/governance/phases/phase-1/S1-*/SPEC.md (§3 + جدول التغطية §9).
لا يُعدَّل الناتج يدوياً — أعد تشغيل هذا الملف عند تغير المواصفات."""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[3]
PH = ROOT / "docs/family-os/governance/phases/phase-1"
NAMES = {
 "S1-01": "هيكل التطبيق والمنصة", "S1-02": "الهوية والتهيئة العائلية", "S1-03": "الأدوار والصلاحيات",
 "S1-04": "الخطط والاشتراكات", "S1-05": "المكافآت للأطفال", "S1-06": "المهام والتقويم",
 "S1-07": "الموقع الأساسي وSOS", "S1-08": "الدردشة العائلية الأساسية",
 "S1-09": "مركز الأوامر والإعدادات", "S1-10": "الحماية والفرض"}
ORDER = ["S1-01","S1-02","S1-03","S1-10","S1-09","S1-07","S1-08","S1-05","S1-06","S1-04"]  # Q-199

def clean(t):
    t = re.sub(r"\[[^\]]*\]", "", t)            # وسوم المصدر [Q-… · DERIVED]
    t = re.sub(r"\*\*|`", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    cut = re.split(r"(?<=[^\d])[.؛:] |؛|\. | — | \(", t, maxsplit=1)[0].strip(" .؛:—")
    if len(cut) < 18: cut = t
    return (cut[:96].rsplit(" ", 1)[0] + "…") if len(cut) > 96 else cut

out = []
for sid in ORDER:
    d = next(PH.glob(sid + "-*"))
    spec = (d / "SPEC.md").read_text(encoding="utf-8")
    sec3 = re.search(r"^## 3\. .*?(?=^## 4\. )", spec, re.S | re.M).group(0)
    reqs = []
    for m in re.finditer(r"^- \*\*REQ-(\d{3}):\*\*\s*(.+)$", sec3, re.M):
        reqs.append({"id": "REQ-" + m.group(1), "t": clean(m.group(2))})
    sec9 = re.search(r"^## 9\. .*?(?=^## 10\. )", spec, re.S | re.M).group(0)
    noui = set()
    for m in re.finditer(r"^\|\s*REQ-(\d{3})\s*\|([^|]*)\|", sec9, re.M):
        if "بلا واجهة" in m.group(2): noui.add("REQ-" + m.group(1))
    for r in reqs:
        if r["id"] in noui: r["noui"] = 1
    out.append({"id": sid, "name": NAMES[sid], "reqs": reqs})

# قوالب التفويض الثلاثة + المفاتيح الحصرية للمالك (S1-03 SPEC §5-3-أ / §5-3-ب) — حرفياً
spec3 = (next(PH.glob("S1-03-*")) / "SPEC.md").read_text(encoding="utf-8")
def keys_after(heading, stop=None):
    """مفاتيح أول جدول يلي العنوان مباشرة (صفوف الجدول فقط — لا يُلتقط نص الشرح)."""
    rest = spec3[spec3.index(heading) + len(heading):]
    keys, started = [], False
    for line in rest.splitlines()[1:]:
        if line.startswith("|"):
            started = True
            keys += re.findall(r"`([a-z_]+(?:\.[a-z_]+)+)`", line)
        elif started:
            break
    return list(dict.fromkeys(keys))
perm = {
  "partner": keys_after("#### قالب الشريك (`partner`)", r"^#### قالب الوصي"),
  "guardian": keys_after("#### قالب الوصي المحدود (`guardian`)", r"^#### قالب المراقب"),
  "observer": keys_after("#### قالب المراقب (`observer`)", r"^### 5-3-ب"),
  "ownerOnly": keys_after("#### §5-أ. مالك حصري", r"^#### §5-ب"),
}
perm["all"] = keys_after("### 10-5. قائمة بذرة المفاتيح الكاملة")   # سجل الـ 95 (§10-5)
perm = {k: [x for x in v if x not in ("domain.action",)] for k, v in perm.items()}
total = sum(len(s["reqs"]) for s in out); noui = sum(1 for s in out for r in s["reqs"] if r.get("noui"))
js = "/* مولَّد آلياً من tools/build-req-data.py — لا تعدّله يدوياً */\nwindow.FOS_REQ = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\nwindow.FOS_PERM = " + json.dumps(perm, ensure_ascii=False, separators=(",", ":")) + ";\n"
(pathlib.Path(__file__).resolve().parents[1] / "assets/js/req-data.js").write_text(js, encoding="utf-8")
print("systems", len(out), "reqs", total, "no-ui", noui)
print({k: len(v) for k, v in perm.items()})
for s in out: print(s["id"], len(s["reqs"]), sum(1 for r in s["reqs"] if r.get("noui")))
