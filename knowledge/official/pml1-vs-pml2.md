# PML 1 vs PML 2

Sources:

- PML Customization: https://docs.aveva.com/bundle/e3d-design/page/1026634.html
- Programmable Macro Language overview: https://docs.aveva.com/bundle/e3d-design/page/962699.html
- PML Functions and Methods: https://docs.aveva.com/bundle/engineering/page/1026679.html
- Expressions: https://docs.aveva.com/bundle/e3d-design/page/911932.html
- PML Expressions: https://docs.aveva.com/bundle/e3d-design/page/1026739.html

## Official distinction

The AVEVA PML Customization page states that the current version, often called PML 2, is an extension to original PML 1 facilities. It also states that some tasks are carried out more efficiently using PML 1 facilities and refers users to Expressions for further information.

## Server approach

- Parse common PML 1/PML 2 syntax in one parser where possible.
- Preserve PML 1 expression/query forms instead of rewriting them.
- Prefer PML 2 forms/functions/methods for new code prompts unless the user requests PML 1 or the official docs identify a PML 1-preferred case.

## Migration placeholders

Full migration patterns require the remaining official Expressions and PML 1 pages to be crawled completely. This foundation keeps the dialect distinction visible in tools and prompts.
