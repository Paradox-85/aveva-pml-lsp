# PML Control Flow and Error Handling Reference

## Numeric DO loops

```pml
DO !loopCounter TO 10
  !value = !loopCounter * 2
ENDDO
```

```pml
DO !loopCounter FROM 5 TO 10 BY 2
  $P Counter is $!loopCounter
ENDDO
```

## Array and collection iteration

`DO indices` gives the numeric position; `DO values` gives the element value itself.

```pml
Do !x indices !Coll
  !element = !Coll[!x]
  $P Index $!x contains $!element
Enddo
```

```pml
Do !x values !Coll
  $P Element is $!x
Enddo
```

## BREAK and SKIP

```pml
DO !i TO 10
  skip if (!i eq 5)
  break if (!i eq 8)
  $P Accepted value $!i
ENDDO
```

## IF, ELSEIF, ELSE

```pml
IF (!condition) THEN
  $P Primary condition matched
ELSEIF (!other) THEN
  $P Alternative condition matched
ELSE
  $P No condition matched
ENDIF
```

## Generic HANDLE

```pml
HANDLE ANY
  $P Running protected command
ENDHANDLE
```

## Error reporting with system error object

```pml
HANDLE ANY
  :Description = |Checked by macro|
ELSEHANDLE
  $p Error: $!!Error.text
ENDHANDLE
```

## Specific error-code handling

```pml
handle (41,12)
  return false
elsehandle (2,9)
  !desmem.attribute(!attrlist[!i]) = !val.string()
elsehandle
  $P Unexpected error: $!!Error.text
endhandle
```

## Handle inside a loop

```pml
Do !x indices !PIPE
  $!PIPE[$!x]
  PSPEC /A300
  Handle Any
    $p Error on $!PIPE[$!x]
  EndHandle
Enddo
```

The loop-level pattern is preferred for batch database macros because one bad element should be logged and skipped instead of aborting the whole run.
