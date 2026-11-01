import os
import sys
import json
import hashlib
import subprocess
from pathlib import Path
from collections import Counter

WORKSPACE_ROOT = Path(r"C:\Users\bassa\Desktop\family-os-v2").resolve()
TELEGRAM_DIR = WORKSPACE_ROOT / "benchmarks" / "extracted" / "telegram"
OUTPUT_DIR = WORKSPACE_ROOT / "spec" / "01-foundation" / "benchmark-intelligence" / "inventories" / "telegram"
ANALYSIS_DIR = OUTPUT_DIR / "analysis"

print("Starting Telegram Full Inventory Generation...")
print("Source dir:", TELEGRAM_DIR)
print("Output dir:", OUTPUT_DIR)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)

# 1. Load Git tracked files
git_cmd = subprocess.run(
    ["git", "ls-files", str(TELEGRAM_DIR)],
    capture_output=True, text=True, check=True, cwd=str(WORKSPACE_ROOT)
)
git_tracked_set = set(line.strip().replace("\\", "/") for line in git_cmd.stdout.splitlines() if line.strip())
print(f"Git tracked files count: {len(git_tracked_set)}")

# 2. Collect all regular files deterministically
all_disk_files = []
for root, dirs, files in os.walk(TELEGRAM_DIR):
    dirs.sort()
    for f in sorted(files):
        p = Path(root) / f
        rel = p.relative_to(WORKSPACE_ROOT).as_posix()
        all_disk_files.append((rel, p))

all_disk_files.sort(key=lambda x: x[0])
print(f"Total files on disk: {len(all_disk_files)}")

# 3. Verify git check-ignore for untracked files
untracked_rels = [rel for rel, p in all_disk_files if rel not in git_tracked_set]
proc = subprocess.run(
    ["git", "check-ignore", "--stdin"],
    input="\n".join(untracked_rels).encode("utf-8"),
    capture_output=True, cwd=str(WORKSPACE_ROOT)
)
ignored_set = set(line.strip().replace("\\", "/") for line in proc.stdout.decode("utf-8", errors="replace").splitlines() if line.strip())
untracked_unignored = [r for r in untracked_rels if r not in ignored_set]
if untracked_unignored:
    print(f"FATAL: {len(untracked_unignored)} files are untracked and NOT ignored!")
    sys.exit(1)
print(f"All {len(untracked_rels)} untracked files are verified in .gitignore (local_only).")

# 4. Helper to determine file_type according to source-record.schema.json
def get_file_type(name: str, ext: str, rel_path: str) -> str:
    ext_lower = ext.lower()
    if name == "AndroidManifest.xml":
        return "manifest"
    if ext_lower in ["java", "kt"]:
        return "source_code"
    if ext_lower == "xml":
        if "/layout" in rel_path or "/all_layouts" in rel_path or "/key_layouts" in rel_path:
            return "layout"
        if "/values" in rel_path:
            return "values"
        return "config"
    if ext_lower in ["png", "webp", "jpg", "jpeg", "gif"]:
        return "asset_image"
    if ext_lower in ["svg"]:
        return "asset_vector"
    if ext_lower in ["mp3", "wav", "ogg"]:
        return "asset_audio"
    if ext_lower in ["sql"]:
        return "database_schema"
    if ext_lower in ["so", "a"]:
        return "binary_so"
    if ext_lower in ["json", "properties", "version", "yml", "yaml", "textproto"]:
        return "config"
    if ext_lower in ["md", "txt", "html"]:
        return "documentation"
    return "other"

# 5. Build sources.json
sources = []
start_idx = 7 # Continuing strictly after TG-SRC-000006 from BIP-01

# Git blob fetcher
def get_git_blob_info(rel_path: str):
    cmd = subprocess.run(
        ["git", "cat-file", "-s", f"HEAD:{rel_path}"],
        capture_output=True, text=True, cwd=str(WORKSPACE_ROOT)
    )
    if cmd.returncode != 0:
        return None, None
    blob_sz = int(cmd.stdout.strip())

    cmd_bytes = subprocess.run(
        ["git", "cat-file", "-p", f"HEAD:{rel_path}"],
        capture_output=True, cwd=str(WORKSPACE_ROOT)
    )
    blob_sha = hashlib.sha256(cmd_bytes.stdout).hexdigest()
    return blob_sz, blob_sha

for idx, (rel, p) in enumerate(all_disk_files, start=start_idx):
    sid = f"TG-SRC-{idx:06d}"
    sz = p.stat().st_size
    raw_bytes = p.read_bytes()
    sha = hashlib.sha256(raw_bytes).hexdigest()

    name = p.name
    suffix = p.suffix
    ext = suffix[1:].lower() if suffix.startswith(".") else ""
    ftype = get_file_type(name, ext, rel)

    is_tracked = rel in git_tracked_set
    storage_tier = "git_tracked" if is_tracked else "local_only"
    fingerprint_basis = "disk_bytes_and_git_blob" if is_tracked else "disk_bytes_local"

    rec = {
        "source_id": sid,
        "app_id": "telegram",
        "file_path": rel,
        "file_name": name,
        "file_extension": ext,
        "file_type": ftype,
        "size_bytes": sz,
        "sha256": sha,
        "inspection_level": "T0",
        "status": "discovered",
        "storage_tier": storage_tier,
        "fingerprint_basis": fingerprint_basis
    }

    if is_tracked:
        blob_sz, blob_sha = get_git_blob_info(rel)
        if blob_sz is not None:
            rec["git_blob_size"] = blob_sz
            rec["git_blob_sha256"] = blob_sha

    sources.append(rec)

print(f"Generated {len(sources)} source records ({sources[0]['source_id']} to {sources[-1]['source_id']})")
with open(OUTPUT_DIR / "sources.json", "w", encoding="utf-8") as f:
    json.dump(sources, f, indent=2, ensure_ascii=False)

print("sources.json written successfully.")
