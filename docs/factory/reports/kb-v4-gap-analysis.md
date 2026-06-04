# KB v4 Gap Analysis / Decision Matrix

Generated: 2026-06-04T22:10:35.947Z

## Summary

- Unique candidates: 458
- Decisions: `manual_review`=111, `category_decision_required`=328, `import_new_candidate_ready`=19
- By mapped category: `objects`=32, `unmapped`=328, `architecturepatterns`=4, `dotnetinterop`=8, `typeconversion`=5, `pdmsinteraction`=11, `forms`=4, `errorhandling`=10, `datatypes`=18, `ui`=7, `controlflow`=13, `datetime`=2, `macros`=11, `logging`=1, `functions`=1, `arrays`=1, `syscom`=2

## Import gate policy

No candidate may be imported until all checks pass: existing sourcecodebase, `-- CB` anchor, allowed category mapping, no duplicate ID/alias/title, relatedIds reviewed, no placeholders, sourcedoc/exampleAntipattern/pitfalls present, and pml-worker lint validation succeeds for examples.

## Ready candidates

- `d7_attribute_hash_validation` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_08, mac_09; blockers=none
- `d7_attribute_type_gated_assignment` → import_new_candidate_ready; target=src/knowledge/pml-kb/typeconversion.ts; files=mac_08, mac_09; blockers=none
- `d7_element_creation_api` → import_new_candidate_ready; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_08, mac_09; blockers=none
- `d7_netgridcontrol_excel_io` → import_new_candidate_ready; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_08, mac_09; blockers=none
- `d7_special_char_stripping` → import_new_candidate_ready; target=src/knowledge/pml-kb/datatypes.ts; files=mac_08, mac_09; blockers=none
- `d7_display_progress` → import_new_candidate_ready; target=src/knowledge/pml-kb/ui.ts; files=mac_09; blockers=none
- `d7_savework_unclaim` → import_new_candidate_ready; target=src/knowledge/pml-kb/macros.ts; files=mac_09; blockers=none
- `d7_string_dbref_conversion` → import_new_candidate_ready; target=src/knowledge/pml-kb/typeconversion.ts; files=mac_09; blockers=none
- `dbref_attribute_access_assignment` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_37; blockers=none
- `loopdata_object` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_40; blockers=none
- `net_grid_data_source_workflow` → import_new_candidate_ready; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_37; blockers=none
- `obj_measure_unit` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_44; blockers=none
- `obj_ptmltags_export` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_44; blockers=none
- `obj_ramcommonlogger` → import_new_candidate_ready; target=src/knowledge/pml-kb/objects.ts; files=mac_44; blockers=none
- `pdms_collect_all_multi_class` → import_new_candidate_ready; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_12; blockers=none
- `pdms_dtxr_attribute` → import_new_candidate_ready; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_12; blockers=none
- `pdms_namn_attribute` → import_new_candidate_ready; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_12; blockers=none
- `pml1_lstdef_query` → import_new_candidate_ready; target=src/knowledge/pml-kb/controlflow.ts; files=mac_44; blockers=none
- `string_interpolation_dollar_var` → import_new_candidate_ready; target=src/knowledge/pml-kb/typeconversion.ts; files=mac_37; blockers=none

## Manual review candidates

- `array-tabular-normalisation-defined-set` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_01; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `custom-file-writer-dependency-ramfilewriterclass` → manual_review; target=src/knowledge/pml-kb/architecturepatterns.ts; files=obj_01; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `engineering-tags-common-attribute-map` → manual_review; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_04; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `engineering-tags-rdl-export-wrapper` → manual_review; target=src/knowledge/pml-kb/architecturepatterns.ts; files=mac_04; blockers=relatedIds field missing; sourcedoc field missing; exampleAntipattern missing
- `export-data-sentinel-replacement-list` → manual_review; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_04; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `KB-DEP-NAMESPACE-RAMAEUPDATEELEMENT` → manual_review; target=src/knowledge/pml-kb/dotnetinterop.ts; files=obj_07; blockers=missing -- CB anchor in exampleCanonical
- `KB-EXPR-DOLLAR-DYNAMIC-CONSTRUCT` → manual_review; target=src/knowledge/pml-kb/typeconversion.ts; files=obj_07; blockers=missing -- CB anchor in exampleCanonical
- `KB-OBJ-ATTRIBUTE-ISPSUEDO-BYPASS` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_07; blockers=missing -- CB anchor in exampleCanonical
- `KB-OBJ-VAR-BACKREF-QUERY` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_07; blockers=missing -- CB anchor in exampleCanonical
- `KB-QUERY-COLLECTALLFOR-WORL` → manual_review; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=obj_07; blockers=missing -- CB anchor in exampleCanonical
- `logger-form-refresh-side-effect` → manual_review; target=src/knowledge/pml-kb/forms.ts; files=obj_01; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `macro-error-label-savework-unclaim` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_04; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `measure-unit-setunits-defaults` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=mac_04; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `object-logger-overload-default-severity` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_01; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-array-block-evaluate` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-error-global` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-pmlfilebrowser-showopen` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-ram-aepml-excel-reader` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-ramcommonlogger` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-string-join-method` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `objects-string-set-neq-methods` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `patterns-reader-caching` → manual_review; target=src/knowledge/pml-kb/architecturepatterns.ts; files=obj_02; blockers=missing -- CB anchor in exampleCanonical; low-confidence category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-builtin-display-progress` → manual_review; target=src/knowledge/pml-kb/ui.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-builtin-error-text` → manual_review; target=src/knowledge/pml-kb/ui.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-builtin-undefined` → manual_review; target=src/knowledge/pml-kb/ui.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-control-skip-if` → manual_review; target=src/knowledge/pml-kb/controlflow.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-object-datetime-dateformat` → manual_review; target=src/knowledge/pml-kb/datetime.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-object-measure-format` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `pml-statement-show` → manual_review; target=src/knowledge/pml-kb/forms.ts; files=obj_06; blockers=-- CB anchor does not match sourcecodebase
- `kb_object_objecttype` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_09; blockers=-- CB anchor does not match sourcecodebase
- `kb_string_unset` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=obj_09; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_dateformat_constructor` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_datetime_constructor` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_dbref_namn` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_dynamic_constructor` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_dynamic_method_call` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_format_label` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_ramcommonlogger` → manual_review; target=src/knowledge/pml-kb/logging.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_real_unit` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_skip_conditional` → manual_review; target=src/knowledge/pml-kb/controlflow.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `obj_08_unset_method` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=obj_08; blockers=-- CB anchor does not match sourcecodebase
- `pml_cmd_matchwild_query` → manual_review; target=src/knowledge/pml-kb/functions.ts; files=mac_10; blockers=missing -- CB anchor in exampleCanonical
- `pml_fmt_datetime_string` → manual_review; target=src/knowledge/pml-kb/forms.ts; files=mac_10; blockers=missing -- CB anchor in exampleCanonical
- `pml_macro_error_handler_pattern` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_05; blockers=missing -- CB anchor in exampleCanonical
- `pml_obj_lstgrp_lstdef` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=mac_10; blockers=missing -- CB anchor in exampleCanonical
- `pml_obj_pmltags` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=mac_10; blockers=missing -- CB anchor in exampleCanonical
- `pml_onerror_golabel` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_05; blockers=missing -- CB anchor in exampleCanonical
- `pml_unclaim_all` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_05; blockers=missing -- CB anchor in exampleCanonical
- `pml_unset_badref_check` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_05; blockers=missing -- CB anchor in exampleCanonical
- `d7_dual_attribute_fallback` → manual_review; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `d7_empty_na_value_filtering` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `mac_08:unknown:73` → manual_review; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `mac_08:unknown:74` → manual_review; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `mac_08:unknown:75` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `mac_08:unknown:76` → manual_review; target=src/knowledge/pml-kb/pdmsinteraction.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `mac_08:unknown:77` → manual_review; target=src/knowledge/pml-kb/datatypes.ts; files=mac_08; blockers=missing -- CB anchor in exampleCanonical
- `d3-macro-file-header` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_01, mac_02; blockers=missing -- CB anchor in exampleCanonical
- `datetime_object_methods` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=mac_19, mac_24; blockers=missing -- CB anchor in exampleCanonical
- `netgridcontrol_core_presentation` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=mac_19, mac_20; blockers=missing -- CB anchor in exampleCanonical
- `array_2d_initialization` → manual_review; target=src/knowledge/pml-kb/arrays.ts; files=mac_18; blockers=-- CB anchor does not match sourcecodebase
- `block_evaluate_expression` → manual_review; target=src/knowledge/pml-kb/objects.ts; files=mac_36; blockers=missing -- CB anchor in exampleCanonical
- `cb_mac_23_createObjectsFromExcelSheet` → manual_review; target=src/knowledge/pml-kb/dotnetinterop.ts; files=mac_23; blockers=missing -- CB anchor in exampleCanonical; relatedIds field missing
- `collect_all_variable_substitution` → manual_review; target=src/knowledge/pml-kb/controlflow.ts; files=mac_18; blockers=-- CB anchor does not match sourcecodebase
- `d1-pml-reload-object` → manual_review; target=src/knowledge/pml-kb/controlflow.ts; files=mac_02; blockers=missing -- CB anchor in exampleCanonical
- `d1-pml-reload-object-command` → manual_review; target=src/knowledge/pml-kb/syscom.ts; files=mac_01; blockers=missing -- CB anchor in exampleCanonical
- `d6-user-defined-object-method` → manual_review; target=src/knowledge/pml-kb/architecturepatterns.ts; files=mac_02; blockers=missing -- CB anchor in exampleCanonical
- `datetime_object_constructor` → manual_review; target=src/knowledge/pml-kb/datetime.ts; files=mac_36; blockers=missing -- CB anchor in exampleCanonical
- `do_values_loop_pattern` → manual_review; target=src/knowledge/pml-kb/controlflow.ts; files=mac_36; blockers=missing -- CB anchor in exampleCanonical
- `eh_export_error_handling` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_14; blockers=missing -- CB anchor in exampleCanonical
- `fn_path_exists_check` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_14; blockers=missing -- CB anchor in exampleCanonical
- `import_module_handle_any_pattern` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_19; blockers=missing -- CB anchor in exampleCanonical
- `mac_dollar_m_metadata_comment` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_16; blockers=missing -- CB anchor in exampleCanonical
- `mac_loopdata_object_usage` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_39; blockers=missing -- CB anchor in exampleCanonical
- `mac_minimal_pattern` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_43; blockers=missing -- CB anchor in exampleCanonical
- `macro_finish_error_handler_placement` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_38; blockers=missing -- CB anchor in exampleCanonical
- `macro_finish_keyword` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_18; blockers=-- CB anchor does not match sourcecodebase
- `macro_onerror_golabel_error_trap` → manual_review; target=src/knowledge/pml-kb/errorhandling.ts; files=mac_18; blockers=-- CB anchor does not match sourcecodebase
- `macro_reload_object_command` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_19; blockers=missing -- CB anchor in exampleCanonical
- `macro_savework_keyword` → manual_review; target=src/knowledge/pml-kb/macros.ts; files=mac_19; blockers=missing -- CB anchor in exampleCanonical
- `macro_savework_unclaim_all` → manual_review; target=src/knowledge/pml-kb/syscom.ts; files=mac_18; blockers=-- CB anchor does not match sourcecodebase

## Category decision required

- `cb_deslnk_attribute_fallback` → category_decision_required; target=N/A; files=mac_06; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_macro_dual_source_pipe_attribute_export` → category_decision_required; target=N/A; files=mac_06; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_netgrid_excel_export_macro` → category_decision_required; target=N/A; files=mac_06; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_pml1_collect_values_dbref` → category_decision_required; target=N/A; files=mac_06; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `authuser-global-object` → category_decision_required; target=N/A; files=obj_03; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `aveva-presentation-namespaces` → category_decision_required; target=N/A; files=obj_03; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `global-pmlfilebrowser-function` → category_decision_required; target=N/A; files=obj_03; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `handle-code-severity-syntax` → category_decision_required; target=N/A; files=obj_03; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `netdatasource-modes` → category_decision_required; target=N/A; files=obj_03; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-attribute-meta` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-clock-timing` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-elementtype-meta` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-obj-pmlexcelhelper` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-obj-ramcommonlogger` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-obj-ramimportexcelconfigloader` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-param-prefix-suffix` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-str-matchwild` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-str-substring` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `pml-var-indirection` → category_decision_required; target=N/A; files=obj_05; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_do` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `arrays_findfirst_set_membership` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `cb_obj_10_collect_all` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_elsehandle` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_handle` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_netdatasource` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_netgridcontrol` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_10_syscom` → category_decision_required; target=N/A; files=obj_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `customer-ram-aepml-excel-reader-namespace` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `customer-ram-common-logger-addlogdetails` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `customer-ram-common-logger-global` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `customer-ram-pml-excel-reader-class` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `dotnet_netdatasource` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `errorhandling_elsehandle_none` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `kb_block_avevalindex` → category_decision_required; target=N/A; files=obj_09; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `kb_builtin_undefined` → category_decision_required; target=N/A; files=obj_09; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `kb_pml1_project_code_evar` → category_decision_required; target=N/A; files=obj_09; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `lazy-global-initialization-pattern` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `macro_setdate_stamp` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `objects_pmltags` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `pdms_old_qualifier` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `pdms_setcompdate` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `pml_attribute_query_of` → category_decision_required; target=N/A; files=mac_05; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `pml_inset_operator` → category_decision_required; target=N/A; files=mac_05; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `pml_isnamed_keyword` → category_decision_required; target=N/A; files=mac_05; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `pml_op_inset` → category_decision_required; target=N/A; files=mac_10; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `pml_string_format_i2` → category_decision_required; target=N/A; files=mac_05; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `string-neq-method` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `ui_netgridcontrol_export` → category_decision_required; target=N/A; files=mac_03; blockers=-- CB anchor does not match sourcecodebase; no allowed category mapping
- `array-evaluate-block-evalIndex` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `array-reindex-sortedindices-pattern` → category_decision_required; target=N/A; files=obj_04; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `customer-excel-reader-readexcel-method` → category_decision_required; target=N/A; files=obj_04; blockers=no structured patch/D7 object with entry fields; missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `mac_08:unknown:71` → category_decision_required; target=N/A; files=mac_08; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `mac_08:unknown:72` → category_decision_required; target=N/A; files=mac_08; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping
- `cb_mac_29_do` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_31_do` → category_decision_required; target=N/A; files=mac_31; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_32_do` → category_decision_required; target=N/A; files=mac_32; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_33_do` → category_decision_required; target=N/A; files=mac_33; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_34_do` → category_decision_required; target=N/A; files=mac_34; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_35_do` → category_decision_required; target=N/A; files=mac_35; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_obj_11_do` → category_decision_required; target=N/A; files=obj_11; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cmd_pml_reload_object` → category_decision_required; target=N/A; files=mac_41, mac_47; blockers=no allowed category mapping
- `cb_mac_23_reload_object` → category_decision_required; target=N/A; files=mac_23; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing
- `cb_mac_28_` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_array` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_attribute` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_file` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_gridcontrol` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_netdatasource` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_28_netgridcontrol` → category_decision_required; target=N/A; files=mac_28; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_attribute` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_coll_all` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_handle` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_netdatasource` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_29_netgridcontrol` → category_decision_required; target=N/A; files=mac_29; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_30_` → category_decision_required; target=N/A; files=mac_30; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_30_array` → category_decision_required; target=N/A; files=mac_30; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_30_attribute` → category_decision_required; target=N/A; files=mac_30; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_30_file` → category_decision_required; target=N/A; files=mac_30; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing
- `cb_mac_30_handle` → category_decision_required; target=N/A; files=mac_30; blockers=missing -- CB anchor in exampleCanonical; no allowed category mapping; relatedIds field missing; sourcedoc field missing; exampleAntipattern missing; pitfalls missing

## Rejected duplicates

_None_


## Next safe step

Review and repair candidates in the matrix; do not import entries until blockers are resolved.
