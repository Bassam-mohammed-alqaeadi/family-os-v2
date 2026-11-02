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
7. Git Blob verification for git_tracked files (git cat-file blob SHA-256 and size).
8. Storage tier classification (git_tracked vs local_only) and fingerprint_basis consistency.
9. Line locator bounds (#L<start>-L<end>) against actual line counts of target files.
10. Global uniqueness of all identifiers (SRC, RES, EVD, REL, FUS, REP).
11. Strict app_id consistency across resources, sources, evidence, and relationships.
12. Referential integrity between sources, resources, evidence, relationships, and fusion decisions.
13. Dynamic recalculation of application-report.json summaries against underlying records.
"""

import os
import sys
import json
import glob
import re
import hashlib
import argparse
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("FATAL: jsonschema library is required. Install via pip install jsonschema==4.25.1")
    sys.exit(1)


class BIPValidator:
    def __init__(self, workspace_root=None, strict=False, app_id=None):
        if workspace_root:
            self.workspace_root = Path(workspace_root).resolve()
        else:
            self.workspace_root = Path(__file__).resolve().parents[2]

        self.strict = strict
        self.target_app = app_id
        self.bip_root = self.workspace_root / "spec" / "01-foundation" / "benchmark-intelligence"
        self.schemas_dir = self.bip_root / "schemas"
        self.templates_dir = self.bip_root / "templates"
        self.pilots_dir = self.bip_root / "pilots"
        self.inventories_dir = self.bip_root / "inventories"
        self.synthesis_dir = self.bip_root / "synthesis"

        self.errors = []
        self.warnings = []
        self.info_messages = []
        self.schemas = {}
        self.validator_instances = {}

        # Index stores
        self.source_records = {}       # id -> (record, file_source)
        self.resource_records = {}     # id -> (record, file_source)
        self.evidence_records = {}     # id -> (record, file_source)
        self.relationship_records = {} # id -> (record, file_source)
        self.fusion_records = {}       # id -> (record, file_source)
        self.report_records = {}       # id -> (record, file_source)

        self.source_paths = {}         # path -> source_id
        self.source_paths_by_scope = {} # scope -> { path: source_id }
        self.sources_by_path = {}       # path -> list of (source_id, record, scope, file_source)

    def get_record_scope(self, file_source, record=None):
        """
        Determines the logical dataset scope for a record based on file_source and record properties.
        Returns strings like 'pilots/telegram', 'inventories/telegram', 'synthesis', or 'default'.
        """
        p = Path(file_source)
        parts = [part.replace("\\", "/") for part in p.parts]
        for idx, part in enumerate(parts):
            if part in ("pilots", "inventories"):
                if idx + 1 < len(parts):
                    return f"{part}/{parts[idx+1]}"
                return part
            elif part == "synthesis":
                return "synthesis"

        if record and isinstance(record, dict):
            app = record.get("app_id", "telegram")
            phase = record.get("program_phase")
            if record.get("pilot_flag") is True or phase == "BIP-01":
                return f"pilots/{app}"
            if record.get("pilot_flag") is False or (
                isinstance(phase, str) and phase.startswith("BIP-") and phase != "BIP-01"
            ):
                return f"inventories/{app}"

        return "default"

    def log_error(self, message):
        self.errors.append(f"[ERROR] {message}")
        print(f"  ❌ {message}")

    def log_warning(self, message):
        self.warnings.append(f"[WARN] {message}")
        print(f"  ⚠️ {message}")

    def log_info(self, message):
        self.info_messages.append(message)
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

    def _load_git_tracked_set(self):
        """Loads all git-tracked files in the workspace once into a set for O(1) lookups."""
        if hasattr(self, "_git_tracked_set"):
            return self._git_tracked_set
        try:
            cmd = ["git", "ls-files"]
            proc = subprocess.run(
                cmd,
                cwd=str(self.workspace_root),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                text=True
            )
            if proc.returncode == 0:
                self._git_tracked_set = set(line.strip().replace("\\", "/") for line in proc.stdout.splitlines() if line.strip())
            else:
                self._git_tracked_set = set()
        except Exception:
            self._git_tracked_set = set()
        return self._git_tracked_set

    def is_git_tracked(self, relative_path):
        """Checks whether a file path is tracked in the Git index (O(1))."""
        tracked = self._load_git_tracked_set()
        norm_path = relative_path.replace("\\", "/")
        return norm_path in tracked

    def get_git_blob_bytes(self, relative_path):
        """Retrieves raw bytes of a Git blob from HEAD."""
        norm_path = relative_path.replace("\\", "/")
        cmd = ["git", "cat-file", "-p", f"HEAD:{norm_path}"]
        try:
            proc = subprocess.run(
                cmd,
                cwd=str(self.workspace_root),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False
            )
            if proc.returncode == 0:
                return proc.stdout
            return None
        except Exception as e:
            self.log_error(f"Git command failed for {relative_path}: {e}")
            return None

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

    def validate_reference_registry(self, registry_path=None):
        print("\n🔍 2. التحقق من سجل المراجع (reference-registry.json)...")
        reg_path = Path(registry_path) if registry_path else (self.bip_root / "reference-registry.json")
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
        seen_priorities = set()

        for app in apps:
            app_id = app.get("app_id")
            if not app_id:
                self.log_error("Application record missing app_id")
                continue
            if app_id in seen_app_ids:
                self.log_error(f"Duplicate app_id in reference registry: {app_id}")
            seen_app_ids.add(app_id)

            priority = app.get("inventory_priority")
            if priority in seen_priorities:
                self.log_error(f"Duplicate inventory_priority in reference registry: {priority}")
            if priority is not None:
                seen_priorities.add(priority)

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

        # Sort files so sources.json are indexed before evidence/resources
        def _file_sort_key(file_path):
            p = Path(file_path)
            if "sources" in p.name:
                return (0, file_path)
            return (1, file_path)

        for jf in sorted(all_json_files, key=_file_sort_key):
            p = Path(jf)
            if "schemas" in p.parts or "templates" in p.parts:
                continue

            if self.target_app:
                norm_parts = [part.replace("\\", "/") for part in p.parts]
                if ("pilots" in norm_parts or "inventories" in norm_parts) and self.target_app not in norm_parts:
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

            # Check duplicate file path within scope and consistency across scopes
            fpath = rec.get("file_path")
            if not self.check_path_traversal(fpath, f"source {sid} file_path"):
                return

            scope = self.get_record_scope(file_source, rec)
            if scope not in self.source_paths_by_scope:
                self.source_paths_by_scope[scope] = {}

            if fpath in self.source_paths_by_scope[scope]:
                prev_sid = self.source_paths_by_scope[scope][fpath]
                self.log_error(f"Duplicate file_path in source records within scope '{scope}': '{fpath}' in {sid} and {prev_sid}")
            self.source_paths_by_scope[scope][fpath] = sid

            if fpath in self.sources_by_path:
                for prev_sid, prev_rec, prev_scope, _ in self.sources_by_path[fpath]:
                    if (
                        prev_rec.get("sha256") != rec.get("sha256")
                        or prev_rec.get("size_bytes") != rec.get("size_bytes")
                        or prev_rec.get("storage_tier") != rec.get("storage_tier")
                        or prev_rec.get("git_blob_sha256") != rec.get("git_blob_sha256")
                        or prev_rec.get("git_blob_size") != rec.get("git_blob_size")
                    ):
                        self.log_error(
                            f"Conflicting fingerprints for identical physical file_path '{fpath}': "
                            f"{sid} in '{scope}' (sha256: {rec.get('sha256')}, size: {rec.get('size_bytes')}, tier: {rec.get('storage_tier')}, blob: {rec.get('git_blob_sha256')}) vs "
                            f"{prev_sid} in '{prev_scope}' (sha256: {prev_rec.get('sha256')}, size: {prev_rec.get('size_bytes')}, tier: {prev_rec.get('storage_tier')}, blob: {prev_rec.get('git_blob_sha256')})"
                        )
            else:
                self.sources_by_path[fpath] = []

            self.sources_by_path[fpath].append((sid, rec, scope, file_source))
            if fpath not in self.source_paths:
                self.source_paths[fpath] = sid

            storage_tier = rec.get("storage_tier")
            fingerprint_basis = rec.get("fingerprint_basis", "")

            # Consistency check: storage_tier vs fingerprint_basis
            if storage_tier == "local_only" and "git_blob" in fingerprint_basis:
                self.log_error(f"Conflict in {sid}: storage_tier is 'local_only' but fingerprint_basis is '{fingerprint_basis}'")
            elif storage_tier == "git_tracked" and fingerprint_basis == "disk_bytes_local":
                self.log_error(f"Conflict in {sid}: storage_tier is 'git_tracked' but fingerprint_basis is 'disk_bytes_local'")

            full_disk_path = self.workspace_root / fpath

            if storage_tier == "git_tracked":
                # Must be tracked in Git
                if not self.is_git_tracked(fpath):
                    self.log_error(f"Source {sid} classified as 'git_tracked' but file is not tracked in Git: {fpath}")
                else:
                    blob_bytes = self.get_git_blob_bytes(fpath)
                    if blob_bytes is None:
                        self.log_error(f"Source {sid} could not retrieve Git blob for {fpath} from HEAD")
                    else:
                        actual_blob_sz = len(blob_bytes)
                        actual_blob_sha = hashlib.sha256(blob_bytes).hexdigest()

                        rec_blob_sz = rec.get("git_blob_size")
                        rec_blob_sha = rec.get("git_blob_sha256")

                        if rec_blob_sz is None:
                            self.log_error(f"Source {sid} is 'git_tracked' but missing required 'git_blob_size'")
                        elif rec_blob_sz != actual_blob_sz:
                            self.log_error(
                                f"Git blob size mismatch for {sid}: record says {rec_blob_sz}, actual Git blob has {actual_blob_sz}"
                            )

                        if rec_blob_sha is None:
                            self.log_error(f"Source {sid} is 'git_tracked' but missing required 'git_blob_sha256'")
                        elif rec_blob_sha.lower() != actual_blob_sha.lower():
                            self.log_error(
                                f"Git blob SHA-256 mismatch for {sid}:\n"
                                f"    record: {rec_blob_sha}\n"
                                f"    actual: {actual_blob_sha}"
                            )
                        else:
                            self.log_info(f"Verified Git blob for {sid}: {actual_blob_sz} bytes, {actual_blob_sha[:12]}...")

                # Verify disk file
                if not full_disk_path.exists():
                    self.log_error(f"Physical file missing on disk for tracked source {sid}: {fpath}")
                else:
                    actual_sz = full_disk_path.stat().st_size
                    rec_sz = rec.get("size_bytes")
                    if rec_sz != actual_sz:
                        self.log_error(
                            f"Size mismatch for {sid}: record says {rec_sz} bytes, disk has {actual_sz} bytes"
                        )

                    actual_sha = self.calculate_sha256(full_disk_path)
                    rec_sha = rec.get("sha256", "").lower()
                    if rec_sha != actual_sha.lower():
                        self.log_error(
                            f"SHA-256 mismatch for {sid} ({fpath}):\n"
                            f"    record: {rec_sha}\n"
                            f"    actual: {actual_sha}"
                        )
                    else:
                        self.log_info(f"Verified disk SHA-256 & size for {sid}: {actual_sz} bytes, {actual_sha[:12]}...")

            elif storage_tier == "local_only":
                # Must NOT be tracked in Git
                if self.is_git_tracked(fpath):
                    self.log_error(f"Source {sid} classified as 'local_only' but file is tracked in Git: {fpath}")

                if full_disk_path.exists():
                    actual_sz = full_disk_path.stat().st_size
                    rec_sz = rec.get("size_bytes")
                    if rec_sz != actual_sz:
                        self.log_error(
                            f"Size mismatch for local_only source {sid}: record says {rec_sz} bytes, disk has {actual_sz} bytes"
                        )

                    actual_sha = self.calculate_sha256(full_disk_path)
                    rec_sha = rec.get("sha256", "").lower()
                    if rec_sha != actual_sha.lower():
                        self.log_error(
                            f"SHA-256 mismatch for local_only source {sid} ({fpath}):\n"
                            f"    record: {rec_sha}\n"
                            f"    actual: {actual_sha}"
                        )
                    else:
                        if len(self.source_records) <= 20 or len(self.source_records) % 5000 == 0:
                            self.log_info(f"Verified local_only file for {sid}: {actual_sz} bytes, {actual_sha[:12]}...")
                else:
                    self.log_warning(
                        f"File for local_only source {sid} not available on disk: NOT_VERIFIABLE_IN_THIS_WORKSPACE ({fpath})"
                    )

            else:
                self.log_error(f"Invalid storage_tier '{storage_tier}' in source {sid}")

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
                s_id = rec.get("source_id")
                is_local_only = False
                if s_id and s_id in self.source_records:
                    source_rec, _ = self.source_records[s_id]
                    if source_rec.get("storage_tier") == "local_only":
                        is_local_only = True
                elif loc_file in self.source_paths:
                    s_id_from_path = self.source_paths[loc_file]
                    if s_id_from_path in self.source_records:
                        source_rec, _ = self.source_records[s_id_from_path]
                        if source_rec.get("storage_tier") == "local_only":
                            is_local_only = True

                if is_local_only:
                    self.log_warning(
                        f"Evidence {eid} location file not available on disk: NOT_VERIFIABLE_IN_THIS_WORKSPACE ({loc_file})"
                    )
                else:
                    self.log_error(f"Evidence location file missing on disk for {eid}: {loc_file}")
            else:
                if line_spec:
                    total_lines = self.count_file_lines(full_loc_file)
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
        if schema_name not in self.validator_instances:
            schema = self.schemas.get(schema_name)
            if not schema:
                self.log_error(f"Cannot validate record: Schema {schema_name} not loaded")
                return
            self.validator_instances[schema_name] = jsonschema.Draft7Validator(schema)
        validator = self.validator_instances[schema_name]
        for error in validator.iter_errors(instance):
            self.log_error(f"Record failed schema {schema_name} in {file_source}: {error.message}")

    def validate_referential_integrity(self):
        print("\n🔍 5. التحقق من سلامة العلاقات والتكامل الإحالي واتساق app_id والنطاق...")
        # 1. Resource -> Sources & Evidence + app_id and scope consistency
        for rid, (res, src_file) in self.resource_records.items():
            res_app = res.get("app_id")
            res_scope = self.get_record_scope(src_file, res)
            for sref in res.get("source_refs", []):
                if sref not in self.source_records:
                    self.log_error(f"Resource {rid} in {src_file} references non-existent source {sref}")
                else:
                    source_rec, s_file = self.source_records[sref]
                    src_app = source_rec.get("app_id")
                    src_scope = self.get_record_scope(s_file, source_rec)
                    if res_app != src_app:
                        self.log_error(
                            f"app_id mismatch in {rid}: resource app_id is '{res_app}', "
                            f"but referenced source {sref} belongs to app '{src_app}'"
                        )
                    if res_scope != "default" and src_scope != "default" and res_scope != src_scope:
                        self.log_error(
                            f"Scope mismatch in {rid}: resource belongs to scope '{res_scope}', "
                            f"but referenced source {sref} belongs to scope '{src_scope}'"
                        )

            for eref in res.get("evidence_refs", []):
                if eref not in self.evidence_records:
                    self.log_error(f"Resource {rid} in {src_file} references non-existent evidence {eref}")
                else:
                    evd_rec, e_file = self.evidence_records[eref]
                    evd_app = evd_rec.get("app_id")
                    evd_scope = self.get_record_scope(e_file, evd_rec)
                    if res_app != evd_app:
                        self.log_error(
                            f"app_id mismatch in {rid}: resource app_id is '{res_app}', "
                            f"but referenced evidence {eref} belongs to app '{evd_app}'"
                        )
                    if res_scope != "default" and evd_scope != "default" and res_scope != evd_scope:
                        self.log_error(
                            f"Scope mismatch in {rid}: resource belongs to scope '{res_scope}', "
                            f"but referenced evidence {eref} belongs to scope '{evd_scope}'"
                        )

        # 2. Evidence -> Source + app_id and scope consistency
        for eid, (evd, src_file) in self.evidence_records.items():
            evd_app = evd.get("app_id")
            evd_scope = self.get_record_scope(src_file, evd)
            s_id = evd.get("source_id")
            if s_id:
                if s_id not in self.source_records:
                    self.log_error(f"Evidence {eid} in {src_file} references non-existent source {s_id}")
                else:
                    source_rec, s_file = self.source_records[s_id]
                    src_app = source_rec.get("app_id")
                    src_scope = self.get_record_scope(s_file, source_rec)
                    if evd_app != src_app:
                        self.log_error(
                            f"app_id mismatch in {eid}: evidence app_id is '{evd_app}', "
                            f"but referenced source {s_id} belongs to app '{src_app}'"
                        )
                    if evd_scope != "default" and src_scope != "default" and evd_scope != src_scope:
                        self.log_error(
                            f"Scope mismatch in {eid}: evidence belongs to scope '{evd_scope}', "
                            f"but referenced source {s_id} belongs to scope '{src_scope}'"
                        )

        # 3. Relationships -> Resources & Evidence + scope consistency
        for rel_id, (rel, src_file) in self.relationship_records.items():
            src_res_id = rel.get("source_resource_id")
            tgt_res_id = rel.get("target_resource_id")
            scope = rel.get("scope")
            rel_scope = self.get_record_scope(src_file, rel)

            src_res_entry = self.resource_records.get(src_res_id)
            tgt_res_entry = self.resource_records.get(tgt_res_id)

            if not src_res_entry:
                self.log_error(f"Relationship {rel_id} references missing source_resource {src_res_id}")
            if not tgt_res_entry:
                self.log_error(f"Relationship {rel_id} references missing target_resource {tgt_res_id}")

            if src_res_entry and tgt_res_entry:
                src_app = src_res_entry[0].get("app_id")
                tgt_app = tgt_res_entry[0].get("app_id")
                src_r_scope = self.get_record_scope(src_res_entry[1], src_res_entry[0])
                tgt_r_scope = self.get_record_scope(tgt_res_entry[1], tgt_res_entry[0])

                if scope == "intra_app":
                    if src_app != tgt_app:
                        self.log_error(
                            f"Relationship {rel_id} declared as 'intra_app' but connects different apps: "
                            f"source is '{src_app}' and target is '{tgt_app}'"
                        )
                    elif rel_scope != "default" and (src_r_scope != rel_scope or tgt_r_scope != rel_scope):
                        self.log_error(
                            f"Scope mismatch in intra_app relationship {rel_id}: relation scope is '{rel_scope}', "
                            f"source resource is in '{src_r_scope}' and target resource is in '{tgt_r_scope}'"
                        )
                    else:
                        self.log_info(f"Verified intra_app relationship {rel_id} within app '{src_app}' ({rel_scope})")
                elif scope == "cross_app":
                    self.log_info(f"Verified cross_app relationship {rel_id} connecting '{src_app}' -> '{tgt_app}'")

            for eref in rel.get("evidence_refs", []):
                if eref not in self.evidence_records:
                    self.log_error(f"Relationship {rel_id} references missing evidence {eref}")
                else:
                    evd_entry = self.evidence_records[eref]
                    e_scope = self.get_record_scope(evd_entry[1], evd_entry[0])
                    if rel_scope != "default" and e_scope != "default" and e_scope != rel_scope:
                        self.log_error(
                            f"Scope mismatch in relationship {rel_id}: relationship is in '{rel_scope}', "
                            f"referenced evidence {eref} is in '{e_scope}'"
                        )

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
            sample_ids = sorted(list(unreferenced))[:10]
            self.log_warning(f"Sources cataloged without resource/evidence linkage ({len(unreferenced)} sources): e.g. {sample_ids}...")
        else:
            self.log_info("All cataloged sources are properly linked to resources and evidence!")

    def validate_and_recalculate_reports(self):
        print("\n🔍 6. إعادة الحساب الديناميكي لتقارير التطبيقات (Dynamic Report Verification)...")
        for rep_id, (rep, rep_file) in self.report_records.items():
            app_id = rep.get("app_id")
            scope = self.get_record_scope(rep_file, rep)
            self.log_info(f"Verifying application report '{rep_id}' for app '{app_id}' in scope '{scope}'...")

            # Filter records belonging strictly to this app_id AND matching scope
            app_sources = [
                r for r, src_f in self.source_records.values()
                if r.get("app_id") == app_id and (scope == "default" or self.get_record_scope(src_f, r) == scope)
            ]
            app_resources = [
                r for r, src_f in self.resource_records.values()
                if r.get("app_id") == app_id and (scope == "default" or self.get_record_scope(src_f, r) == scope)
            ]
            app_evidence = [
                r for r, src_f in self.evidence_records.values()
                if r.get("app_id") == app_id and (scope == "default" or self.get_record_scope(src_f, r) == scope)
            ]
            app_resource_ids = {res["resource_id"] for res in app_resources}
            app_relationships = [
                r for r, src_f in self.relationship_records.values()
                if (scope == "default" or self.get_record_scope(src_f, r) == scope) and (
                    r.get("source_resource_id") in app_resource_ids or
                    r.get("target_resource_id") in app_resource_ids
                )
            ]

            inv = rep.get("inventory_summary", {})
            # Check total files discovered
            expected_files = len(app_sources)
            if inv.get("total_files_discovered") != expected_files:
                self.log_error(
                    f"Report {rep_id} total_files_discovered mismatch: "
                    f"report says {inv.get('total_files_discovered')}, actual count is {expected_files}"
                )

            # Check total bytes (disk bytes)
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

            # Check resource counts by category
            res_cat_counts = {}
            for r in app_resources:
                cat = r.get("category")
                res_cat_counts[cat] = res_cat_counts.get(cat, 0) + 1
            if res_sum.get("counts_by_category") != res_cat_counts:
                self.log_error(
                    f"Report {rep_id} resource counts_by_category mismatch:\n"
                    f"    report: {res_sum.get('counts_by_category')}\n"
                    f"    actual: {res_cat_counts}"
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

            # Check relationships counts by type
            rel_type_counts = {}
            for rel in app_relationships:
                rt = rel.get("relationship_type")
                rel_type_counts[rt] = rel_type_counts.get(rt, 0) + 1
            if rel_sum.get("counts_by_type") != rel_type_counts:
                self.log_error(
                    f"Report {rep_id} relationships counts_by_type mismatch:\n"
                    f"    report: {rel_sum.get('counts_by_type')}\n"
                    f"    actual: {rel_type_counts}"
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
    parser.add_argument("--app", "--app-id", type=str, default=None, dest="app_id", help="Filter validation to a specific app_id (e.g. telegram, familywall)")
    args = parser.parse_args()

    validator = BIPValidator(workspace_root=args.root, strict=args.strict, app_id=args.app_id)
    success = validator.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
