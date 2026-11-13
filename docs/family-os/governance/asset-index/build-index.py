#!/usr/bin/env python3
"""Build Family OS asset index: extract RE tables + §9 screens from SPECs,
match against parts/*.json, emit re_items.json / screens.json / summary.json.
Read-only on the repo clone. Writes only inside the --out dir.

Reproducible from a clean copy: all paths are CLI flags, with defaults
derived from this script's own location (no hardcoded machine paths):

  --draft      dir holding parts/*.json (outside the repo).
               Default: <parent of the repo clone>/family-os-asset-index-draft
               (i.e. a sibling of the repo clone, as in the original setup).
  --spec-base  dir holding the phase-1 SPECs.
               Default: <script dir>/../phases/phase-1
  --out        dir to write re_items.json / screens.json / summary.json into.
               Default: the script's own directory (the asset-index dir).

Example (from a fresh copy of the repo + a copy of the draft dir):

  python3 build-index.py --draft /path/to/family-os-asset-index-draft
"""
import argparse
import json, glob, os, re, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[3]  # docs/family-os/governance/asset-index -> repo root
DEFAULT_DRAFT = REPO_ROOT.parent / "family-os-asset-index-draft"
DEFAULT_SPEC_BASE = (SCRIPT_DIR / ".." / "phases" / "phase-1").resolve()
DEFAULT_OUT = SCRIPT_DIR

def parse_args(argv=None):
    p = argparse.ArgumentParser(
        description="Build Family OS asset index from SPECs + parts/*.json.")
    p.add_argument("--draft", type=Path, default=DEFAULT_DRAFT,
                   help="Directory holding parts/*.json (outside the repo). "
                        "Default: a sibling of the repo clone named "
                        "family-os-asset-index-draft.")
    p.add_argument("--spec-base", type=Path, default=DEFAULT_SPEC_BASE,
                   help="Directory holding the phase-1 SPECs. "
                        "Default: <script dir>/../phases/phase-1.")
    p.add_argument("--out", type=Path, default=DEFAULT_OUT,
                   help="Directory to write re_items.json / screens.json / "
                        "summary.json into. Default: the script's own directory.")
    return p.parse_args(argv)

SYSTEMS = [
    ("S1-01", "S1-01-app-shell-and-platform/SPEC.md"),
    ("S1-02", "S1-02-identity-and-onboarding/SPEC.md"),
    ("S1-03", "S1-03-family-roles-and-permissions/SPEC.md"),
    ("S1-04", "S1-04-plans-and-subscriptions/SPEC.md"),
    ("S1-05", "S1-05-rewards-children/SPEC.md"),
    ("S1-06", "S1-06-tasks-and-calendar/SPEC.md"),
    ("S1-07", "S1-07-location-basic/SPEC.md"),
    ("S1-08", "S1-08-chat-basic/SPEC.md"),
    ("S1-09", "S1-09-command-center-and-settings/SPEC.md"),
    ("S1-10", "S1-10-protection-and-enforcement/SPEC.md"),
]

APP_ALIASES = {
    "telegram": "telegram", "تيليجرام": "telegram",
    "bark kids": "bark-kids", "bark-kids": "bark-kids", "barkkids": "bark-kids",
    "bark": "bark", "بارك": "bark",
    "familywall": "familywall", "family wall": "familywall",
    "famisafe jr": "famisafe-jr", "famisafe-jr": "famisafe-jr", "famisafe jr.": "famisafe-jr",
    "famisafe": "famisafe",
    "life360": "life360",
    "muslim pro": "muslim-pro", "muslim-pro": "muslim-pro",
    "quizlet": "quizlet",
    "qustodio kids": "qustodio-kids", "qustodio-kids": "qustodio-kids",
    "qustodio": "qustodio",
}

# Whole-word Arabic asset terms (normalized: alef variants unified, optional ال- prefix).
# Substring matching was REMOVED: it false-positived on خطأ/خطط (خط) and إشعار (شعار)
# and خدمة خلفية (background service, not a background image).
def _norm_ar(w):
    w = re.sub(r"[\u064b-\u0652\u0670]", "", w)
    return w.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه")

def _ar_tokens(text):
    toks = set()
    for w in re.findall(r"[\u0600-\u06ff]+", text):
        n = _norm_ar(w)
        toks.add(n)
        if n.startswith("ال") and len(n) > 2:
            toks.add(n[2:])
    return toks

ASSET_WORDS = {  # normalized whole word -> kind
    "ايقونه": "icon", "ايقونات": "icon",
    "صوره": "image", "صور": "image",
    "صوت": "sound", "اصوات": "sound",
    "حركه": "anim", "حركات": "anim",
    "شعار": "logo", "شعارات": "logo",
    "خط": "font", "خطوط": "font",
    "ملصق": "sticker", "ملصقات": "sticker", "ستيكر": "sticker",
    "ايموجي": "emoji",
    "افاتار": "avatar",
    "فيديو": "video", "فيديوهات": "video",
    "نغمه": "tone", "نغمات": "tone",
    "شاره": "badge", "شارات": "badge",
    "رسوم": "illustration",
}
ASSET_PHRASES = {"صوره رمزيه": "avatar", "رسوم توضيحيه": "illustration"}

def norm_app(src: str):
    s = src.strip().lower()
    s = re.sub(r"\s*\(.*?\)\s*", "", s)  # drop (parent)/(child) qualifiers
    s = s.strip()
    if s in APP_ALIASES:
        return APP_ALIASES[s]
    for k, v in APP_ALIASES.items():
        if k in s:
            return v
    return None

def parse_table_rows(lines):
    """Return list of cell-lists for markdown table data rows."""
    rows = []
    for ln in lines:
        ln = ln.strip()
        if not ln.startswith("|"):
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        if not cells or all(set(c) <= set("-: ") for c in cells):
            continue
        if cells[0].startswith("المصدر") or cells[0].startswith("المعرف"):
            continue
        rows.append(cells)
    return rows

def extract_re(spec_path):
    text = open(spec_path, encoding="utf-8").read().splitlines()
    start = None
    for i, ln in enumerate(text):
        if "ملحق أ" in ln and ln.startswith("#"):
            start = i
            break
    if start is None:
        return []
    rows = parse_table_rows(text[start:])
    items = []
    for cells in rows:
        if len(cells) < 3:
            continue
        items.append({"source_raw": cells[0], "mechanism": cells[1], "used_in": cells[2]})
    return items

def extract_screens(spec_path):
    text = open(spec_path, encoding="utf-8").read().splitlines()
    start = None
    for i, ln in enumerate(text):
        if "فهرس الشاشات" in ln:
            start = i
            break
    if start is None:
        return []
    rows = []
    in_table = False
    for ln in text[start + 1:]:
        if ln.startswith("#"):
            break
        if ln.strip().startswith("|"):
            in_table = True
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue
            if cells[0].startswith("المعرف"):
                continue
            rows.append(cells)
        elif in_table and ln.strip() == "":
            continue
        elif in_table:
            break
    screens = []
    for cells in rows:
        if len(cells) < 2:
            continue
        screens.append({"id": cells[0], "name": cells[1],
                        "purpose": cells[4] if len(cells) > 4 else ""})
    return screens

GENERIC_EN = {"icon", "image", "font", "sound", "time", "background", "logo",
              "anim", "draw", "video", "check", "button", "drawable", "xml", "png",
              "screen", "view", "text", "date", "name", "file", "data", "code",
              "java", "class", "list", "item", "state", "mode", "type", "size"}
DISTINCTIVE_EN = {"badge", "streak", "lottie", "map_pin", "avatar", "emoji",
                  "sticker", "ringtone", "fingerprint", "qr", "fwpermission",
                  "celebrat", "trophy", "confetti"}

def asset_kinds(mech: str, used: str):
    """Return (kinds:set, distinctive:set) using whole-word Arabic + backticked identifiers."""
    t = mech + " " + used
    toks = _ar_tokens(t)
    kinds = {ASSET_WORDS[w] for w in toks if w in ASSET_WORDS}
    nt = _norm_ar(t)
    for ph, k in ASSET_PHRASES.items():
        if ph in nt:
            kinds.add(k)
    distinctive = set()
    for tok in re.findall(r"`([^`]+)`", mech):
        for w in re.split(r"[^A-Za-z0-9]+", tok):
            wl = w.lower()
            if wl in DISTINCTIVE_EN:
                distinctive.add(wl)
    return kinds, distinctive

def is_asset_type(mech: str, used: str) -> bool:
    kinds, _ = asset_kinds(mech, used)
    return bool(kinds)

def main():
    args = parse_args()
    draft = args.draft
    spec_base = args.spec_base
    out = args.out

    # ---- parts ----
    parts = {}
    for f in sorted(glob.glob(os.path.join(draft, "parts", "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        parts[d["app"]] = d
    assert len(parts) == 11, f"expected 11 parts, got {len(parts)}"

    totals = {"total_files": sum(p["total_files"] for p in parts.values()),
              "total_size_kb": sum(p["total_size_kb"] for p in parts.values())}
    cat_totals = {}
    for p in parts.values():
        for c, v in p["categories"].items():
            cat_totals.setdefault(c, {"count": 0, "size_kb": 0})
            cat_totals[c]["count"] += v["count"]
            cat_totals[c]["size_kb"] += v["size_kb"]

    # corpus of sampled asset filenames per app
    def entry_names(x):
        if isinstance(x, str):
            return x
        if isinstance(x, dict):
            return x.get("path") or x.get("name") or x.get("file") or ""
        return ""
    corpus = {}
    for app, p in parts.items():
        names = set()
        for c in p["categories"].values():
            for e in c.get("examples", []):
                names.add(e.lower())
        for e in p.get("distinct_identity", []) or []:
            names.add(entry_names(e).lower())
        for e in p.get("generic_functional_examples", []) or []:
            names.add(entry_names(e).lower())
        corpus[app] = names
    all_names = set().union(*corpus.values())

    # audio availability (exact where raw_breakdown exists)
    audio_counts = {}
    for app, p in parts.items():
        rb = p.get("raw_breakdown") or {}
        audio_counts[app] = sum(v for k, v in rb.items() if k in (".mp3", ".wav", ".ogg", ".m4a", ".aac"))

    # ---- RE items ----
    re_items = []
    for sys_id, rel in SYSTEMS:
        path = os.path.join(spec_base, rel)
        for it in extract_re(path):
            app = norm_app(it["source_raw"])
            asset = is_asset_type(it["mechanism"], it["used_in"])
            rec = {"system": sys_id, "source_raw": it["source_raw"], "source_app": app,
                   "mechanism": it["mechanism"], "used_in": it["used_in"],
                   "kind": "asset" if asset else "logic"}
            if asset and app:
                kinds, distinctive = asset_kinds(it["mechanism"], it["used_in"])
                hits = [k for k in distinctive if any(k in n for n in corpus[app])]
                kind_to_cat = {"icon": "icons_images", "image": "icons_images",
                               "avatar": "icons_images", "logo": "icons_images",
                               "illustration": "icons_images", "sticker": "icons_images",
                               "emoji": "icons_images", "badge": "icons_images",
                               "anim": "animations", "sound": "sounds_media",
                               "tone": "sounds_media", "video": "sounds_media",
                               "font": "fonts"}
                cat = next((kind_to_cat[k] for k in sorted(kinds) if k in kind_to_cat), None)
                p_cat = parts[app]["categories"].get(cat, {}).get("count", 0) if cat else 0
                rec["asset_kinds"] = sorted(kinds)
                if hits:
                    rec["match"] = "strong"
                    rec["match_keywords"] = hits
                elif p_cat:
                    rec["match"] = "category-only"
                    rec["match_category"] = cat
                    rec["match_category_count"] = p_cat
                else:
                    rec["match"] = "none"
                    rec["match_category"] = cat
            elif asset and not app:
                rec["match"] = "unknown-source"
            else:
                rec["match"] = "n/a-logic"
            re_items.append(rec)

    # ---- screens ----
    # Whole-word rules (normalized). NOTE: إشعار (notification) must NOT match شعار (logo),
    # and خطأ/خطط must NOT match خط — hence token matching, not substring.
    NEED_WORDS = [
        ("map", {"خريطه", "موقع", "مواقع"}),
        ("avatar", {"افاتار"}),
        ("emoji", {"ايموجي", "ملصق", "ملصقات", "دردشه", "محادثه", "رسائل", "ستيكر"}),
        ("animation", {"احتفال", "مكافاه", "مكافات", "حركه", "لعبه", "تفاعل"}),
        ("audio", {"صوت", "نغمه", "جرس"}),
        ("illustration", {"ترحيب", "تعريف", "توضيح", "اقلاع", "ارشاد"}),
        ("logo", {"شعار"}),
    ]
    NEED_PHRASES = [("avatar", ["صوره رمزيه", "ملف طفل", "ملفات الاطفال", "صوره الطفل"])]
    def screen_need(name, purpose):
        t = name + " " + purpose
        toks = _ar_tokens(t)
        nt = _norm_ar(t)
        for need, words in NEED_WORDS:
            if toks & words:
                return need
        for need, phrases in NEED_PHRASES:
            if any(p in nt for p in phrases):
                return need
        return "generic-icons"

    def need_available(need):
        """(available_bool, evidence, basket) over the whole index."""
        if need == "generic-icons":
            return True, "أيقونات عامة متوفرة في كل التطبيقات (مثال: 899 في تيليجرام)", "B"
        if need == "map":
            hits = [a for a, names in corpus.items() if any("map" in n for n in names)]
            return bool(hits), f"أمثلة map_pin في: {', '.join(hits) or 'لا شيء في العينات'}", "B"
        if need == "avatar":
            # qustodio-kids avatar_1..6 are that app's own character art (basket C):
            # a pattern exists, but no directly reusable generic avatar — new set needed.
            return False, "أفاتارات qustodio-kids ‏(avatar_1..6)‏ هوية خاصة بالتطبيق (السلة ج) — تُصمَّم أفاتارات Family OS جديدة؛ لا أفاتار عام قابل لإعادة الاستخدام المباشرة", "C"
        if need == "emoji":
            return True, "تيليجرام: emoji.pack (3.5MB) + 57 webp؛ raw فيه 336 Lottie JSON", "B"
        if need == "animation":
            total_anim = sum(p["categories"]["animations"]["count"] for p in parts.values())
            return total_anim > 0, f"حركات مجمّعة: {total_anim} — حركات AppCompat العامة (B) متوفرة؛ أما 336 Lottie في تيليجرام فأغلبها رسوم خاصة بتيليجرام وتحتاج مراجعة (قد تكون C)", "B"
        if need == "audio":
            total_audio = sum(audio_counts.values())
            known = any(parts[a].get("raw_breakdown") for a in parts)
            return total_audio > 0, f"ملفات صوتية مؤكدة: {total_audio} (تيليجرام 10 mp3 + 2 wav؛ بقية التطبيقات بلا تفصيل raw)", "B"
        if need == "illustration":
            return False, "رسوم توضيحية/شاشات ترحيب بهوية التطبيق المصدر = السلة ج — تُعاد صياغتها بهوية Family OS، لا يوجد أصل عام مقابل", "C"
        if need == "logo":
            return False, "شعار بهوية التطبيق المصدر = السلة ج — يُعاد تصميمه، لا يُنسخ", "C"
        return False, "غير مصنف", "?"

    screens = []
    for sys_id, rel in SYSTEMS:
        path = os.path.join(spec_base, rel)
        for s in extract_screens(path):
            need = screen_need(s["name"], s["purpose"])
            avail, ev, basket = need_available(need)
            screens.append({"system": sys_id, "id": s["id"], "name": s["name"],
                            "need": need, "asset_available": avail,
                            "evidence": ev, "basket": basket,
                            "gap": (not avail)})

    # ---- summary ----
    re_total = len(re_items)
    re_logic = sum(1 for r in re_items if r["kind"] == "logic")
    re_asset = re_total - re_logic
    re_strong = sum(1 for r in re_items if r.get("match") == "strong")
    re_catonly = sum(1 for r in re_items if r.get("match") == "category-only")
    re_none = sum(1 for r in re_items if r.get("match") == "none")
    re_unknown = sum(1 for r in re_items if r.get("match") == "unknown-source")
    scr_total = len(screens)
    gap_b = [s for s in screens if s["gap"]]
    per_system = {}
    for sys_id, _ in SYSTEMS:
        per_system[sys_id] = {
            "re_total": sum(1 for r in re_items if r["system"] == sys_id),
            "re_logic": sum(1 for r in re_items if r["system"] == sys_id and r["kind"] == "logic"),
            "re_asset": sum(1 for r in re_items if r["system"] == sys_id and r["kind"] == "asset"),
            "re_matched": sum(1 for r in re_items if r["system"] == sys_id and r.get("match") in ("strong", "category-only")),
            "re_gap_a": sum(1 for r in re_items if r["system"] == sys_id and r.get("match") == "none"),
            "screens": sum(1 for s in screens if s["system"] == sys_id),
            "gap_b": sum(1 for s in screens if s["system"] == sys_id and s["gap"]),
        }

    summary = {
        "totals": totals, "cat_totals": cat_totals,
        "per_app": {a: {"total_files": p["total_files"], "total_size_kb": p["total_size_kb"],
                        "categories": {c: v["count"] for c, v in p["categories"].items()}}
                    for a, p in parts.items()},
        "re": {"total": re_total, "logic": re_logic, "asset": re_asset,
               "matched_strong": re_strong, "matched_category_only": re_catonly,
               "gap_a_none": re_none, "unknown_source": re_unknown},
        "screens": {"total": scr_total, "gap_b": len(gap_b)},
        "per_system": per_system,
        "audio_counts_exact_where_known": audio_counts,
    }
    json.dump(re_items, open(os.path.join(out, "re_items.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump(screens, open(os.path.join(out, "screens.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump(summary, open(os.path.join(out, "summary.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print("TOTALS", totals)
    print("CAT", cat_totals)
    print("RE", summary["re"])
    print("SCREENS total", scr_total, "gap_b", len(gap_b))
    print("PER_SYSTEM")
    for k, v in per_system.items():
        print(" ", k, v)
    print("\nGAP A (asset RE, match=none):")
    for r in re_items:
        if r.get("match") == "none":
            print(" ", r["system"], "|", r["source_raw"], "|", r["mechanism"][:110])
    print("\nGAP A unknown-source:")
    for r in re_items:
        if r.get("match") == "unknown-source":
            print(" ", r["system"], "|", r["source_raw"], "|", r["mechanism"][:110])
    print("\nASSET RE rows (all):")
    for r in re_items:
        if r["kind"] == "asset":
            print(" ", r["system"], "|", r["source_app"], "|", r.get("match"), "|", r["mechanism"][:100])
    print("\nGAP B screens:")
    for s in gap_b:
        print(" ", s["system"], s["id"], s["name"], "| need:", s["need"], "|", s["evidence"][:90])
    print("\nSCREEN NEED histogram:")
    from collections import Counter
    print(" ", Counter(s["need"] for s in screens))

if __name__ == "__main__":
    main()
