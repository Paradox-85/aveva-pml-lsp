# PML Variables and Types Reference

## Local and global variables

Local variables use `!`. Global variables and system objects use `!!`.

```pml
!localName = |Pump A|
!!ReportRoot = !!ce
```

Use globals sparingly and name them consistently so callback methods and forms do not accidentally share unrelated state.

## Type declarations

```pml
!name = STRING()
!length = REAL()
!ok = BOOLEAN()
!items = ARRAY()
```

## PML1 variable access patterns

```pml
VAR !NAME NAME
VAR !POS POS IN WORLD
VAR !OWNER NAME OF OWNER
```

The `VAR` command reads command-stream attributes into variables. Numbered `VAR 1` through `VAR 119` variables are a legacy pattern; prefer named variables in new code.

```pml
VAR 1 NAME
$P Legacy numbered variable is $1
```

## PML2 object style

```pml
!name = !!ce.name
!pos = !!ce.pos.wrt(/*)
!owner = !!ce.owner
```

## Set and unset checks

```pml
if defined(!name) then
  $P Name variable exists
endif

if undefined(!name) then
  !name = |Unknown|
endif

if set(!value) then
  $P Value is set
endif

if unset(!value) then
  $P Value is unset
endif

if (!value.set()) then
  $P PML2 set check passed
endif

if (!value.unset()) then
  $P PML2 unset check passed
endif
```

## Type checking and conversion

```pml
!kind = !value.objecttype()
!asString = !value.string()
!asReal = !value.real()
!asRef = !name.dbref()
```

## Explicit deletion

```pml
!value.delete()
var !value delete
```

Deleting temporary values is useful in long interactive sessions where global or callback variables may otherwise keep stale state.
