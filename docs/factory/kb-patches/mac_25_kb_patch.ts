/**
 * KB Patch for mac_25 — JDE_getTagInfo.pmlmac
 * Adds a canonical entry for the pattern of extracting tag/element properties
 * via !!ce pseudo-variable with dot-notation attribute access.
 */

export const kbPatchMac25 = {
  entries: [
    {
      suggestedId: "macro-ce-property-extract",
      category: "macro",
      subcategory: "pseudo-variables",
      title: "Extracting tag/element properties via !!ce dot notation",
      principle:
        "Macros that need tag metadata should use !!ce as the current-element reference and access attributes via dot notation (.name, .desc, .acttype). Assign !!ce to a local !var first to avoid repeated pseudo-variable lookups.",
      rule:
        "Always assign !!ce to a local !var first. Use !local naming for all extracted properties. Consider BADREF checks if the macro may run on non-tag elements.",
      syntax: "!ref = !!ce\n!prop = !ref.attr",
      exampleCanonical: `!tag = !!ce
!tagName = !tag.name
!tagDescription = !tag.desc
!tagActtype = !tag.acttype`,
      exampleAntipattern: `!!ce.name -- accessing !!ce directly without caching`,
      pitfalls: [
        "If the current element is not a tag type, .desc or .acttype may return empty or error.",
        "Consider adding BADREF checks if the macro may run on non-tag elements.",
      ],
      relatedIds: ["pseudo-attr-ce", "dot-notation-attr-access", "local-var-scope"],
      sourcedoc: "PML1 Syntax.md, best-practices.md",
      sourcecodebase: "JDE_getTagInfo.pmlmac",
    },
  ],
};
