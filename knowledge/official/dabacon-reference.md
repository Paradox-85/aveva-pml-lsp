# DABACON Database Navigation and Attributes

This reference captures database-navigation patterns and pseudo-attributes found in extracted AVEVA manuals and project training macros. DABACON command syntax is command-stream oriented, so examples intentionally mix PML variables, command lines, and attribute expressions.

## Current element

| Expression | Meaning |
|---|---|
| `!!CE` | Current element database reference. |
| `!!CE.name` | Name of the current element. |
| `!!CE.type` | Element type, equivalent to class name usage such as `CLSNAM`. |
| `!!CE.owner` | Owner or parent database element. |

```pml
!current = !!CE
!name = !!CE.name
!ownerName = !!CE.owner.name
```

## Navigation expressions

```pml
q name of owner of owner
q pos in world
q pos in site

!worldPos = !!ce.pos.wrt(/*)
!sitePos = !!ce.pos.wrt(site)
```

Use explicit reference checks before walking owners in production macros.

```pml
!ref = !!ce.owner
if badref(!ref) then
  skip
endif
!parentName = !ref.name
```

## Pseudo-attributes for audit and linting

| Attribute | Meaning |
|---|---|
| `LASTM` | Last modification date. |
| `CRDATE` | Creation date. |
| `CRUSER` | User who created the element. |
| `USERM` | User who last modified the element. |
| `ATTMOD` | Attribute modified in the current session. |
| `ATTMODC` | Attribute modification comparison status. |
| `ELECRE` | Element created since a specified session/date context. |
| `ELEDEL` | Element deleted since a specified session/date context. |
| `ELEMOD` | Element modified since a specified session/date context. |
| `LCLM` | Local claim status. |
| `CLSNAM` | Element class/type name. |
| `DBSESS` | Database session identifier. |
| `SESSNO` | Session number. |
| `MSESS` | Multi-session status information. |
| `HIST` | History information. |
| `BACKREF` | Reverse-reference query family. |
| `EXMOD` | Extract modification status. |

```pml
q LASTM
q CRDATE
q CRUSER
q USERM
q CLSNAM
```

## Claim and write checks

```pml
if (!!ce.dbwrite) then
  $P Current element is writable
endif

if (!!ce.modatt) then
  $P Current element has modified attributes
endif

!canUpdate = !!dbRefUpdatable(!!ce)
if (!canUpdate.not()) then
  $P Element is not updatable: $!!ce.name
endif
```

## BACKREF queries

Use BACKREF to find elements referencing the current element through a specific attribute.

```pml
Q BACKREF (attname SPREF)
Q BACKREF (attname CATREF)
```

## Element manipulation commands

```pml
EORDER /ELBO3 BEFORE FIRST ELBO
CHANGETYPE TO :GeneralInstrument
:Pressure default
```

These commands modify database state; guard them with write checks and `HANDLE ANY`.

```pml
handle any
  if (!!dbRefUpdatable(!!ce)) then
    :Pressure default
  endif
elsehandle
  $P Failed to update $!!ce.name : $!!Error.text
endhandle
```

## Querying without navigation

```pml
var !q EVALUATE(IFT(UNSET(:ManufacturerCompanyName), :RAMManufacturer, :ManufacturerCompanyName)) for /JDA-74PDI-00032
```

This pattern is useful for reports because it reads attributes from a named element without making that element the interactive current element.
