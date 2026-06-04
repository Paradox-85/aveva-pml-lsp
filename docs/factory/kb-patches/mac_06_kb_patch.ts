// Auto-generated KB patch draft from docs/factory gap analysis.
// Source: docs/codebase/macros/JDE_pipeData_export.pmlmac
// Status: draft only. Do not apply automatically.

export const mac06KbPatchDraft = [
  {
    id: 'cb_macro_dual_source_pipe_attribute_export',
    category: 'codebase-pattern',
    subcategory: 'macro-export',
    title: 'Dual-source AE3D and AE pipe attribute export',
    principle: 'Collect AE3D and AE pipeline data separately, map source-specific attributes into the same ordered row schema, and append a source discriminator column.',
    syntax: 'var !items COLL ALL (TYPE) WITH (condition)\ndo !itemStr values !items\n  !ref = !itemStr.dbref()\n  !row = ARRAY()\n  !row.append(!ref.:Attribute)\n  !row.append(|SourceName|)\n  !dataList.append(!row)\nenddo',
    sourcecodebase: 'JDE_pipeData_export.pmlmac'
  },
  {
    id: 'cb_pml1_collect_values_dbref',
    category: 'syntax-pattern',
    subcategory: 'collection-loop',
    title: 'PML1 COLL ALL with VALUES loop and DBREF conversion',
    principle: 'Legacy macros use declarative PML1 collection syntax and iterate values directly, converting each value to DBREF before attribute access.',
    syntax: 'var !items COLL ALL (TYPE) WITH (condition)\ndo !itemStr values !items\n  !idx = !items.findFirst(!itemStr)\n  !ref = !itemStr.dbref()\nenddo',
    sourcecodebase: 'JDE_pipeData_export.pmlmac'
  },
  {
    id: 'cb_deslnk_attribute_fallback',
    category: 'syntax-pattern',
    subcategory: 'attribute-access',
    title: 'Relationship-derived attribute read with HANDLE fallback',
    principle: 'Read attributes through relationship links such as DESLNK and protect missing links with narrow HANDLE blocks.',
    syntax: 'var !value :ATTRIBUTE of Relation of $!dbref\nhandle any\n  !value = ||\nendhandle',
    sourcecodebase: 'JDE_pipeData_export.pmlmac'
  },
  {
    id: 'cb_netgrid_excel_export_macro',
    category: 'dependency-pattern',
    subcategory: 'dotnet-grid-export',
    title: 'GridControl NETGRIDCONTROL and NETDATASOURCE Excel export',
    principle: 'Export tabular ARRAY data to Excel by importing GridControl, creating NETDATASOURCE, binding to NETGRIDCONTROL, and calling saveGridToExcel.',
    syntax: "import 'GridControl'\nhandle any\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!grid = object NETGRIDCONTROL()\n!grid.clearGrid()\n!source = object NETDATASOURCE('data', !headers, !rows)\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel(|$!path|, |data|)",
    sourcecodebase: 'JDE_pipeData_export.pmlmac'
  }
] as const;
