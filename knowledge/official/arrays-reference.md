# PML Arrays Reference

## Create arrays

```pml
!arr = ARRAY()
```

## Indexed assignment and append

```pml
!arr[1] = |ABCD|
!arr.Append(|EFGH|)
```

Indexed assignment writes a specific position. `Append` adds to the end of the populated list.

## Core methods

```pml
!arr.Clear()
!count = !arr.Size()
!arr.Sort()
!arr.SortUnique()
!unique = !arr.Unique()
!common = !arr.Intersect(!arr2)
!missing = !arr.Difference(!arr2)
```

## Sorted indices and reindexing

```pml
!order = !arr.SortedIndices()
!sortedCopy = !arr.ReIndex(!order)
```

Use this pattern when a second array must be reordered using the order calculated from a first array.

```pml
!names = ARRAY()
!bores = ARRAY()
!names.Append(|P-100|)
!bores.Append(100)
!names.Append(|P-050|)
!bores.Append(50)
!order = !names.SortedIndices()
!names = !names.ReIndex(!order)
!bores = !bores.ReIndex(!order)
```

## Nested arrays

```pml
!x = ARRAY()
!row = ARRAY()
!row.Append(|A|)
!row.Append(|B|)
!x.Append(!row)
!z = !x
```

## Iteration

```pml
Do !i indices !arr
  $P Index $!i has value $!arr[$!i]
Enddo
```

```pml
Do !val values !arr
  $P Value is $!val
Enddo
```
