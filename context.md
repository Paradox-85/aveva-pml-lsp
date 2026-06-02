
# Code Context

## Files Retrieved

### Functions (.pmlfnc)
1. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/createObjectsFromExcelSheet.pmlfnc` - Legacy function for creating objects from Excel.
2. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/ew1/function/mlpGetDescLabel.pmlfnc` - Function to get description label. `define function !!mlpGetDescLabel(!element is STRING) is STRING`
3. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/ew1/function/ramGetBackRef.pmlfnc` - Function to get back reference. `define function !!ramGetBackRef(!element is STRING, !backAttribute is STRING, !attribute is STRING) is STRING`
4. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacCheckForceUpdate.pmlfnc` - Published function.
5. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacDeleteUnnamed.pmlfnc` - Published function for deleting unnamed elements.
6. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacExportFullDataReport.pmlfnc` - Published function for exporting full data report.
7. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacExportLinks.pmlfnc` - Published function for exporting links.
8. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacExportRDLDataReport.pmlfnc` - Published function for exporting RDL data report.
9. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacExportRDLDataReportMatrix.pmlfnc` - Published function for exporting RDL data report matrix.
10. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/jackdow/_publish/functions/jacNameRegExValidatorTTY.pmlfnc` - Published function for name validation using regex.
1al/function/mlpGetDescLabel.pmlfnc` - Function to get description label. `define function !!mlpGetDescLabel(!element is STRING) is STRING`
11. `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp/docs/codebase/ew1/function/ramGetBackRef.pmlfnc` - Function to get back reference. `define function !!ramGetBackRef(!element is STRING, !backAttribute is STRING, !attribute is STRING) is STRING`

### Macros (.pmlmac)
... (list of .pmlmac files)

### Objects (.pmlobj)
... (list of .pmlobj files)

### Forms (.pmlfrm)
... (list of .pmlfrm files)

## Key Code

### Function
- `mlpGetDescLabel`: `define function !!mlpGetDescLabel(!element is STRING) is STRING`
- `ramGetBackRef`: `define function !!ramGetBackRef(!element is STRING, !backAttribute is STRING, !attribute is STRING) is STRING`

### Macro
- Many macros appear to be for data import/export (`JDE_data-import`, `EBE_full_tag_export`, etc.).
- Several have user-specific or machine-specific suffixes (`-DK-NEUWDSTA515`, `_KTKNGR`, `_LEIR`).

### Object
- `LoopData`: Object for loop data management, with versioned variants.
- `TagManagementTmp`: Object for tag management, with multiple versioned variants.
- `ramImportExcel...`: A suite of objects for handling Excel import.

### Form
- `ramImportExcel...`: Forms for user interaction during Excel import.
- `jacEISDeliveryForm`: Form related to EIS delivery.

## Architecture

The codebase seems to be a collection of PML scripts for AVEVA E3D, with a focus on data management, import/export, and reporting. There is a clear distinction between different types of PML files (.pmlfnc, .pmlmac, .pmlobj, .pmlfrm).

A significant portion of the code is under the `jackdow` directory, which appears to be a specific project or module. The `_publish` subdirectory suggests a release or deployment structure.

There is a heavy use of versioning suffixes in filenames, indicating a manual version control system. This suggests a risk of using outdated or incorrect versions of scripts.

The `ew1` directory seems to be another module or project, smaller than `jackdow`.

## Start Here

Start by examining the `jackdow/_publish` directory. This directory likely contains the most recent and stable versions of the scripts. The `ramImportExcel` suite of files (`.pmlobj` and `.pmlfrm`) seems to be a good starting point to understand the data import functionality, which appears to be a core feature of this codebase. Specifically, `ramImportExcelProcessor.pmlfrm` could be the main entry point for the Excel import process.
