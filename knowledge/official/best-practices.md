# Official PML Best Practices

Sources:

- Serious Warning About PML Customization: https://docs.aveva.com/bundle/e3d-design/page/1026637.html
- Minimizing Problems for Future Upgrades: https://docs.aveva.com/bundle/e3d-design/page/1026640.html
- Current PML 2 Naming Convention: https://docs.aveva.com/bundle/e3d-design/page/1026641.html
- Developing PML Code: https://docs.aveva.com/bundle/e3d-design/page/1026885.html

## Warning

The official AVEVA warning and upgrade guidance pages are mission-critical. This foundation records the official URLs and treats their content as authoritative. Future diagnostic rules should cite these pages directly.

## Naming

Use `!local` variables for local scope, `!!global` for global forms/functions/objects, and official PML naming conventions from the Current PML 2 Naming Convention page.

## Anti-hallucination rules

- Do not generate JavaScript/C-style `for(...)` loops for PML.
- Do not invent AVEVA object methods without an official docs or extracted source-data citation.
- Prefer official block delimiters: `ENDIF`, `ENDDO`, `ENDMETHOD`, `ENDFUNCTION`, `ENDOBJECT`, `EXIT` for forms.

## Gap

The full warning text should be expanded verbatim once the official page fetch returns complete readable content. Direct Python GET received HTTP 403; harness fetch returned limited page content for some official pages.

## Extracted official manual additions: practical macro patterns
## Official-manual coding patterns

### Commenting

Use `$*` for inline comments and for command-stream comments that may appear after real code. Use `--` only at the start of a physical line. Use `$(` and `$)` for large macro headers, migration notes, or temporary diagnostic blocks. Comments should explain every non-obvious database write, navigation shortcut, and error recovery branch because macros are often maintained months after they are written.

```pml
!pipe = !!ce       $* current pipe captured before navigation
-- standalone explanation line
$(
  This macro updates branch members and continues after individual failures.
$)
```

### Variable naming

Use meaningful local names with `!` and reserve `!!` for globals or system objects. Do not reuse one variable name for different types in the same scope.

```pml
!branchMembers = ARRAY()
!!CurrentReportForm = object REPORTFORM()
```

### Error handling around database work

Wrap navigation and writes in `HANDLE ANY`. Log the element that failed and continue loop execution unless the whole transaction must stop.

```pml
do !member values !branchMembers
  handle any
    $!member
    :Pressure default
  elsehandle
    $P Error resetting pressure for $!member : $!!Error.text
  endhandle
enddo
```

### Debug tracing

```pml
$R6
$P Starting branch audit for $!!ce.name
$R

ALPHA LOG /C:/temp/branch-audit.txt OVER
$R102
$M /C:/project/macros/branch-audit.pmlmac
$R
ALPHA LOG END
ALPHA REQ CLEAR
```

Use `$R7 D:\trace.txt` when a trace must be captured without alpha-log setup. Turn tracing off with `$R` before leaving the macro.

### Collections

Collect branch members when processing piping components, not only PIPE elements. Use `[MAX n]` while testing. Use `DO values` when the loop body needs each element and `DO indices` when the position in the array matters.

```pml
var !members collect all bran mem with type neq |INST| for ce [MAX 10]
do !member values !members
  q name
enddo
```

### PML reload

```pml
pml rehash all
pml reload form !!myForm
pml reload object myObject
```

`pml rehash all` compiles from the first configured `PMLLIB` path; keep deployment paths predictable.

### Bad reference checks

Always check references before accessing attributes or methods.

```pml
if badref(!myRef) then
  skip
endif

if (badref(!myRef).not()) then
  !name = !myRef.name
endif
```

### Undoable database changes

```pml
!undo = object UNDOABLE()
!undo.add()
handle any
  :Description = |Updated by checked macro|
elsehandle
  $P Database update failed: $!!Error.text
endhandle
!undo.endUndoable()
```
