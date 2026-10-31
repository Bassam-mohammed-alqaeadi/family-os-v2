#!/usr/bin/env python3
"""
Unit and Integration Tests for BIP Validator
Family OS (عائلتي) — BIP-01 / D-039

Validates actual execution paths in BIPValidator across:
1. test_01_bad_sha256: Fails when file SHA-256 does not match recorded digest.
2. test_02_bad_size: Fails when size_bytes does not match disk size.
3. test_03_line_locator_out_of_bounds: Fails when #Lstart-Lend exceeds file line count.
4. test_04_path_traversal: Fails when file_path contains '..' or escapes workspace.
5. test_05_missing_source_file: Fails when referenced source file does not exist on disk.
6. test_06_referential_integrity_missing_source: Fails when resource references non-existent source.
7. test_07_manifest_package_name_mismatch: Fails through validate_reference_registry when manifest package differs.
8. test_08_report_total_bytes_mismatch: Fails when application report total_bytes does not match calculated sum.
9. test_09_duplicate_identifier: Fails when two records share the same source_id.
10. test_10_registry_schema_violation: Fails through validate_reference_registry on schema invalidity.
11. test_11_git_blob_sha256_mismatch: Fails when git_blob_sha256 differs from actual Git blob bytes.
12. test_12_git_blob_size_mismatch: Fails when git_blob_size differs from actual Git blob length.
13. test_13_app_id_mismatch_resource_source: Fails when resource and referenced source have differing app_id.
14. test_14_app_id_mismatch_resource_evidence: Fails when resource and referenced evidence have differing app_id.
15. test_15_intra_app_scope_app_mismatch: Fails when intra_app relationship connects resources from differing app_ids.
16. test_16_valid_cross_app_relationship: Succeeds when cross_app relationship connects resources from differing app_ids.
17. test_17_report_category_count_mismatch: Fails when report resource counts_by_category differs from actual records.
"""

import sys
import json
import unittest
import copy
import tempfile
import importlib
from pathlib import Path

# Add tools directory to path
TOOLS_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = TOOLS_DIR.parents[1]
sys.path.insert(0, str(TOOLS_DIR))

validate_program_module = importlib.import_module("validate-program")
BIPValidator = validate_program_module.BIPValidator


class TestBIPValidatorNegativeFixtures(unittest.TestCase):
    def setUp(self):
        self.validator = BIPValidator(workspace_root=WORKSPACE_ROOT)
        self.validator.load_schemas()

    def test_01_bad_sha256(self):
        """1. Fails when file SHA-256 does not match recorded digest."""
        bad_source = {
            "source_id": "TG-SRC-000091",
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
            "source_id": "TG-SRC-000092",
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
            "evidence_id": "TG-EVD-000093",
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
            "source_id": "TG-SRC-000094",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/../../secret.txt",
            "file_name": "secret.txt",
            "file_extension": "txt",
            "file_type": "documentation",
            "size_bytes": 100,
            "sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "inspection_level": "T0",
            "status": "discovered",
            "storage_tier": "local_only",
            "fingerprint_basis": "disk_bytes_local"
        }
        self.validator._index_and_validate_single_record(bad_source, "fixture_test_04")
        has_traversal_err = any("Path traversal detected" in e for e in self.validator.errors)
        self.assertTrue(has_traversal_err, "Validator did not catch path traversal")

    def test_05_missing_source_file(self):
        """5. Fails when referenced source file does not exist on disk."""
        bad_source = {
            "source_id": "TG-SRC-000095",
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
        has_missing_err = any("file is not tracked in Git" in e or "Physical file missing" in e for e in self.validator.errors)
        self.assertTrue(has_missing_err, "Validator did not catch missing physical file / git track failure")

    def test_06_referential_integrity_missing_source(self):
        """6. Fails when resource references non-existent source_id."""
        bad_resource = {
            "resource_id": "TG-RES-000096",
            "app_id": "telegram",
            "name": "Orphan Resource",
            "category": "Icons & Graphics",
            "description": "Resource referencing ghost source",
            "source_refs": ["TG-SRC-999999"],
            "evidence_refs": ["TG-EVD-000001"],
            "technical_depth": "T2_functional",
            "reusability_assessment": {
                "legal_authorization": "authorized_by_project_owner",
                "technical_reuse_strategy": "direct_asset_reuse",
                "cleanroom_requirement": False,
                "architectural_fit": "direct"
            }
        }
        self.validator.resource_records["TG-RES-000096"] = (bad_resource, "fixture_test_06")
        self.validator.validate_referential_integrity()
        has_ref_err = any("references non-existent source TG-SRC-999999" in e for e in self.validator.errors)
        self.assertTrue(has_ref_err, "Validator did not catch broken referential integrity")

    def test_07_manifest_package_name_mismatch(self):
        """7. Fails through validate_reference_registry when manifest package does not match package_name."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            
            # Create a mock AndroidManifest.xml with actual package "com.real.package"
            mock_manifest = tmp_path / "AndroidManifest.xml"
            mock_manifest.write_text(
                '<?xml version="1.0" encoding="utf-8"?>\n'
                '<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.real.package">\n'
                '</manifest>',
                encoding="utf-8"
            )

            # Load the valid reference registry as template
            with open(WORKSPACE_ROOT / "spec/01-foundation/benchmark-intelligence/reference-registry.json", "r", encoding="utf-8") as f:
                reg_data = json.load(f)

            # Alter the telegram package name to "com.mismatched.fraudulent"
            # and point manifest_path to the temporary manifest relative to workspace
            rel_manifest = mock_manifest.relative_to(WORKSPACE_ROOT) if mock_manifest.is_relative_to(WORKSPACE_ROOT) else str(mock_manifest)
            
            # Use telegram's real manifest on disk, but tamper package_name in registry
            reg_data["applications"][0]["package_name"] = "com.tampered.fake.telegram"
            
            mock_reg_file = tmp_path / "test-reference-registry.json"
            mock_reg_file.write_text(json.dumps(reg_data, indent=2), encoding="utf-8")

            # Execute Validator's actual validate_reference_registry method
            self.validator.errors.clear()
            self.validator.validate_reference_registry(registry_path=mock_reg_file)

            has_pkg_err = any(
                "Package name mismatch for 'telegram'" in e and "com.tampered.fake.telegram" in e
                for e in self.validator.errors
            )
            self.assertTrue(has_pkg_err, "Validator did not catch manifest package name mismatch through execution path")

    def test_08_report_total_bytes_mismatch(self):
        """8. Fails when application report total_bytes does not match calculated sum."""
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
            "source_id": "TG-SRC-000099",
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
        has_dup_err = any("Duplicate source_id 'TG-SRC-000099'" in e for e in self.validator.errors)
        self.assertTrue(has_dup_err, "Validator did not catch duplicate source_id")

    def test_10_registry_schema_violation(self):
        """10. Fails through validate_reference_registry when reference-registry violates its schema."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            bad_registry = {
                "version": "1.0.0",
                "program": "BIP",
                "established_by": "D-039",
                "last_updated": "2026-11-01",
                "applications": [
                    {
                        "app_id": "invalid_app_enum_name",
                        "display_name": "Invalid App",
                        "source_path": "benchmarks/extracted/invalid/",
                        "id_prefix": "INV",
                        "analysis_type": "decompiled_apk",
                        "program_phase": "BIP-99",
                        "status": "ready",
                        "executive_summary_path": "summary.md",
                        "inventory_priority": 1,
                        "initial_capability_hypotheses": ["Test"]
                    }
                ]
            }
            mock_reg_file = tmp_path / "bad-reference-registry.json"
            mock_reg_file.write_text(json.dumps(bad_registry, indent=2), encoding="utf-8")

            self.validator.errors.clear()
            self.validator.validate_reference_registry(registry_path=mock_reg_file)

            has_schema_err = any("reference-registry.json schema validation failed" in e for e in self.validator.errors)
            self.assertTrue(has_schema_err, "Validator did not catch schema violation through validate_reference_registry")

    def test_11_git_blob_sha256_mismatch(self):
        """11. Fails when git_blob_sha256 differs from actual Git blob bytes."""
        bad_git_source = {
            "source_id": "TG-SRC-000071",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/05_data_models_and_schemas/telegram_sqlite_schema.sql",
            "file_name": "telegram_sqlite_schema.sql",
            "file_extension": "sql",
            "file_type": "database_schema",
            "size_bytes": 31564,
            "sha256": "dbe642759542c496de33e4e8e0d7daea26c951fb9c61f7b54bfe40e782db8499",
            "inspection_level": "T2",
            "status": "analyzed",
            "storage_tier": "git_tracked",
            "fingerprint_basis": "disk_bytes_and_git_blob",
            "git_blob_size": 31564,
            "git_blob_sha256": "0000000000000000000000000000000000000000000000000000000000000000"
        }
        self.validator._index_and_validate_single_record(bad_git_source, "fixture_test_11")
        has_blob_err = any("Git blob SHA-256 mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_blob_err, "Validator did not catch Git blob SHA-256 mismatch")

    def test_12_git_blob_size_mismatch(self):
        """12. Fails when git_blob_size differs from actual Git blob length."""
        bad_git_source = {
            "source_id": "TG-SRC-000072",
            "app_id": "telegram",
            "file_path": "benchmarks/extracted/telegram/05_data_models_and_schemas/telegram_sqlite_schema.sql",
            "file_name": "telegram_sqlite_schema.sql",
            "file_extension": "sql",
            "file_type": "database_schema",
            "size_bytes": 31564,
            "sha256": "dbe642759542c496de33e4e8e0d7daea26c951fb9c61f7b54bfe40e782db8499",
            "inspection_level": "T2",
            "status": "analyzed",
            "storage_tier": "git_tracked",
            "fingerprint_basis": "disk_bytes_and_git_blob",
            "git_blob_size": 999999,
            "git_blob_sha256": "dbe642759542c496de33e4e8e0d7daea26c951fb9c61f7b54bfe40e782db8499"
        }
        self.validator._index_and_validate_single_record(bad_git_source, "fixture_test_12")
        has_blob_sz_err = any("Git blob size mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_blob_sz_err, "Validator did not catch Git blob size mismatch")

    def test_13_app_id_mismatch_resource_source(self):
        """13. Fails when resource and referenced source have differing app_id."""
        source_rec = {
            "source_id": "FW-SRC-000001",
            "app_id": "familywall",
            "file_path": "benchmarks/extracted/familywall/01_architecture_and_manifest/AndroidManifest.xml",
            "file_name": "AndroidManifest.xml",
            "file_extension": "xml",
            "file_type": "manifest",
            "size_bytes": 100,
            "sha256": "abcdef",
            "inspection_level": "T1",
            "status": "inspected",
            "storage_tier": "git_tracked",
            "fingerprint_basis": "disk_bytes_local"
        }
        res_rec = {
            "resource_id": "TG-RES-000073",
            "app_id": "telegram",
            "name": "Mismatched App Resource",
            "category": "Android Platform Integration",
            "description": "Resource claims telegram but references familywall source",
            "source_refs": ["FW-SRC-000001"],
            "evidence_refs": [],
            "technical_depth": "T2_functional",
            "reusability_assessment": {
                "legal_authorization": "authorized_by_project_owner",
                "technical_reuse_strategy": "direct_asset_reuse",
                "cleanroom_requirement": False,
                "architectural_fit": "direct"
            }
        }
        self.validator.source_records["FW-SRC-000001"] = (source_rec, "source_fw.json")
        self.validator.resource_records["TG-RES-000073"] = (res_rec, "res_tg.json")
        self.validator.validate_referential_integrity()

        has_app_err = any("app_id mismatch in TG-RES-000073" in e for e in self.validator.errors)
        self.assertTrue(has_app_err, "Validator did not catch app_id mismatch between resource and source")

    def test_14_app_id_mismatch_resource_evidence(self):
        """14. Fails when resource and referenced evidence have differing app_id."""
        evd_rec = {
            "evidence_id": "L360-EVD-000001",
            "app_id": "life360",
            "tag_type": "REF",
            "location_ref": "benchmarks/extracted/life360/01_architecture_and_manifest/AndroidManifest.xml#L1-L10",
            "claim": "Test claim",
            "observed_fact": "Fact",
            "confidence_level": "verified_direct",
            "verified_at": "2026-11-01T01:00:00Z"
        }
        res_rec = {
            "resource_id": "TG-RES-000074",
            "app_id": "telegram",
            "name": "Mismatched Evidence Resource",
            "category": "Network & API",
            "description": "Resource claims telegram but references life360 evidence",
            "source_refs": [],
            "evidence_refs": ["L360-EVD-000001"],
            "technical_depth": "T2_functional",
            "reusability_assessment": {
                "legal_authorization": "authorized_by_project_owner",
                "technical_reuse_strategy": "direct_asset_reuse",
                "cleanroom_requirement": False,
                "architectural_fit": "direct"
            }
        }
        self.validator.evidence_records["L360-EVD-000001"] = (evd_rec, "evd_l360.json")
        self.validator.resource_records["TG-RES-000074"] = (res_rec, "res_tg.json")
        self.validator.validate_referential_integrity()

        has_app_err = any("app_id mismatch in TG-RES-000074" in e for e in self.validator.errors)
        self.assertTrue(has_app_err, "Validator did not catch app_id mismatch between resource and evidence")

    def test_15_intra_app_scope_app_mismatch(self):
        """15. Fails when intra_app relationship connects resources from differing app_ids."""
        res1 = {
            "resource_id": "TG-RES-000001",
            "app_id": "telegram"
        }
        res2 = {
            "resource_id": "FW-RES-000001",
            "app_id": "familywall"
        }
        bad_rel = {
            "relationship_id": "REL-000075",
            "source_resource_id": "TG-RES-000001",
            "target_resource_id": "FW-RES-000001",
            "relationship_type": "DEPENDS_ON",
            "scope": "intra_app",
            "description": "Invalid intra_app relation spanning two apps",
            "resolution_status": "resolved"
        }
        self.validator.resource_records["TG-RES-000001"] = (res1, "tg.json")
        self.validator.resource_records["FW-RES-000001"] = (res2, "fw.json")
        self.validator.relationship_records["REL-000075"] = (bad_rel, "rel.json")
        self.validator.validate_referential_integrity()

        has_scope_err = any("declared as 'intra_app' but connects different apps" in e for e in self.validator.errors)
        self.assertTrue(has_scope_err, "Validator did not catch intra_app scope connecting different apps")

    def test_16_valid_cross_app_relationship(self):
        """16. Succeeds when cross_app relationship connects resources from differing app_ids."""
        res1 = {
            "resource_id": "TG-RES-000001",
            "app_id": "telegram"
        }
        res2 = {
            "resource_id": "FW-RES-000001",
            "app_id": "familywall"
        }
        valid_cross_rel = {
            "relationship_id": "REL-000076",
            "source_resource_id": "TG-RES-000001",
            "target_resource_id": "FW-RES-000001",
            "relationship_type": "DUPLICATES",
            "scope": "cross_app",
            "description": "Valid cross_app relationship comparing capabilities",
            "resolution_status": "deferred_to_synthesis"
        }
        self.validator.resource_records["TG-RES-000001"] = (res1, "tg.json")
        self.validator.resource_records["FW-RES-000001"] = (res2, "fw.json")
        self.validator.relationship_records["REL-000076"] = (valid_cross_rel, "rel.json")
        self.validator.validate_referential_integrity()

        # Should NOT produce any errors for cross_app
        has_cross_err = any("REL-000076" in e for e in self.validator.errors)
        self.assertFalse(has_cross_err, "Validator incorrectly rejected a valid cross_app relationship")

    def test_17_report_category_count_mismatch(self):
        """17. Fails when report resource counts_by_category differs from actual records."""
        self.validator.collect_and_validate_records()
        self.validator.errors.clear()

        # Inject a report with bad counts_by_category
        bad_report = copy.deepcopy(self.validator.report_records["REP-TG-001"][0])
        bad_report["resource_summary"]["counts_by_category"]["Icons & Graphics"] = 999
        self.validator.report_records["REP-TG-001"] = (bad_report, "fixture_test_17")

        self.validator.validate_and_recalculate_reports()
        has_cat_err = any("resource counts_by_category mismatch" in e for e in self.validator.errors)
        self.assertTrue(has_cat_err, "Validator did not catch report counts_by_category mismatch")


if __name__ == "__main__":
    unittest.main(verbosity=2)
