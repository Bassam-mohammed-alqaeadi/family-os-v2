import os
import shutil
import xml.etree.ElementTree as ET
import json
import glob

raw_dir = r"c:\Users\bassa\Desktop\family-os-v2\benchmarks\extracted\telegram\_apktool_raw"
out_base = r"c:\Users\bassa\Desktop\family-os-v2\benchmarks\extracted\telegram"

manifest_in = os.path.join(raw_dir, "AndroidManifest.xml")
res_in = os.path.join(raw_dir, "res")

# 1. Manifest and Architecture
if os.path.exists(manifest_in):
    manifest_out_dir = os.path.join(out_base, "01_architecture_and_manifest")
    shutil.copy2(manifest_in, os.path.join(manifest_out_dir, "AndroidManifest.xml"))
    print("Manifest copied.")
    
    # Parse permissions and components
    try:
        tree = ET.parse(manifest_in)
        root = tree.getroot()
        ns = {'android': 'http://schemas.android.com/apk/res/android'}
        
        # Permissions
        permissions = []
        for p in root.findall('uses-permission'):
            name = p.attrib.get('{http://schemas.android.com/apk/res/android}name', '')
            if name:
                permissions.append(name)
        
        with open(os.path.join(manifest_out_dir, "permissions_audit.json"), "w", encoding="utf-8") as f:
            json.dump({"total_permissions": len(permissions), "permissions": permissions}, f, indent=2, ensure_ascii=False)
        print(f"Permissions audited: {len(permissions)}")
        
        # Components
        app_tag = root.find('application')
        activities = []
        services = []
        receivers = []
        providers = []
        
        if app_tag is not None:
            for act in app_tag.findall('activity'):
                activities.append(act.attrib.get('{http://schemas.android.com/apk/res/android}name', ''))
            for act in app_tag.findall('activity-alias'):
                activities.append(act.attrib.get('{http://schemas.android.com/apk/res/android}name', ''))
            for s in app_tag.findall('service'):
                services.append(s.attrib.get('{http://schemas.android.com/apk/res/android}name', ''))
            for r in app_tag.findall('receiver'):
                receivers.append(r.attrib.get('{http://schemas.android.com/apk/res/android}name', ''))
            for pr in app_tag.findall('provider'):
                providers.append(pr.attrib.get('{http://schemas.android.com/apk/res/android}name', ''))
                
        with open(os.path.join(manifest_out_dir, "components_catalog.md"), "w", encoding="utf-8") as f:
            f.write(f"# كتالوج مكونات وخدمات تطبيق Telegram المعمارية\n\n")
            f.write(f"- **إجمالي الأنشطة (Activities):** {len(activities)}\n")
            f.write(f"- **إجمالي الخدمات الخلفية (Services):** {len(services)}\n")
            f.write(f"- **إجمالي مستقبلات البث (Broadcast Receivers):** {len(receivers)}\n")
            f.write(f"- **إجمالي مزودات المحتوى (Content Providers):** {len(providers)}\n\n")
            
            f.write("## 1. الخدمات الخلفية الحيوية (Key Services)\n")
            for s in services:
                f.write(f"- `{s}`\n")
                
            f.write("\n## 2. مستقبلات البث والإشعارات (Receivers)\n")
            for r in receivers:
                f.write(f"- `{r}`\n")
                
            f.write("\n## 3. الأنشطة الرئيسية (Key Activities)\n")
            for act in activities[:30]:
                f.write(f"- `{act}`\n")
        print(f"Components catalog generated: {len(activities)} acts, {len(services)} services, {len(receivers)} receivers.")
    except Exception as e:
        print(f"Error parsing manifest: {e}")

# 2. Design System and UI Assets
ui_dir = os.path.join(out_base, "02_design_system_and_ui")
all_vectors_dir = os.path.join(ui_dir, "all_vector_drawables")
all_layouts_dir = os.path.join(ui_dir, "all_layouts")
illustrations_dir = os.path.join(ui_dir, "illustrations_high_res")
audio_dir = os.path.join(ui_dir, "audio_effects")
os.makedirs(all_vectors_dir, exist_ok=True)
os.makedirs(all_layouts_dir, exist_ok=True)
os.makedirs(illustrations_dir, exist_ok=True)
os.makedirs(audio_dir, exist_ok=True)

if os.path.exists(res_in):
    # Vector drawables
    vector_count = 0
    for root_dir, _, files in os.walk(res_in):
        if "drawable" in os.path.basename(root_dir):
            for file in files:
                full_path = os.path.join(root_dir, file)
                if file.endswith(".xml"):
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read(500)
                            if "<vector" in content or "pathData" in content:
                                dest = os.path.join(all_vectors_dir, file)
                                if not os.path.exists(dest):
                                    shutil.copy2(full_path, dest)
                                    vector_count += 1
                    except Exception:
                        pass
                elif file.endswith((".png", ".webp")) and not file.endswith(".9.png"):
                    dest = os.path.join(illustrations_dir, file)
                    if not os.path.exists(dest):
                        shutil.copy2(full_path, dest)
    print(f"Extracted {vector_count} vector drawables.")

    # Layouts
    layout_count = 0
    for root_dir, _, files in os.walk(res_in):
        if "layout" in os.path.basename(root_dir):
            for file in files:
                if file.endswith(".xml"):
                    full_path = os.path.join(root_dir, file)
                    dest = os.path.join(all_layouts_dir, file)
                    if not os.path.exists(dest):
                        shutil.copy2(full_path, dest)
                        layout_count += 1
    print(f"Extracted {layout_count} layout XMLs.")

    # Audio & Raw
    for root_dir, _, files in os.walk(res_in):
        if "raw" in os.path.basename(root_dir):
            for file in files:
                if file.endswith((".mp3", ".ogg", ".wav", ".aac")):
                    shutil.copy2(os.path.join(root_dir, file), os.path.join(audio_dir, file))
                    print(f"Extracted audio: {file}")

    # Colors
    colors_file = os.path.join(res_in, "values", "colors.xml")
    if os.path.exists(colors_file):
        try:
            tree = ET.parse(colors_file)
            c_root = tree.getroot()
            colors = {}
            for c in c_root.findall("color"):
                name = c.attrib.get("name", "")
                val = c.text
                if name and val:
                    colors[name] = val.strip()
            with open(os.path.join(ui_dir, "colors_and_theme.json"), "w", encoding="utf-8") as f:
                json.dump(colors, f, indent=2, ensure_ascii=False)
            print(f"Colors extracted: {len(colors)}")
        except Exception as e:
            print(f"Error extracting colors: {e}")

print("Processing complete.")
