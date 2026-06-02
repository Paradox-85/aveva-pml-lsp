# PML Commands Reference Additions

This reference captures command-style PML/PDMS/E3D constructs that are not simple object methods. Syntax varies by product generation; examples are intentionally conservative and should be validated in the target AVEVA session.

## CLOCK Commands

Use CLOCK commands for timing and measuring macro performance.

```pml
CLOCK START
-- operation
CLOCK STOP
```

Common usage:

| Command | Purpose |
| --- | --- |
| `CLOCK START` | Start timing. |
| `CLOCK STOP` | Stop/report timing. |
| `CLOCK RESET` | Reset timing state. |

## PROMPT Commands

PROMPT asks the user for text/input in command workflows.

```pml
PROMPT |Enter report name|
```

Use forms for multi-field prompts; use PROMPT for one-off command input.

## ALPHA Commands

ALPHA requests textual or named input from the user.

```pml
ALPHA REQUEST |Enter name|
```

Typical pattern: set a concise request message, read the result, then clear or replace the request.

## AID Commands

AID displays guidance for interactive operations.

```pml
AID |Pick an element to report|
```

Use AID messages during `PICK`/`PIN` interactions so the user knows what is expected.

## PIN Commands

PIN requests a position from the user or graphics environment.

```pml
PIN POSITION
```

Pin results are commonly combined with position construction syntax such as `WRT`.

## PICK Command

PICK requests a graphical/database selection.

```pml
PICK ELEMENT
```

Production pattern:

```pml
AID |Pick element|
PICK ELEMENT
if (BADREF(!!CE)) then
  return
endif
```

## ENHANCE Commands

ENHANCE controls graphical emphasis/highlighting during interactive macros.

```pml
ENHANCE CE
```

Reset temporary enhancement after the workflow finishes to avoid confusing the user.

## Draft Sizing and Positioning Commands

Draft/Draw commands often use position construction rather than PML2 object methods.

```pml
POS E100 N200 U0 WRT /*
MOVE N DIST 500
```

| Construct | Purpose |
| --- | --- |
| `WRT` | Interpret a position/direction with respect to another coordinate system or element. |
| `MIDPOINT` | Construct position from two positions in Draft/Draw contexts. |
| `DIST` | Distance argument for move/positioning commands. |

## Startup Commands

Startup customisation usually loads appware, forms, functions and project macros in a controlled order.

```pml
$P Loading application customisation
CALL /%PMLLIB%/startup.pmlmac
```

Keep startup commands idempotent: repeated load should not duplicate menu items or callbacks.

## Dimension Commands

Dimension commands create or modify Draft dimensions and annotations. Keep command macros explicit about owner view/sheet and picked geometry.

```pml
-- Product-specific dimension command sequence goes here
```

## Hierarchy Commands

Navigation commands are core to DABACON workflows.

```pml
NEW SITE /MY-SITE
NEW ZONE /MY-ZONE
CE /MY-SITE
```

Common commands:

| Command | Purpose |
| --- | --- |
| `NEW` | Create a DB element. |
| `CE` | Set/query current element. |
| `OWN` | Navigate to owner. |
| `MEM` | Navigate members. |
| `DELETE` | Delete selected/current element. |

## Session Commands

Session-level commands expose project/MDB/user context.

```pml
!session = CURRENT SESSION
!mdb = !session.MDB()
```

Special query commands include `SESSIONS`, `PROJECTS`, `TEAMS`, `USERS`, `MDBS`, and `DBS`.

## History Commands

History commands support navigation and command recall depending on product shell.

```pml
HISTORY
```

Use history output only for diagnostics; do not build production logic around interactive recall state.

## OLD Syntax

Older PML1 command syntax is still encountered in legacy macros. The LSP should parse it without assuming PML2 method syntax.

```pml
$!variable
Q ATT
```

## CALL Commands

CALL executes another macro/command file.

```pml
CALL /%PMLLIB%/shared/report.pmlmac
```

## CALL* Patterns

Some environments use CALL variants or wildcard-style loader macros for application bootstrap. Keep called paths centralised and configurable.

```pml
CALL $!macroPath
```

## HASH and DEHASH

HASH/DEHASH encode/decode product-supported values.

```pml
!encoded = HASH(!value)
!plain = DEHASH(!encoded)
```

Do not treat HASH as cryptographic security.

## REFL APPEND

`REFL APPEND` style commands append references to a reference list.

```pml
REFL APPEND CE
```

Use bad-reference checks when values come from old reports or external lists.

## ATTDEF

ATTDEF defines user attributes/custom attributes.

```pml
ATTDEF TEXT MYATTR
```

Typical concerns:

| Field | Notes |
| --- | --- |
| Type | TEXT, REAL, INTEGER, BOOLEAN, DBREF, POSITION, etc. |
| Default | Define safe defaults where possible. |
| Validation | Keep validation rules documented. |

## SPREAD

SPREAD commands/tables are used for spreadsheet-like output or data presentation in AVEVA tools.

```pml
SPREAD
```

Prefer stable column order and explicit formatting for export-style usage.

## Draft Queries

Draft macros use query commands to read sheet/view/dimension state.

```pml
Q POS
Q ORI
Q ATT
```

Treat query output as product/version-dependent text unless parsed through documented objects.

## Pipe Attributes

Common pipe-related attributes used in reports include name, purpose/function, bore, spec, insulation/tracing and owner hierarchy.

```pml
Q ATT
!name = !!CE.Name
```

When exporting pipe data, include hierarchy path so rows can be traced back to the model.

## Fitting Attributes

Fitting reports commonly use type, bore, spec, position/orientation and connection references.

```pml
!pos = !!CE.POS
!ori = !!CE.ORI
```

Check unset attributes before string conversion.

## ISODRAFTMODE

ISODRAFTMODE controls or queries isometric drafting mode in isometric workflows.

```pml
ISODRAFTMODE
```

Keep isometric-mode changes local to the workflow and restore expected defaults when done.

## Command Safety Checklist

1. Confirm the expected module/application is active.
2. Confirm CE/MDB context before database writes.
3. Use preview mode for bulk updates.
4. Wrap risky actions in `handle any`.
5. Clear temporary graphics, progress and prompts after completion.
