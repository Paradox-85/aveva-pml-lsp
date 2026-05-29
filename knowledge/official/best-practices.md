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
