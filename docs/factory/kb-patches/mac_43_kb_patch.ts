/** KB Patch: mac_43 — Minimal macro pattern (reload + instantiate + call) */
import type { KBEntry } from "../../../src/knowledge/schemas/kb-entry";

export const mac_43_kb_patch: KBEntry = {
  id: "mac_minimal_pattern",
  category: "macros",
  subcategory: "minimal",
  title: "Минимальный макрос: reload + instantiate + call без boilerplate",
  principle:
    "Не все макросы требуют import/handle/переменных; минимальный паттерн — комментарий-путь → PML RELOAD OBJECT → object NAME() → метод — валиден и встречается в production.",
  rule:
    "Минимальный макрос: (опц.) --$m комментарий → PML RELOAD OBJECT <имя> → !var = object <имя>() → !var.метод() ; error-handling и import-guard отсутствуют намеренно.",
  syntax: "--$m \"path/to/macro.pmlmac\"\nPML RELOAD OBJECT OBJECTNAME\n!obj = object OBJECTNAME()\n!obj.someMethod()",
  exampleCanonical: `--$m "C:\\Users\\ADZV\\OneDrive - Ramboll\\AVEVA_SERVER\\Addons\\PMLLIB\\RAM\\Engineering\\jackdow\\run-macro\\pipeSupport-refresh.pmlmac"
PML RELOAD OBJECT TAGMANAGEMENTTMP
!tagMgmt = object TAGMANAGEMENTTMP()
!tagMgmt.pipeSupportDataUpdate()`,
  exampleAntipattern: "",
  pitfalls: [
    "Отсутствие error handling означает, что ошибки propagate вверх по стеку вызовов",
    "TAGMANAGEMENTTMP должен быть загружен (pml rehash + pml reload) до вызова",
    "Минимальный макрос не защищает от отсутствующих зависимостей",
  ],
  relatedIds: ["mac_file_structure", "obj_namespace_loading", "obj_constructor_pattern"],
  sourcedoc: "pipeSupport-refresh.pmlmac",
  sourcecodebase: "pipeSupport-refresh.pmlmac",
};
