# PML Production Patterns & 100 Secrets Reference

This file consolidates production-oriented PML/PML2 patterns used by AVEVA PDMS/E3D customisation work. Examples are intentionally short so they can be used by the LSP as lookup material and by developers as reminders.

## 001. Splashscreen Reduction & PAUSE

Use short pauses sparingly during startup macros; excessive `PAUSE` calls make application loading feel slow.

```pml
$P Starting customisation...
PAUSE 0.1
```

## 002. Safe Startup Guard

```pml
handle any
  $P Loading project customisation
elsehandle
  $P Startup failed: $!!Error.Text
endhandle
```

## 003. Command Echo for Diagnostics

```pml
$R6
$P Debug trace enabled
$R0
```

## 004. Progress Bar Around Long Loops

```pml
!!FMSYS.setProgress(0)
do !i indices !items
  !!FMSYS.setProgress((100 * !i) / !items.Size())
enddo
!!FMSYS.setProgress(0)
```

## 005. Progress Text

```pml
!!FMSYS.setProgressText(|Collecting elements...|)
```

## 006. Interruptible Long Operation

Attach an interrupt gadget when a long-running form action can be cancelled.

## 007. Handle Any Around User Actions

```pml
handle any
  !this.Run()
elsehandle
  $P Action failed: $!!Error.Text
endhandle
```

## 008. Validate CE Before Use

```pml
if (BADREF(!!CE)) then
  return
endif
```

## 009. Store CE Early

```pml
!oldCe = !!CE
-- navigate or collect
CE !oldCe
```

## 010. Avoid Global Pollution

Prefer local `!variables` inside methods; reserve `!!globals` for intentional shared state.

## 011. Naming: Forms

Use a clear global form name such as `!!BamiReportForm`.

## 012. Naming: Methods

Use verb phrases: `.collectItems()`, `.refreshList()`, `.applyChanges()`.

## 013. Naming: Arrays

Use plural names for arrays: `!pipes`, `!zones`, `!rows`.

## 014. Array Append Pattern

```pml
!items = ARRAY()
!items.Append(!!CE)
```

## 015. Array Size Guard

```pml
if (!items.Size() eq 0) then
  return
endif
```

## 016. Loop Values

```pml
do !item values !items
  $P $!item
enddo
```

## 017. Loop Indices

```pml
do !i indices !items
  !item = !items[!i]
enddo
```

## 018. Sorted Unique Values

```pml
!names.SortUnique()
```

## 019. Compare Case-Insensitive Strings

```pml
if (!name.EQNoCase(|pipe|)) then
  -- matched
endif
```

## 020. Trim User Input

```pml
!value = !this.nameText.val.Trim()
```

## 021. Split CSV-Like Input

```pml
!parts = !line.Split(|,|)
```

## 022. Replace in Generated Text

```pml
!safe = !name.Replace(|/|, |_|)
```

## 023. Format Real Numbers

```pml
!txt = !real.String('D2')
```

## 024. File Exists Before Read

```pml
!f = FILE(!path)
if (!f.Exists()) then
  !lines = !f.ReadFile()
endif
```

## 025. File Read All Lines

```pml
!lines = !f.ReadFile()
do !line values !lines
  $P $!line
enddo
```

## 026. File Read Record Loop

```pml
!f.Open('READ')
handle any
  do
    !line = !f.ReadRecord()
  enddo
elsehandle
  !f.Close()
endhandle
```

## 027. File Write Overwrite

```pml
!f.WriteFile('OVERWRITE', !lines)
```

## 028. File Write Append

```pml
!f.WriteFile('APPEND', !lines)
```

## 029. Temporary Report Lines

Build output in an array and write once instead of writing inside the loop.

## 030. Collection from CE

```pml
!coll = COLLECTION()
!coll.Scope(!!CE)
!items = !coll.Results()
```

## 031. COLLECT ALL FROM CE

```pml
!items = COLLECT ALL FROM CE
```

## 032. COLLECT ALL FOR Type

```pml
!pipes = COLLECT ALL PIPE FOR CE
```

## 033. COLLECT With Expression

```pml
!valid = COLLECT ALL BRAN FOR CE WHERE (FUNC ne unset)
```

## 034. Collect From Drawlist

```pml
!shown = COLLECT ALL FROM DRAWLIST
```

## 035. Drawlist Add

Use drawlist operations to visualise report results after validation.

## 036. Drawlist Colour

Colour/translucency patterns should be reset after temporary highlighting.

## 037. GPHVIEWS Current View

```pml
!view = !!GPHVIEWS.viewIndex(!gadget)
```

## 038. GPHVIEWS Limits

```pml
!!GPHVIEWS.limits(!view, !!CE)
```

## 039. GPHVIEWS Look Direction

```pml
!!GPHVIEWS.look(!view, !direction)
```

## 040. GPHVIEWS Save/Restore

Use `saveViews()` before disruptive display operations and `restoreViews()` afterwards.

## 041. Form Show Singleton

```pml
if (!!MyForm.shown()) then
  !!MyForm.initialise()
else
  show !!MyForm
endif
```

## 042. Form Hide

```pml
!!MyForm.hide()
```

## 043. Form Initialise Method

```pml
define method .initialise()
  !this.status.val = |Ready|
endmethod
```

## 044. Apply Button Callback

```pml
button .apply |Apply| callback |!this.apply()|
```

## 045. Close Button Callback

```pml
button .close |Close| callback |!this.hide()|
```

## 046. Callback Uses !this

`!this` keeps form callback code reusable when the form global name changes.

## 047. Text Gadget Value

```pml
!value = !this.filter.val
```

## 048. List Gadget Values

```pml
!this.elements.val = !names
```

## 049. Multi-Select List

Read selected list values and map them back to stored DBREF arrays.

## 050. Combo Box Choices

Populate choices from an array built at form initialisation.

## 051. Option Gadget

Use option gadgets when only one value from a fixed set is valid.

## 052. Dropdown List with Images

Use a list/combobox with parallel arrays for display text, images and backing values. Keep the DBREF/object value in a separate member array so display strings can be translated without breaking callbacks.

```pml
!this.imageNames = ARRAY()
!this.imageNames.Append(|pipe.png|)
!this.imageNames.Append(|valve.png|)

!this.displayNames = ARRAY()
!this.displayNames.Append(|Pipe|)
!this.displayNames.Append(|Valve|)

!this.objectTypes = ARRAY()
!this.objectTypes.Append(|PIPE|)
!this.objectTypes.Append(|VALV|)

!this.typeDropdown.val = !this.displayNames
```

## 053. List Selection Callback

```pml
define method .onTypeSelected()
  !idx = !this.typeDropdown.selection
  !type = !this.objectTypes[!idx]
endmethod
```

## 054. Toggle for Optional Filters

```pml
if (!this.includeOff.val) then
  -- include filtered objects
endif
```

## 055. Radio Group Mode

Use radio groups for mutually exclusive modes such as Preview/Apply.

## 056. Frame for Related Controls

Group related gadgets in frames for readability.

## 057. Textpane Log

Append messages to a textpane instead of writing only to the command line.

## 058. Popup Menu

Popup menus are useful for list rows and drawlist actions.

## 059. Bar Menu

Use bar menus for form-level operations such as File/Run/Help.

## 060. Keyboard Focus

Set focus to the most likely first input in `initialise()` when the form opens.

## 061. Validate Required Input

```pml
if (!this.name.val.Trim().Empty()) then
  ALERT |Name is required|
  return
endif
```

## 062. Confirm Destructive Action

```pml
!ok = CONFIRM |Delete selected items?|
if (!ok) then return endif
```

## 063. Prompt for One Value

Use `PROMPT`/text gadgets for simple string input; use forms for multi-field input.

## 064. Alpha Request

Use ALPHA requests when a command requires graphical/user text selection.

## 065. Pick Request

Use `PICK` to let the user identify a database element or graphics object.

## 066. Pin Position

Use `PIN`/position controls when a macro needs a user-defined point.

## 067. AID Feedback

AID prompts should be concise and reset when the action completes.

## 068. Track CE Change

Use TRACK to refresh a form when current element changes.

## 069. Track Add/Delete

Track creation/deletion events only when the form cache depends on hierarchy contents.

## 070. TRACK

```pml
TRACK CE CALL |!!MyForm.onCeChanged()|
```

## 071. TRACK Cleanup

Disable or replace tracking callbacks when a form closes to avoid stale form references.

## 072. Session Object

```pml
!session = CURRENT SESSION
!mdb = !session.MDB()
```

## 073. MDB Mode Query

```pml
!mode = !mdb.Mode()
```

## 074. Current User/Project

Use session/project queries in generated report headers.

## 075. DB Savework Guard

Savework should be explicit and never hidden inside read-only report commands.

## 076. Claim Before Modify

Claim elements before updating attributes in multi-user projects.

## 077. Release After Modify

Release claims after successful batch updates when project procedures allow it.

## 078. Undoable Operation

Wrap risky database changes in undoable patterns when available.

## 079. Mark DB Before Batch

Create a mark/undo boundary before large automated changes.

## 080. Error Report Summary

Collect all validation errors and show one summary instead of stopping at the first item.

## 081. Warning vs Error

Warnings allow preview/export; errors block database writes.

## 082. Preview Mode

Every production update macro should support preview/dry-run when practical.

## 083. Apply Mode

Keep apply code path separate from collect/validate/report code.

## 084. Report Header

Include project, MDB, user, date and CE in generated reports.

## 085. Report Sorting

Sort report rows by hierarchy/name for stable diffs.

## 086. Report Columns

Use delimiter-safe formatting or quoted fields for CSV-like output.

## 087. Bad Reference Handling

```pml
if (BADREF(!ref)) then
  -- skip deleted/unavailable reference
endif
```

## 088. Unset Handling

Check unset attributes before string/real conversion.

## 089. Units Awareness

Report units explicitly when exporting dimensions or positions.

## 090. Position WRT

Prefer explicit `WRT` in position/direction text to avoid coordinate-system ambiguity.

## 091. Distance Checks

Use distance checks for geometry validation and log tolerance values.

## 092. Midpoint Construction

Use midpoint construction patterns for Draft/Draw positioning where supported.

## 093. App Load Keys

Keep app load keys in one startup macro and document product/module assumptions.

## 094. ATTDEF Reference

Document custom attribute definitions next to the macro that creates them.

## 095. HASH/DEHASH

Use hash/dehash only for product-supported encoded values; never treat it as security.

## 096. CALL External Macro

Keep called macro paths configurable and avoid hard-coded user directories.

## 097. Include Shared Utilities

Centralise shared functions in reusable PML function/object files.

## 098. Logging Convention

Prefix automation messages with the tool name so users know where they came from.

## 099. Cleanup Temporary State

Clear progress bars, temporary drawlist changes and transient globals on exit.

## 100. Add Referenced Elements to Screen

Collect referenced DB elements, filter bad references, then add/highlight them in the graphical view or drawlist for review.

```pml
!refs = ARRAY()
do !item values !items
  if (not BADREF(!item)) then
    !refs.Append(!item)
  endif
enddo
-- Add !refs to screen/drawlist using project display convention
```

## ADDITIONAL PATTERNS FROM PML.docx

### Production Macro Skeleton

```pml
handle any
  !tool = object MyTool()
  !tool.initialise()
  !tool.run()
elsehandle
  !!FMSYS.setProgress(0)
  $P Tool failed: $!!Error.Text
endhandle
```

### Shared Utility Object

```pml
define object BamiStringUtils
endobject

define method .isBlank(!value is STRING) is BOOLEAN
  return !value.Trim().Empty()
endmethod
```

### Form + Worker Separation

Keep form methods responsible for UI state and delegate collect/validate/apply logic to a worker object. This makes the same logic callable from command files, tests and forms.

### Validation Result Arrays

Use parallel arrays or small objects for validation result rows: element, severity, message and suggested action.

### Finalisation Pattern

Always clear progress text/progress and restore views in the finalisation path.
