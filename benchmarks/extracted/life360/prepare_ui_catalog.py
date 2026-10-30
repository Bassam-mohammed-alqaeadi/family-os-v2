import os
import glob
import json

svg_dir = r"benchmarks/extracted/life360/02_design_system_and_ui/svg_icons"
assets_dir = r"benchmarks/extracted/life360/02_design_system_and_ui/assets_catalog"

# 1. Collect SVGs
svg_files = []
for f in os.listdir(svg_dir):
    if f.endswith(".svg") and not f.startswith("$"):
        svg_files.append(f)

# Sort with Life360 specific ones first
life360_svgs = [f for f in svg_files if not f.startswith("abc_")]
abc_svgs = [f for f in svg_files if f.startswith("abc_")]
sorted_svgs = life360_svgs + abc_svgs

# 2. Collect Graphics & Illustrations
image_files = []
for f in os.listdir(assets_dir):
    ext = os.path.splitext(f)[1].lower()
    if ext in [".webp", ".png", ".jpg"] and not f.endswith(".9.png") and not f.startswith("abc_"):
        image_files.append(f)

print(f"Total usable SVGs: {len(sorted_svgs)} (Life360 specific: {len(life360_svgs)})")
print(f"Total Illustrations & Images: {len(image_files)}")

# Dump to JSON for easy embedding into dashboard
with open(r"benchmarks/extracted/life360/ui_catalog.json", "w", encoding="utf-8") as fp:
    json.dump({
        "svgs": sorted_svgs,
        "images": image_files
    }, fp, indent=2)
