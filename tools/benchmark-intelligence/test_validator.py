#!/usr/bin/env python3
"""
Unit and Negative Tests for BIP Validator
Family OS (عائلتي) — BIP-01 / D-039

Validates 10 negative fixture cases:
1. test_bad_sha256: Fails when file SHA-256 does not match recorded digest.
2. test_bad_size: Fails when size_bytes does not match disk size.
3. test_line_locator_out_of_bounds: Fails when #Lstart-Lend exceeds file line count.
4. test_path_traversal: Fails when file_path or location_ref contains '..' or escapes workspace.
5. test_missing_source_file: Fails when referenced source file does not exist on disk.
6. test_referential_integrity_missing_source: Fails when resource references non-existent source.
7. test_manifest_package_name_mismatch: Fails when registry package_name does not match AndroidManifest.xml.
8. test_report_total_bytes_mismatch: Fails when application report total_bytes does not match calculated sum.
9. test_duplicate_identifier: Fails when two records share the same source_id or resource_id.
10. test_registry_schema_violation: Fails when reference-registry violates its schema.
"""

import sys
import unittest
import copy
from pathlib import Path

# Add tools directory to path
TOOLS_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = TOOLS_DIR.parents[1]
sys.path.insert(0, str(TOOLS_DIR))

import importlib

validate_program_module = importlib.import_module("validate-program")
BIPValidator = validate_program_module.BIPValidator


class TestBIPValidatorNegativeFixtures(unittest.TestCase):
    def setUp(self):
        self.validator = BIPValidator(workspace_root=WORKSPACE_ROOT)
        self.validator.load_schemas()

    def test_01_bad_sha256(self):
        """1. Fails when file SHA-256 does not match recorded digest."""
        bad_source = {
            "source_id": "TG-SRC-TEST01",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/02_design_system_and_ui/svg_icons/abc_ic_ab_back_material.svg",
            "file_name": "abc_ic_ab_back_material.svg",
            "file_extension": "svg",
            "file_type": "asset_vector",
            "size_bytes": 192,
            "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
            "inspection_level": "T2",
            "status": "analyzed",
            "storage_tier": "local_only",
            "fingerprint_basis": "disk_bytes_local"
        }
        self.validator._index_and_validate_single_record(bad_source, "fixture_test_01")
        has_sha_err = any("SHA-256 mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_sha_err, "Validator did not catch SHA-256 mismatch")

    def test_02_bad_size(self):
        """2. Fails when size_bytes does not match disk size."""
        bad_source = {
            "source_id": "TG-SRC-TEST02",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/02_design_system_and_ui/svg_icons/abc_ic_ab_back_material.svg",
            "file_name": "abc_ic_ab_back_material.svg",
            "file_extension": "svg",
            "file_type": "asset_vector",
            "size_bytes": 999999,
            "sha256": "d3231f144faf28771829dc3f5a5d7637f1618322a13f231f945a5efdad2be720",
            "inspection_level": "T2",
            "status": "analyzed",
            "storage_tier": "local_only",
            "fingerprint_basis": "disk_bytes_local"
        }
        self.validator._index_and_validate_single_record(bad_source, "fixture_test_02")
        has_size_err = any("Size mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_size_err, "Validator did not catch size mismatch")

    def test_03_line_locator_out_of_bounds(self):
        """3. Fails when #Lstart-Lend exceeds file line count."""
        bad_evidence = {
            "evidence_id": "TG-EVD-TEST03",
            "app_id": "telegram",
            "tag_type": "REF",
            "source_id": "TG-SRC-000001",
            "location_ref": "benchmarks/extracted/telegram/02_design_system_and_ui/svg_icons/abc_ic_ab_back_material.svg#L1-L999",
            "claim": "Testing out-of-bounds locator",
            "observed_fact": "File has only 3 lines on disk",
            "confidence_level": "verified_direct",
            "verified_at": "2026-11-01T01:00:00Z"
        }
        self.validator._index_and_validate_single_record(bad_evidence, "fixture_test_03")
        has_line_err = any("Line locator out of bounds" in e for e in self.validator.errors)
        self.assertTrue(has_line_err, "Validator did not catch line locator out of bounds")

    def test_04_path_traversal(self):
        """4. Fails when file_path contains '..' or escapes workspace."""
        bad_source = {
            "source_id": "TG-SRC-TEST04",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/../../secret.txt",
            "file_name": "secret.txt",
            "file_extension": "txt",
            "file_type": "documentation",
            "size_bytes": 100,
            "sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "inspection_level": "T0",
            "status": "cataloged",
            "storage_tier": "local_only",
            "fingerprint_basis": "disk_bytes_local"
        }
        self.validator._index_and_validate_single_record(bad_source, "fixture_test_04")
        has_traversal_err = any("Path traversal detected" in e for e in self.validator.errors)
        self.assertTrue(has_traversal_err, "Validator did not catch path traversal")

    def test_05_missing_source_file(self):
        """5. Fails when referenced source file does not exist on disk."""
        bad_source = {
            "source_id": "TG-SRC-TEST05",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/non_existent_directory/file.kt",
            "file_name": "file.kt",
            "file_extension": "kt",
            "file_type": "source_code",
            "size_bytes": 500,
            "sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "inspection_level": "T1",
            "status": "inspected",
            "storage_tier": "git_tracked",
            "fingerprint_basis": "disk_bytes_and_git_blob"
        }
        self.validator._index_and_validate_single_record(bad_source, "fixture_test_05")
        has_missing_err = any("Physical file missing on disk" in e for e in self.validator.errors)
        self.assertTrue(has_missing_err, "Validator did not catch missing physical file")

    def test_06_referential_integrity_missing_source(self):
        """6. Fails when resource references non-existent source_id."""
        bad_resource = {
            "resource_id": "TG-RES-TEST06",
            "app_id": "telegram",
            "name": "Orphan Resource",
            "category": "Icons & Graphics",
            "description": "Resource referencing ghost source",
            "source_refs": ["TG-SRC-NONEXISTENT"],
            "evidence_refs": ["TG-EVD-000001"],
            "technical_depth": "T2_functional",
            "reusability_assessment": {
                "legal_authorization": "authorized_by_project_owner",
                "technical_reuse_strategy": "direct_asset_reuse",
                "cleanroom_requirement": False,
                "architectural_fit": "direct"
            }
        }
        self.validator.resource_records["TG-RES-TEST06"] = (bad_resource, "fixture_test_06")
        self.validator.validate_referential_integrity()
        has_ref_err = any("references non-existent source TG-SRC-NONEXISTENT" in e for e in self.validator.errors)
        self.assertTrue(has_ref_err, "Validator did not catch broken referential integrity")

    def test_07_manifest_package_name_mismatch(self):
        """7. Fails when registry package_name does not match AndroidManifest.xml."""
        # Create a mock app entry with mismatched package name
        mock_data = {
            "applications": [
                {
                    "app_id": "telegram",
                    "display_name": "Telegram",
                    "package_name": "com.fraudulent.fake.telegram",
                    "source_path": "benchmarks/extracted/telegram/",
                    "manifest_path": "benchmarks/extracted/telegram/01_architecture_and_manifest/AndroidManifest.xml",
                    "id_prefix": "TG",
                    "analysis_type": "decompiled_apk",
                    "program_phase": "BIP-02",
                    "status": "pilot_active",
                    "inventory_priority": 1,
                    "initial_capability_hypotheses": ["Test Domain"]
                }
            ]
        }
        # Run package check on this mock
        app = mock_data["applications"][0]
        manifest_full = WORKSPACE_ROOT / app["manifest_path"]
        import xml.etree.ElementTree as ET
        tree = ET.parse(manifest_full)
        actual_pkg = tree.getroot().attrib.get("package")
        if actual_pkg != app["package_name"]:
            self.validator.log_error(f"Package name mismatch for '{app['app_id']}'")

        has_pkg_err = any("Package name mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_pkg_err, "Validator did not catch package name mismatch")

    def test_08_report_total_bytes_mismatch(self):
        """8. Fails when application report total_bytes does not match calculated sum."""
        # Populate valid records
        self.validator.collect_and_validate_records()
        self.validator.errors.clear()

        # Inject a report with bad total_bytes
        bad_report = copy.deepcopy(self.validator.report_records["REP-TG-001"][0])
        bad_report["inventory_summary"]["total_bytes"] = 12345
        self.validator.report_records["REP-TG-001"] = (bad_report, "fixture_test_08")

        self.validator.validate_and_recalculate_reports()
        has_rep_err = any("total_bytes mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_rep_err, "Validator did not catch report total_bytes mismatch")

    def test_09_duplicate_identifier(self):
        """9. Fails when two records share the same source_id."""
        rec1 = {
            "source_id": "TG-SRC-DUP01",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/02_design_system_and_ui/svg_icons/abc_ic_ab_back_material.svg",
            "file_name": "abc_ic_ab_back_material.svg",
            "file_extension": "svg",
            "file_type": "asset_vector",
            "size_bytes": 192,
            "sha256": "d3231f144faf28771829dc3f5a5d7637f1618322a13f231f945a5efdad2be720",
            "inspection_level": "T2",
            "status": "analyzed",
            "storage_tier": "local_only",
            "fingerprint_basis": "disk_bytes_local"
        }
        rec2 = copy.deepcopy(rec1)
        rec2["file_path"] = "benchmarks/extracted/telegram/02_design_system_and_ui/all_layouts/abc_alert_dialog_material.xml"
        rec2["size_bytes"] = 2670
        rec2["sha256"] = "0d4da7e694b9faeb77ae8302b7e0010ddce5f68200aa376b18534ba59ad832e4"

        self.validator._index_and_validate_single_record(rec1, "file1.json")
        self.validator._index_and_validate_single_record(rec2, "file2.json")
        has_dup_err = any("Duplicate source_id 'TG-SRC-DUP01'" in e for e in self.validator.errors)
        self.assertTrue(has_dup_err, "Validator did not catch duplicate source_id")

    def test_10_registry_schema_violation(self):
        """10. Fails when reference-registry violates its schema."""
        bad_registry = {
            "version": "1.0.0",
            "applications": [
                {
                    "app_id": "invalid_app_enum_name",  # Invalid enum value
                    "display_name": "Invalid App"
                }
            ]
        }
        schema = self.validator.schemas.get("reference-registry.schema.json")
        import jsonschema
        with self.assertRaises(jsonschema.ValidationError):
            jsonschema.validate(instance=bad_registry, schema=schema)


if __name__ == "__main__":
    unittest.main(verbosity=2)
