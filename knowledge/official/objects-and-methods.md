# Official PML Objects and Methods

Sources:

- Summary of Objects, Members and Methods: https://docs.aveva.com/bundle/e3d-design/page/962720.html
- Software Customization Reference: https://docs.aveva.com/bundle/e3d-design/page/962719.html
- PML Functions and Methods: https://docs.aveva.com/bundle/engineering/page/1026679.html
- Using the Methods of an Object: https://docs.aveva.com/bundle/e3d-design/page/1026683.html
- FMSYS Object and Its Methods: https://docs.aveva.com/bundle/e3d-design/page/1027277.html
- CMSYS Object and its Methods: https://docs.aveva.com/bundle/e3d-design/page/1027429.html
- PML Add-ins: https://docs.aveva.com/bundle/e3d-design/page/1027305.html
- Core Managed Objects: https://docs.aveva.com/bundle/e3d-design/page/1026965_1.html

## Method syntax

AVEVA docs describe a method as a function specific to an object. Method references use dot notation and may take arguments.

```pml
!result = !object.Method(!argument)
```

## Core object categories

The initial source corpus includes object/type notes copied from the MIT-licensed `objects/` directory of `mikhalchankasm/vscode-pml-aveva-e3d`, including STRING, REAL, ARRAY, DBREF and related PML types.

## FMSYS/CMSYS

The official pages for FMSYS and CMSYS are included as required crawl targets. Full method signatures must be expanded from those pages in the next crawl pass if the fetch tool returns complete content.

## .NET add-ins

The official PML Add-ins section is the authoritative source for .NET/add-in integration points. This foundation records the section URL and exposes the KB path for future expansion.

## Extracted official manual additions: system objects and methods
## Official PML system objects and common methods

This section summarizes system objects and object method families used by the extracted AVEVA manuals and training macros. Method names are shown in normalized LSP form; PML itself is case-insensitive in most command contexts.

### FMSYS and CMSYS

| Object | Method / pattern | Purpose |
|---|---|---|
| `!!FMSYS` | `setProgressText(!text is STRING)` | Set the progress text shown by the Form Management System. |
| `!!FMSYS` | `setProgress(!percent is REAL)` | Set progress percentage from `0` to `100`. |
| `!!FMSYS` | `main()` | Return the main form reference. |
| `!!FMSYS` | `show()`, `hide()`, `shown()` | Show, hide, or check form visibility when a form reference is available. |
| `!!FMSYS` | `initialise(...)` | Re-initialise a form before showing or refreshing it. |
| `!!CMSYS` | command/system integration object | Used by customisation code for command-system integration where available. |

```pml
!!FMSYS.setProgress(0)
do !i from 1 to !total
  !!FMSYS.setProgressText(|Processing | & !i.string() & | of | & !total.string())
  !!FMSYS.setProgress((!i * 100) / !total)
enddo
!!FMSYS.setProgress(100)
```

Diagnostic helpers commonly shown in training material:

```pml
show !!pmlBrowser
show !!pmlForms
!!PmlDefinition('FormName')
show !!pmlVariable
show !!syntaxHelp
```

Runtime helpers seen in project macros:

```pml
!path = !!pml.getpathname(|equtagcategory.pmlfnc|)
!!pmlLaunchProcess('transc.exe', |$!args|, false)
!!runMacro(!file.fullname(), '_MODIFY')
!!runSynonym('CALLDRG XVIEW MODIFY USER')
!!deleteCE()
!canWrite = !!dbRefUpdatable(!!ce)
```

### ARRAY object

| Method | Purpose |
|---|---|
| `Append(value)` | Add an item to the end of the array. |
| `Clear()` | Remove all array contents. |
| `Size()` | Return populated element count. |
| `Sort()` | Sort values. |
| `SortUnique()` | Sort and remove duplicates in one operation. |
| `Unique()` | Remove duplicate values. |
| `Intersect(!other)` | Return values present in both arrays. |
| `Difference(!other)` | Return values present in the first array only. |
| `ReIndex(!newOrder)` | Reorder an array by an index array. |
| `SortedIndices()` | Return index positions that would sort the array. |
| `Evaluate(block)` | Evaluate a block against each member. |

### FILE object

| Method | Purpose |
|---|---|
| `exists()` | Test whether a file or folder exists. |
| `deletefile()` | Delete an existing file. Use only after an explicit existence check. |
| `writefile('OVERWRITE', !arrayOrText)` | Write content replacing previous content. |
| `writefile('APPEND', !arrayOrText)` | Append content. |
| `readfile()` | Read file content as an array. |
| `fullname()` | Return full resolved file path. |
| `dtm()` | Return date/time metadata. |
| `files()` | List files under a folder object. |
| `isOpen()` | Check open state where supported. |
| `close()` | Close an open file handle where supported. |

### COLLECTION object

| Method | Purpose |
|---|---|
| `scope(!!CE)` | Set collection search root. |
| `type(|SCOM|)` | Set element type filter. |
| `filter(!expression)` | Apply an `EXPRESSION` object. |
| `results()` | Return result array. |
| `expression(...)` | Build or attach expression text depending on object type. |

### UNDOABLE object

```pml
!undo = object UNDOABLE()
!undo.add()
handle any
  :Description = |Updated by checked macro|
elsehandle
  $P Error: $!!Error.text
endhandle
!undo.endUndoable()
```
