#!/usr/bin/env python3
"""
BIP Verification Tool — أداة التحقق الآلي لبرنامج الجرد والصهر
Family OS (عائلتي) — BIP-01 / D-039

Validates:
1. JSON syntax across all BIP registries, schemas, templates, and data files.
2. Draft-7 Schema conformity for all schemas in schemas/.
3. Schema conformity of all records against their respective schemas.
4. Schema conformity and manifest consistency of reference-registry.json.
5. Path safety: guards against path traversal (..), absolute paths, and workspace escapes.
6. Cryptographic SHA-256 hashes and exact byte sizes against files on disk.
7. Line locator bounds (#L<start>-L<end>) against actual line counts of target files.
8. Global uniqueness of all identifiers (SRC, RES, EVD, REL, FUS, REP).
9. Referential integrity between sources, resources, evidence, relationships, and fusion decisions.
10. Dynamic recalculation of application-report.json summaries against underlying records.
"""

import os
import sys
import json
import glob
import re
import hashlib
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("FATAL: jsonschema library is required. Install via pip install jsonschema>=4.0.0")
    sys.exit(1)


class BIPValidator:
    def __init__(self, workspace_root=None, strict=False):
        if workspace_root:
            self.workspace_root = Path(workspace_root).resolve()
        else:
            self.workspace_root = Path(__file__).resolve().parents[2]

        self.strict = strict
        self.bip_root = self.workspace_root / "spec" / "01-foundation" / "benchmark-intelligence"
        self.schemas_dir = self.bip_root / "schemas"
        self.templates_dir = self.bip_root / "templates"
        self.pilots_dir = self.bip_root / "pilots"
        self.inventories_dir = self.bip_root / "inventories"
        self.synthesis_dir = self.bip_root / "synthesis"

        self.errors = []
        self.warnings = []
        self.schemas = {}

        # Index stores
        self.source_records = {}       # id -> (record, file_source)
        self.resource_records = {}     # id -> (record, file_source)
        self.evidence_records = {}     # id -> (record, file_source)
        self.relationship_records = {} # id -> (record, file_source)
        self.fusion_records = {}       # id -> (record, file_source)
        self.report_records = {}       # id -> (record, file_source)

        self.source_paths = {}         # path -> source_id

    def log_error(self, message):
        self.errors.append(f"[ERROR] {message}")
        print(f"  ❌ {message}")

    def log_warning(self, message):
        self.warnings.append(f"[WARN] {message}")
        print(f"  ⚠️ {message}")

    def log_info(self, message):
        print(f"  ℹ️ {message}")

    def load_json(self, path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            self.log_error(f"Failed to read/parse JSON at {path}: {e}")
            return None

    def check_path_traversal(self, path_str, context="path"):
        """Ensures a path does not contain traversal segments or escape workspace."""
        if not path_str:
            self.log_error(f"Empty {context} provided.")
            return False

        normalized = path_str.replace("\\", "/")
        parts = normalized.split("/")
        if ".." in parts:
            self.log_error(f"Path traversal detected in {context}: '{path_str}' contains '..'")
            return False

        if path_str.startswith("/") or (len(path_str) > 1 and path_str[1] == ":"):
            # Absolute path
            resolved = Path(path_str).resolve()
        else:
            resolved = (self.workspace_root / path_str).resolve()

        try:
            resolved.relative_to(self.workspace_root)
        except ValueError:
            self.log_error(f"Path escapes workspace root in {context}: '{path_str}'")
            return False

        return True

    def calculate_sha256(self, file_path):
        """Calculates real SHA-256 of a physical file on disk."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    def count_file_lines(self, file_path):
        """Counts total lines in a text file."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return sum(1 for _ in f)
        except Exception:
            return 0

    def load_schemas(self):
        print("\n🔍 1. التحقق من صحة مخططات JSON Schemas (Draft-7)...")
        if not self.schemas_dir.exists():
            self.log_error(f"Schemas directory not found: {self.schemas_dir}")
            return

        schema_files = glob.glob(str(self.schemas_dir / "*.json"))
        if not schema_files:
            self.log_error("No JSON schemas found in schemas directory!")
            return

        for sf in schema_files:
            data = self.load_json(sf)
            if data is None:
                continue
            name = Path(sf).name
            try:
                jsonschema.Draft7Validator.check_schema(data)
                self.schemas[name] = data
                self.log_info(f"Schema valid: {name}")
            except Exception as e:
                self.log_error(f"Schema check failed for {name}: {e}")

    def validate_reference_registry(self):
        print("\n🔍 2. التحقق من سجل المراجع (reference-registry.json)...")
        reg_path = self.bip_root / "reference-registry.json"
        if not reg_path.exists():
            self.log_error(f"Missing reference-registry.json at {reg_path}")
            return

        data = self.load_json(reg_path)
        if not data:
            return

        # Validate against schema
        if "reference-registry.schema.json" in self.schemas:
            try:
                jsonschema.validate(instance=data, schema=self.schemas["reference-registry.schema.json"])
                self.log_info("reference-registry.json matches reference-registry.schema.json")
            except jsonschema.ValidationError as e:
                self.log_error(f"reference-registry.json schema validation failed: {e.message}")
        else:
            self.log_warning("reference-registry.schema.json not loaded; skipping schema check")

        apps = data.get("applications", [])
        if len(apps) != 9:
            self.log_error(f"Expected 9 applications in reference registry, found {len(apps)}")

        seen_app_ids = set()
        for app in apps:
            app_id = app.get("app_id")
            if not app_id:
                self.log_error("Application record missing app_id")
                continue
            if app_id in seen_app_ids:
                self.log_error(f"Duplicate app_id in reference registry: {app_id}")
            seen_app_ids.add(app_id)

            # Check path safety and physical existence
            source_path = app.get("source_path")
            if source_path:
                if not self.check_path_traversal(source_path, f"app {app_id} source_path"):
                    continue
                full_source = self.workspace_root / source_path
                if not full_source.exists():
                    self.log_warning(f"App source_path does not exist yet on disk: {source_path}")

            analysis_type = app.get("analysis_type")
            if analysis_type == "decompiled_apk":
                manifest_path = app.get("manifest_path")
                pkg_name = app.get("package_name")

                if not manifest_path:
                    self.log_error(f"decompiled_apk application '{app_id}' missing manifest_path")
                    continue
                if not pkg_name:
                    self.log_error(f"decompiled_apk application '{app_id}' missing package_name")
                    continue

                if not self.check_path_traversal(manifest_path, f"app {app_id} manifest_path"):
                    continue

                full_manifest = self.workspace_root / manifest_path
                if not full_manifest.exists():
                    self.log_error(f"Manifest missing on disk for '{app_id}': {manifest_path}")
                else:
                    # Check manifest package matches package_name
                    try:
                        tree = ET.parse(full_manifest)
                        root = tree.getroot()
                        actual_pkg = root.attrib.get("package")
                        if actual_pkg != pkg_name:
                            self.log_error(
                                f"Package name mismatch for '{app_id}': "
                                f"registry says '{pkg_name}', AndroidManifest has '{actual_pkg}'"
                            )
                        else:
                            self.log_info(f"Verified package name for '{app_id}': {pkg_name}")
                    except Exception as e:
                        self.log_error(f"Failed to parse XML manifest for '{app_id}' at {manifest_path}: {e}")

    def validate_templates(self):
        print("\n🔍 3. التحقق من مطابقة القوالب (Templates Validation)...")
        pairs = [
            ("source-record.schema.json", "source-record.template.json"),
            ("resource-record.schema.json", "resource-record.template.json"),
            ("evidence-record.schema.json", "evidence-record.template.json"),
            ("relationship-record.schema.json", "relationship-record.template.json"),
            ("fusion-decision.schema.json", "fusion-decision.template.json"),
            ("application-report.schema.json", "application-report.template.json"),
        ]
        for s_name, t_name in pairs:
            if s_name not in self.schemas:
                self.log_error(f"Cannot validate template {t_name}: schema {s_name} missing")
                continue
            tpl_path = self.templates_dir / t_name
            if not tpl_path.exists():
                self.log_error(f"Missing template file: {t_name}")
                continue
            tpl_data = self.load_json(tpl_path)
            if not tpl_data:
                continue
            try:
                jsonschema.validate(instance=tpl_data, schema=self.schemas[s_name])
                self.log_info(f"Template matches schema: {t_name}")
            except jsonschema.ValidationError as e:
                self.log_error(f"Template {t_name} failed schema {s_name}: {e.message}")

    def collect_and_validate_records(self):
        print("\n🔍 4. فحص السجلات التجريبية وسجلات الجرد (Records Validation)...")
        search_dirs = [self.pilots_dir, self.inventories_dir, self.synthesis_dir]
        all_json_files = []
        for d in search_dirs:
            if d.exists():
                all_json_files.extend(glob.glob(str(d / "**" / "*.json"), recursive=True))

        for jf in sorted(all_json_files):
            # Skip schemas or templates if accidentally placed in search dirs
            p = Path(jf)
            if "schemas" in p.parts or "templates" in p.parts:
                continue

            data = self.load_json(jf)
            if not data:
                continue

            records = data if isinstance(data, list) else [data]
            for rec in records:
                if isinstance(rec, dict):
                    self._index_and_validate_single_record(rec, jf)

    def _index_and_validate_single_record(self, rec, file_source):
        # 1. Source record
        if "source_id" in rec and "sha256" in rec:
            sid = rec["source_id"]
            if sid in self.source_records:
                self.log_error(f"Duplicate source_id '{sid}' found in {file_source}")
            self.source_records[sid] = (rec, file_source)
            self._validate_against_schema(rec, "source-record.schema.json", file_source)

            # Check duplicate file path
            fpath = rec.get("file_path")
            if not self.check_path_traversal(fpath, f"source {sid} file_path"):
                return

            if fpath in self.source_paths:
                prev_sid = self.source_paths[fpath]
                self.log_error(f"Duplicate file_path in source records: '{fpath}' in {sid} and {prev_sid}")
            self.source_paths[fpath] = sid

            # Physical file validation
            full_disk_path = self.workspace_root / fpath
            if not full_disk_path.exists():
                self.log_error(f"Physical file missing on disk for {sid}: {fpath}")
            else:
                # Actual size
                actual_sz = full_disk_path.stat().st_size
                rec_sz = rec.get("size_bytes")
                if rec_sz != actual_sz:
                    self.log_error(
                        f"Size mismatch for {sid}: record says {rec_sz} bytes, disk has {actual_sz} bytes"
                    )

                # Actual SHA-256
                actual_sha = self.calculate_sha256(full_disk_path)
                rec_sha = rec.get("sha256", "").lower()
                if rec_sha != actual_sha.lower():
                    self.log_error(
                        f"SHA-256 mismatch for {sid} ({fpath}):\n"
                        f"    record: {rec_sha}\n"
                        f"    actual: {actual_sha}"
                    )
                else:
                    self.log_info(f"Verified SHA-256 & size for {sid}: {actual_sz} bytes, {actual_sha[:12]}...")

        # 2. Resource record
        elif "resource_id" in rec and "category" in rec:
            rid = rec["resource_id"]
            if rid in self.resource_records:
                self.log_error(f"Duplicate resource_id '{rid}' found in {file_source}")
            self.resource_records[rid] = (rec, file_source)
            self._validate_against_schema(rec, "resource-record.schema.json", file_source)

        # 3. Evidence record
        elif "evidence_id" in rec and "tag_type" in rec:
            eid = rec["evidence_id"]
            if eid in self.evidence_records:
                self.log_error(f"Duplicate evidence_id '{eid}' found in {file_source}")
            self.evidence_records[eid] = (rec, file_source)
            self._validate_against_schema(rec, "evidence-record.schema.json", file_source)

            # Location ref validation
            loc = rec.get("location_ref", "")
            if "#" in loc:
                loc_file, line_spec = loc.split("#", 1)
            else:
                loc_file, line_spec = loc, ""

            loc_file = loc_file.strip()
            if not self.check_path_traversal(loc_file, f"evidence {eid} location_ref"):
                return

            full_loc_file = self.workspace_root / loc_file
            if not full_loc_file.exists():
                self.log_error(f"Evidence location file missing on disk for {eid}: {loc_file}")
            else:
                # Check line locator bounds
                if line_spec:
                    total_lines = self.count_file_lines(full_loc_file)
                    # Support formats: L1-L20, L337, L337-L337
                    m = re.match(r"^L(\d+)(?:-L(\d+))?$", line_spec)
                    if m:
                        start_line = int(m.group(1))
                        end_line = int(m.group(2)) if m.group(2) else start_line
                        if start_line < 1:
                            self.log_error(f"Invalid line locator start for {eid}: {start_line} < 1")
                        elif end_line < start_line:
                            self.log_error(f"Invalid line range for {eid}: end {end_line} < start {start_line}")
                        elif end_line > total_lines:
                            self.log_error(
                                f"Line locator out of bounds for {eid}: #{line_spec} exceeds total lines ({total_lines}) in {loc_file}"
                            )
                        else:
                            self.log_info(f"Verified line locator for {eid}: #{line_spec} (file has {total_lines} lines)")
                    else:
                        self.log_warning(f"Unusual line locator format for {eid}: #{line_spec}")

        # 4. Relationship record
        elif "relationship_id" in rec and "relationship_type" in rec:
            rel_id = rec["relationship_id"]
            if rel_id in self.relationship_records:
                self.log_error(f"Duplicate relationship_id '{rel_id}' found in {file_source}")
            self.relationship_records[rel_id] = (rec, file_source)
            self._validate_against_schema(rec, "relationship-record.schema.json", file_source)

        # 5. Fusion decision record
        elif "decision_id" in rec and "reuse_pattern" in rec:
            did = rec["decision_id"]
            if did in self.fusion_records:
                self.log_error(f"Duplicate decision_id '{did}' found in {file_source}")
            self.fusion_records[did] = (rec, file_source)
            self._validate_against_schema(rec, "fusion-decision.schema.json", file_source)

        # 6. Application report record
        elif "report_id" in rec and "inventory_summary" in rec:
            rep_id = rec["report_id"]
            if rep_id in self.report_records:
                self.log_error(f"Duplicate report_id '{rep_id}' found in {file_source}")
            self.report_records[rep_id] = (rec, file_source)
            self._validate_against_schema(rec, "application-report.schema.json", file_source)

        else:
            self.log_warning(f"Unrecognized record format in {file_source}")

    def _validate_against_schema(self, instance, schema_name, file_source):
        schema = self.schemas.get(schema_name)
        if not schema:
            self.log_error(f"Cannot validate record: Schema {schema_name} not loaded")
            return
        try:
            jsonschema.validate(instance=instance, schema=schema)
        except jsonschema.ValidationError as e:
            self.log_error(f"Record failed schema {schema_name} in {file_source}: {e.message}")

    def validate_referential_integrity(self):
        print("\n🔍 5. التحقق من سلامة العلاقات والتكامل الإحالي (Referential Integrity)...")
        # 1. Resource -> Sources & Evidence
        for rid, (res, src_file) in self.resource_records.items():
            for sref in res.get("source_refs", []):
                if sref not in self.source_records:
                    self.log_error(f"Resource {rid} in {src_file} references non-existent source {sref}")
            for eref in res.get("evidence_refs", []):
                if eref not in self.evidence_records:
                    self.log_error(f"Resource {rid} in {src_file} references non-existent evidence {eref}")

        # 2. Evidence -> Source
        for eid, (evd, src_file) in self.evidence_records.items():
            s_id = evd.get("source_id")
            if s_id and s_id not in self.source_records:
                self.log_error(f"Evidence {eid} in {src_file} references non-existent source {s_id}")

        # 3. Relationships -> Resources & Evidence
        for rel_id, (rel, src_file) in self.relationship_records.items():
            src_res = rel.get("source_resource_id")
            tgt_res = rel.get("target_resource_id")
            if src_res not in self.resource_records:
                self.log_error(f"Relationship {rel_id} references missing source_resource {src_res}")
            if tgt_res not in self.resource_records:
                self.log_error(f"Relationship {rel_id} references missing target_resource {tgt_res}")
            for eref in rel.get("evidence_refs", []):
                if eref not in self.evidence_records:
                    self.log_error(f"Relationship {rel_id} references missing evidence {eref}")

        # 4. Fusion Decisions -> Resources
        for did, (fus, src_file) in self.fusion_records.items():
            for rref in fus.get("source_resource_refs", []):
                if rref not in self.resource_records:
                    self.log_error(f"Fusion decision {did} references missing resource {rref}")

        # 5. Check orphan sources
        referenced_sources = set()
        for res, _ in self.resource_records.values():
            referenced_sources.update(res.get("source_refs", []))
        for evd, _ in self.evidence_records.values():
            if evd.get("source_id"):
                referenced_sources.add(evd.get("source_id"))

        unreferenced = set(self.source_records.keys()) - referenced_sources
        if unreferenced:
            self.log_warning(f"Sources cataloged without resource/evidence linkage: {unreferenced}")
        else:
            self.log_info("All cataloged sources are properly linked to resources and evidence!")

    def validate_and_recalculate_reports(self):
        print("\n🔍 6. إعادة الحساب الديناميكي لتقارير التطبيقات (Dynamic Report Verification)...")
        for rep_id, (rep, rep_file) in self.report_records.items():
            app_id = rep.get("app_id")
            self.log_info(f"Verifying application report '{rep_id}' for app '{app_id}'...")

            # Filter records belonging to this app_id
            app_sources = [r for r, _ in self.source_records.values() if r.get("app_id") == app_id]
            app_resources = [r for r, _ in self.resource_records.values() if r.get("app_id") == app_id]
            app_evidence = [r for r, _ in self.evidence_records.values() if r.get("app_id") == app_id]
            app_relationships = [
                r for r, _ in self.relationship_records.values()
                if (r.get("source_resource_id", "").startswith(f"{app_id.upper()}-") or
                    r.get("source_resource_id") in [res["resource_id"] for res in app_resources])
            ]

            inv = rep.get("inventory_summary", {})
            # Check total files discovered
            expected_files = len(app_sources)
            if inv.get("total_files_discovered") != expected_files:
                self.log_error(
                    f"Report {rep_id} total_files_discovered mismatch: "
                    f"report says {inv.get('total_files_discovered')}, actual count is {expected_files}"
                )

            # Check total bytes
            expected_bytes = sum(s.get("size_bytes", 0) for s in app_sources)
            if inv.get("total_bytes") != expected_bytes:
                self.log_error(
                    f"Report {rep_id} total_bytes mismatch: "
                    f"report says {inv.get('total_bytes')}, actual sum is {expected_bytes}"
                )

            # Check t0_inventory_count
            if inv.get("t0_inventory_count") != expected_files:
                self.log_error(
                    f"Report {rep_id} t0_inventory_count mismatch: "
                    f"report says {inv.get('t0_inventory_count')}, actual count is {expected_files}"
                )

            # Check deepest level counts
            level_counts = {"T0": 0, "T1": 0, "T2": 0, "T3": 0}
            for s in app_sources:
                lvl = s.get("inspection_level") or s.get("deepest_level_reached") or "T0"
                if lvl in level_counts:
                    level_counts[lvl] += 1
            if inv.get("counts_by_deepest_level") != level_counts:
                self.log_error(
                    f"Report {rep_id} counts_by_deepest_level mismatch:\n"
                    f"    report: {inv.get('counts_by_deepest_level')}\n"
                    f"    actual: {level_counts}"
                )

            # Check storage tier counts
            storage_counts = {"git_tracked": 0, "local_only": 0}
            for s in app_sources:
                tier = s.get("storage_tier", "git_tracked")
                if tier in storage_counts:
                    storage_counts[tier] += 1
            if inv.get("counts_by_storage_tier") != storage_counts:
                self.log_error(
                    f"Report {rep_id} counts_by_storage_tier mismatch:\n"
                    f"    report: {inv.get('counts_by_storage_tier')}\n"
                    f"    actual: {storage_counts}"
                )

            # Check counts by type
            type_counts = {}
            for s in app_sources:
                st = s.get("file_type") or s.get("source_type")
                type_counts[st] = type_counts.get(st, 0) + 1
            if inv.get("counts_by_type") != type_counts:
                self.log_error(
                    f"Report {rep_id} counts_by_type mismatch:\n"
                    f"    report: {inv.get('counts_by_type')}\n"
                    f"    actual: {type_counts}"
                )

            # Check total resources cataloged
            res_sum = rep.get("resource_summary", {})
            if res_sum.get("total_resources_cataloged") != len(app_resources):
                self.log_error(
                    f"Report {rep_id} total_resources_cataloged mismatch: "
                    f"report says {res_sum.get('total_resources_cataloged')}, actual count is {len(app_resources)}"
                )

            # Check total evidence records
            evd_sum = rep.get("evidence_summary", {})
            if evd_sum.get("total_evidence_records") != len(app_evidence):
                self.log_error(
                    f"Report {rep_id} total_evidence_records mismatch: "
                    f"report says {evd_sum.get('total_evidence_records')}, actual count is {len(app_evidence)}"
                )

            # Check evidence tag counts
            tag_counts = {"REF": 0, "ASSUMPTION": 0, "PENDING-REF": 0, "PARTIAL-EVIDENCE": 0}
            for e in app_evidence:
                tag = e.get("tag_type")
                if tag in tag_counts:
                    tag_counts[tag] += 1
            if evd_sum.get("counts_by_tag") != tag_counts:
                self.log_error(
                    f"Report {rep_id} evidence counts_by_tag mismatch:\n"
                    f"    report: {evd_sum.get('counts_by_tag')}\n"
                    f"    actual: {tag_counts}"
                )

            # Check relationships summary
            rel_sum = rep.get("relationships_summary", {})
            if rel_sum.get("total_relationships") != len(app_relationships):
                self.log_error(
                    f"Report {rep_id} total_relationships mismatch: "
                    f"report says {rel_sum.get('total_relationships')}, actual count is {len(app_relationships)}"
                )

            self.log_info(f"Report {rep_id} recalculated successfully!")

    def run(self):
        print("=" * 70)
        print("🚀 بدء الفحص الآلي المستقل لبرنامج الجرد والصهر BIP Validator")
        print(f"   المستودع: {self.workspace_root}")
        print("=" * 70)

        self.load_schemas()
        self.validate_reference_registry()
        self.validate_templates()
        self.collect_and_validate_records()
        self.validate_referential_integrity()
        self.validate_and_recalculate_reports()

        print("\n" + "=" * 70)
        print("📊 ملخص نتائج التحقق الآلي:")
        print(f"  - سجلات المصادر (T0): {len(self.source_records)}")
        print(f"  - سجلات الموارد (T1-T3): {len(self.resource_records)}")
        print(f"  - سجلات الأدلة: {len(self.evidence_records)}")
        print(f"  - سجلات العلاقات: {len(self.relationship_records)}")
        print(f"  - قرارات الصهر: {len(self.fusion_records)}")
        print(f"  - تقارير التطبيقات: {len(self.report_records)}")
        print(f"  - إجمالي الأخطاء: {len(self.errors)}")
        print(f"  - إجمالي التحذيرات: {len(self.warnings)}")
        print("=" * 70)

        if self.errors or (self.strict and self.warnings):
            print("\n❌ فشل التحقق الآلي! يرجى تصحيح الأخطاء الموضحة أعلاه.")
            return False
        else:
            print("\n✅ اجتاز برنامج الجرد والصهر الفحص الآلي بنجاح تام 100%!")
            return True


def main():
    parser = argparse.ArgumentParser(description="BIP Verification Tool — Family OS (عائلتي)")
    parser.add_argument("--root", type=str, default=None, help="Root path of the repository workspace")
    parser.add_argument("--strict", action="store_true", help="Fail if any warning is encountered")
    args = parser.parse_args()

    validator = BIPValidator(workspace_root=args.root, strict=args.strict)
    success = validator.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
