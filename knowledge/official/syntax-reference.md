# Official PML Syntax Reference

Sources: AVEVA official documentation only.

- PML Customization: https://docs.aveva.com/bundle/e3d-design/page/1026634.html
- Engineering PML Customization: https://docs.aveva.com/bundle/engineering/page/1026634.html
- PML Expressions: https://docs.aveva.com/bundle/e3d-design/page/1026739.html
- Control Logic: https://docs.aveva.com/bundle/e3d-design/page/1026762.html
- Arrays: https://docs.aveva.com/bundle/e3d-design/page/1026789.html
- Macros: https://docs.aveva.com/bundle/e3d-design/page/1026835.html
- PML Functions and Methods: https://docs.aveva.com/bundle/engineering/page/1026679.html

## Core conventions

The AVEVA PML Customization guide defines PML as AVEVA Programmable Macro Language and states that PML 2 extends original PML 1 facilities. Some tasks are still more efficient using PML 1 facilities; the server therefore treats PML 1 and PML 2 as related dialects rather than mutually exclusive languages.

## Variables

Common PML variable markers:

- `!name` — local variable/object reference.
- `!!name` — global variable/function/form object.
- `.method` — method selector.
- `$!name`, `$/attribute` — substitute-variable/query style forms in legacy contexts.

## Control flow keywords

Extracted from official TOC sections and source keyword data aligned to the docs:

`if`, `then`, `elseif`, `else`, `endif`, `do`, `enddo`, `while`, `from`, `to`, `by`, `values`, `index`, `indices`, `handle`, `elsehandle`, `endhandle`, `return`, `break`, `continue`, `skip`, `goto`.

Canonical examples use PML block delimiters rather than C/JavaScript syntax. The hallucination guard therefore flags `for(...)` and recommends PML `DO/ENDDO` forms.

```pml
IF (!condition) THEN
  -- statements
ELSEIF (!other) THEN
  -- statements
ELSE
  -- statements
ENDIF
```

```pml
DO !index FROM 1 TO !array.Size()
  !value = !array[!index]
ENDDO
```

## Definitions

Keywords from the official PML customization sections and extracted parser data:

`define`, `method`, `endmethod`, `function`, `endfunction`, `object`, `endobject`, `setup`, `form`, `exit`, `member`, `is`.

```pml
DEFINE FUNCTION !!Example(!arg IS STRING) IS STRING
  RETURN !arg
ENDFUNCTION
```

## String handling

The source parser recognizes AVEVA/PML pipe-delimited strings (`|text|`) and quoted strings. String concatenation and escape behavior must be checked against the official expressions pages during Phase 2 expansion.

## Gap note

The docs crawl was partially blocked for direct Python GET by HTTP 403; content was obtained through the harness fetch tool for selected official pages. This artifact is a foundation and records remaining full-crawl work in `code-examples-corpus.json` metadata.
