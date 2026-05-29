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

## Extracted official manual additions: syntax, dollar commands, trace, operators
The following material consolidates syntax patterns repeatedly used in AVEVA Plant/PDMS PML manuals and training files extracted under `C:\Temp\pml-kb-extract`. It is written as an LSP reference, so examples are compact and normalized while preserving real PML command spelling.

### Dollar special symbols

| Symbol | Meaning | Typical use |
|---|---|---|
| `$M` | Run a macro file from the command stream. | `$M /project/macros/report.pmlmac` |
| `$!` | Substitute a local or global variable into command text. | `$P Current pipe is $!pipe` |
| `$.` | Substitute current object/member context in command text. | `$.callback()` inside object methods |
| `$S` | Control suppression or command echoing. | `$S-` before noisy command blocks, `$S+` to restore |
| `$G` | Goto or transfer control in command-style macro logic. | `$G labelName` |
| `$P` | Print a message to the command/alpha output. | `$P Processing $!name` |
| `$*` | Comment marker; safe for inline comments and full comment lines. | `$* explain a non-obvious command` |
| `$(` | Begin a block comment. | `$( long note` |
| `$)` | End a block comment. | `$)` |
| `$R` | Trace control command. | `$R6`, `$R7 C:\trace.txt`, `$R` |
| `$Q` | Query/command diagnostic helper in command stream. | `$Q` or `$QS` depending on module context |
| `$$` | Literal dollar escape in command text. | `$P Cost is $$100` |
| `$D` | Debug/diagnostic command-family marker in macro streams. | `$D` during diagnostic sessions |
| `$H` | Help/syntax help request. | `$H` |

Prefer `$*` comments in macros because they can appear after command text. Use `--` only when the whole physical line is a comment.

### Trace levels

| Command | Destination / level | Use |
|---|---|---|
| `$R6` | Standard trace to the alpha/request window. | Day-to-day macro debugging. |
| `$R102` | Capture trace through ALPHA LOG. | Pair with `ALPHA LOG /path over` for reproducible traces. |
| `$R100` | Full trace to the shell/console window. | Deep parser or command-stream diagnostics. |
| `$R4` | Reduced command trace. | Light tracing when `$R6` is too verbose. |
| `$R106` | Extended alpha-window trace. | Investigating nested macro/function calls. |
| `$R7 filename` | Trace directly to a named file. | `$R7 D:\trace.txt` before a failing block. |
| `$R` | Turn trace off. | Always restore after diagnostic code. |

```pml
ALPHA LOG /C:/temp/pml-trace.txt OVER
$R102
$M /C:/project/macros/check-pipes.pmlmac
$R
ALPHA LOG END
```

### Operators and precedence

PML1 command expressions and PML2 object expressions share the same intent but different spelling. Use parentheses around mixed arithmetic, comparison, and logical expressions to make parser intent explicit.

| Precedence | PML1 spelling | PML2 spelling | Notes |
|---:|---|---|---|
| 1 | `()` | `()` | Parentheses always bind first. |
| 2 | unary `-`, numeric functions | `.negate()`, method calls | Numeric functions include `SIN`, `COS`, `TAN`, `SQR`, `POW`, `NEGATE`, `ASIN`, `ACOS`, `ATAN`, `LOG`, `ALOG`, `ABS`, `INT`, `NINT`. |
| 3 | `*`, `/` | `*`, `/` | Multiplication and division. |
| 4 | `+`, `-` | `+`, `-` | Addition and subtraction. |
| 5 | `&` | `&` | String concatenation. |
| 6 | `LT GT EQ NE LE GE` | `.lt() .gt() .eq() .neq()` plus related comparison methods | Prefer lower-case method style in PML2 object chains. |
| 7 | `NOT` | `.not()` | Logical negation. |
| 8 | `AND` | `.and()` | Logical conjunction. |
| 9 | `OR` | `.or()` | Logical disjunction. |

```pml
!ok1 = (!bore GT 100) AND (!spec EQ |A300|)
!ok2 = (!bore.gt(100)).and(!spec.eq(|A300|))
!label = |Pipe | & !!ce.name & | has bore | & !bore.string()
```

### Comments

```pml
$* inline-safe PML comment
-- line-start comment only
$(
  Long block comment used for macro headers and warnings.
$)
```
