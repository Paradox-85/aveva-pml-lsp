# PML Collections Reference

## PML1 collection command

```pml
var !coll coll all (PIPE) with (param of catref of spco eq 100) for ce
```

```pml
var !coll collect all bran mem with type neq |INST| for ce [MAX 10]
```

Use `[MAX n]` during development to limit result size. Prefer collecting branch members when component-level piping work is required.

## PML2 COLLECTION object

```pml
!collect = object COLLECTION()
!collect.scope(!!CE)
!collect.type(|SCOM|)
!expression = object EXPRESSION()
!expression.expression(|(occurs(:Name1, |уплотнительная|) gt 0)|)
!collect.filter(!expression)
!memb = !collect.results()
```

## CollectAllFor shorthand

```pml
!branches = !!CollectAllFor('BRAN', '', !!CE)
!slabs = !!CollectAllFor('SLAB', |ATTRIB TMDWG eq 'Column'|, !!CE)
```

## EVALUATE for bulk attributes

```pml
var !names evaluate (name) for all from !Pipes
var !zones evaluate (name of zone) for all from !Pipes
```

## Iterating collection results

```pml
do !i indices !memb
  !member = !memb[!i]
  $P Member $!i is $!member
enddo
```

```pml
do !member values !memb
  if badref(!member) then
    skip
  endif
  $P Member name is $!member.name
enddo
```

## Side-by-side pattern

```pml
var !pml1 collect all bran mem with type neq |INST| for ce [MAX 20]

!pml2 = object COLLECTION()
!pml2.scope(!!ce)
!pml2.type(|BRAN|)
!branches = !pml2.results()
```
