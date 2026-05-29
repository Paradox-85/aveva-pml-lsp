# Official PML Objects and Methods

Sources:

- Summary of Objects, Members and Methods: https://docs.aveva.com/bundle/e3d-design/page/962720.html
- Software Customization Reference: https://docs.aveva.com/bundle/e3d-design/page/962719.html
- PML Functions and Methods: https://docs.aveva.com/bundle/engineering/page/1026679.html
- Using the Methods of an Object: https://docs.aveva.com/bundle/e3d-design/page/1026683.html
- FMSYS Object and Its Methods: https://docs.aveva.com/bundle/e3d-design/page/1027277.html
- CMSYS Object and its Methods: https://docs.aveva.com/bundle/e3d-design/page/1027429.html
- PML Add-ins: https://docs.aveva.com/bundle/e3d-design/page/1027305.html
- Core Managed Objects: https://docs.aveva.com/bundle/e3d-design/page/1026965_1.html

## Method syntax

AVEVA docs describe a method as a function specific to an object. Method references use dot notation and may take arguments.

```pml
!result = !object.Method(!argument)
```

## Core object categories

The initial source corpus includes object/type notes copied from the MIT-licensed `objects/` directory of `mikhalchankasm/vscode-pml-aveva-e3d`, including STRING, REAL, ARRAY, DBREF and related PML types.

## FMSYS/CMSYS

The official pages for FMSYS and CMSYS are included as required crawl targets. Full method signatures must be expanded from those pages in the next crawl pass if the fetch tool returns complete content.

## .NET add-ins

The official PML Add-ins section is the authoritative source for .NET/add-in integration points. This foundation records the section URL and exposes the KB path for future expansion.
