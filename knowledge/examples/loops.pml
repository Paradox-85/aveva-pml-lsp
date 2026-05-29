-- Official-style PML loop example for MCP resource smoke tests.
!items = ARRAY()
!items.Append('A')
!items.Append('B')

DO !index FROM 1 TO !items.Size()
  !value = !items[!index]
ENDDO
