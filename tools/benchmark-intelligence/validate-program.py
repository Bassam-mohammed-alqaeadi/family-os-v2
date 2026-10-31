#!/usr/bin/env python3
"""
BIP Verification Tool — أداة التحقق الآلي لبرنامج الجرد والصهر
Family OS (عائلتي) — BIP-01 / D-039

Validates:
1. JSON syntax across all BIP registries and pilot files.
2. Draft-7 Schema conformity for all schemas.
3. Schema conformity of all records against their respective schemas.
4. Global uniqueness of all identifiers (SRC, RES, EVD, REL, FUS, REP).
5. Referential integrity between sources, resources, evidence, and relationships.
6. Existence of referenced source files on disk.
7. Absence of duplicate source records.
8. Status values and quality gate constraints.
"""

import os
import sys
import json
import glob
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("FATAL: jsonschema library is required. Run in environment with jsonschema.")
    sys.exit(1)

WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
BIP_ROOT = WORKSPACE_ROOT / "spec" / "01-foundation" / "benchmark-intelligence"
SCHEMAS_DIR = BIP_ROOT / "schemas"
TEMPLATES_DIR = BIP_ROOT / "templates"
PILOTS_DIR = BIP_ROOT / "pilots"
INVENTORIES_DIR = BIP_ROOT / "inventories"
SYNTHESIS_DIR = BIP_ROOT / "synthesis"

class BIPValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.schemas = {}
        self.source_records = {}       # id -> record
        self.resource_records = {}     # id -> record
        self.evidence_records = {}     # id -> record
        self.relationship_records = {} # id -> record
        self.fusion_records = {}       # id -> record
        self.report_records = {}       # id -> record
        self.source_paths = set()

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

    def load_schemas(self):
        print("\n🔍 1. التحقق من صحة مخططات JSON Schemas (Draft-7)...")
        schema_files = glob.glob(str(SCHEMAS_DIR / "*.json"))
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
        reg_path = BIP_ROOT / "reference-registry.json"
        if not reg_path.exists():
            self.log_error(f"Missing reference-registry.json at {reg_path}")
            return

        data = self.load_json(reg_path)
        if not data:
            return

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

            source_path = app.get("source_path")
            if source_path:
                full_source = WORKSPACE_ROOT / source_path
                # For non-decompiled (notebooklm), the directory might be inside spec/
                if not full_source.exists():
                    self.log_warning(f"App source_path does not exist yet on disk: {source_path}")
                else:
                    self.log_info(f"App registered & path exists: {app_id} -> {source_path}")

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
            tpl_path = TEMPLATES_DIR / t_name
            if not tpl_path.exists():
                self.log_error(f"Missing template file: {t_name}")
                continue
            tpl_data = self.load_json(tpl_path)
            if not tpl_data:
                continue
            try:
                jsonschema.validate(instance=tpl_data, schema=self.schemas[s_name])
                self.log_info(f"Template matches schema: {t_name}")
            except Exception as e:
                self.log_error(f"Template {t_name} failed schema {s_name}: {e}")

    def collect_and_validate_records(self):
        print("\n🔍 4. فحص السجلات التجريبية وسجلات الجرد (Records Validation)...")
        # Search all json files in pilots, inventories, synthesis
        search_dirs = [PILOTS_DIR, INVENTORIES_DIR, SYNTHESIS_DIR]
        all_json_files = []
        for d in search_dirs:
            if d.exists():
                all_json_files.extend(glob.glob(str(d / "**" / "*.json"), recursive=True))

        for jf in all_json_files:
            data = self.load_json(jf)
            if not data:
                continue

            records = data if isinstance(data, list) else [data]
            for rec in records:
                self._index_and_validate_single_record(rec, jf)

    def _index_and_validate_single_record(self, rec, file_source):
        # Determine record type by key fields
        if "source_id" in rec and "sha256" in rec:
            sid = rec["source_id"]
            if sid in self.source_records:
                self.log_error(f"Duplicate source_id '{sid}' found in {file_source}")
            self.source_records[sid] = rec
            # Check schema
            self._validate_against_schema(rec, "source-record.schema.json", file_source)
            # Check duplicate file path
            fpath = rec.get("file_path")
            if fpath in self.source_paths:
                self.log_error(f"Duplicate file_path in source records: {fpath}")
            self.source_paths.add(fpath)
            # Check physical file exists on disk
            full_disk_path = WORKSPACE_ROOT / fpath
            if not full_disk_path.exists():
                self.log_error(f"Physical file missing on disk for {sid}: {fpath}")
            else:
                # Verify size
                actual_sz = full_disk_path.stat().st_size
                if rec.get("size_bytes") != actual_sz:
                    self.log_error(f"Size mismatch for {sid}: record says {rec.get('size_bytes')}, disk has {actual_sz}")

        elif "resource_id" in rec and "category" in rec:
            rid = rec["resource_id"]
            if rid in self.resource_records:
                self.log_error(f"Duplicate resource_id '{rid}' found in {file_source}")
            self.resource_records[rid] = rec
            self._validate_against_schema(rec, "resource-record.schema.json", file_source)

        elif "evidence_id" in rec and "tag_type" in rec:
            eid = rec["evidence_id"]
            if eid in self.evidence_records:
                self.log_error(f"Duplicate evidence_id '{eid}' found in {file_source}")
            self.evidence_records[eid] = rec
            self._validate_against_schema(rec, "evidence-record.schema.json", file_source)
            # Check file part of location_ref exists
            loc = rec.get("location_ref", "")
            loc_file = loc.split("#")[0].strip()
            if loc_file and not (WORKSPACE_ROOT / loc_file).exists():
                self.log_error(f"Evidence location file missing on disk for {eid}: {loc_file}")

        elif "relationship_id" in rec and "relationship_type" in rec:
            rel_id = rec["relationship_id"]
            if rel_id in self.relationship_records:
                self.log_error(f"Duplicate relationship_id '{rel_id}' found in {file_source}")
            self.relationship_records[rel_id] = rec
            self._validate_against_schema(rec, "relationship-record.schema.json", file_source)

        elif "decision_id" in rec and "reuse_pattern" in rec:
            did = rec["decision_id"]
            if did in self.fusion_records:
                self.log_error(f"Duplicate decision_id '{did}' found in {file_source}")
            self.fusion_records[did] = rec
            self._validate_against_schema(rec, "fusion-decision.schema.json", file_source)

        elif "report_id" in rec and "inventory_summary" in rec:
            rep_id = rec["report_id"]
            if rep_id in self.report_records:
                self.log_error(f"Duplicate report_id '{rep_id}' found in {file_source}")
            self.report_records[rep_id] = rec
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
        except Exception as e:
            self.log_error(f"Record failed schema {schema_name} in {file_source}: {e.message}")

    def validate_referential_integrity(self):
        print("\n🔍 5. التحقق من سلامة العلاقات والتكامل الإحالي (Referential Integrity)...")
        # 1. Resource -> Sources & Evidence
        for rid, res in self.resource_records.items():
            for sref in res.get("source_refs", []):
                if sref not in self.source_records:
                    self.log_error(f"Resource {rid} references non-existent source {sref}")
            for eref in res.get("evidence_refs", []):
                if eref not in self.evidence_records:
                    self.log_error(f"Resource {rid} references non-existent evidence {eref}")

        # 2. Evidence -> Source
        for eid, evd in self.evidence_records.items():
            s_id = evd.get("source_id")
            if s_id and s_id not in self.source_records:
                self.log_error(f"Evidence {eid} references non-existent source {s_id}")

        # 3. Relationships -> Resources
        for rel_id, rel in self.relationship_records.items():
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
        for did, fus in self.fusion_records.items():
            for rref in fus.get("source_resource_refs", []):
                if rref not in self.resource_records:
                    self.log_error(f"Fusion decision {did} references missing resource {rref}")

        # 5. Check orphan sources in pilots
        referenced_sources = set()
        for res in self.resource_records.values():
            referenced_sources.update(res.get("source_refs", []))
        for evd in self.evidence_records.values():
            if evd.get("source_id"):
                referenced_sources.add(evd.get("source_id"))

        unreferenced = set(self.source_records.keys()) - referenced_sources
        if unreferenced:
            self.log_warning(f"Sources cataloged without resource/evidence linkage: {unreferenced}")
        else:
            self.log_info("All cataloged sources are properly linked to resources and evidence!")

    def run(self):
        print("=" * 70)
        print("🚀 بدء الفحص الآلي المستقل لبرنامج الجرد والصهر BIP Validator")
        print("=" * 70)

        self.load_schemas()
        self.validate_reference_registry()
        self.validate_templates()
        self.collect_and_validate_records()
        self.validate_referential_integrity()

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

        if self.errors:
            print("\n❌ فشل التحقق الآلي! يرجى تصحيح الأخطاء أعلاه.")
            return False
        else:
            print("\n✅ اجتاز برنامج الجرد والصهر الفحص الآلي بنجاح تام 100%!")
            return True

if __name__ == "__main__":
    validator = BIPValidator()
    success = validator.run()
    sys.exit(0 if success else 1)
