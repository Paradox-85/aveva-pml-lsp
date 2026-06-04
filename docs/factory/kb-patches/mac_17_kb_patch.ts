// Auto-generated KB patch draft from docs/factory Phase 1 full-cycle runner.
// Source: docs/codebase/macros/JDE_class-mapping-rename.pmlmac
// Status: draft only. Do not apply automatically.

export const mac17KbPatchDraft = [
  {
    id: 'mac_17_colon_dynamic_property_access',
    category: 'pml-pattern',
    title: 'Colon dynamic property access (:PropertyName)',
    description: 'PML colon syntax for dynamic property access on dbref objects. Used to access attributes whose names are stored in variables or are derived from linked references. Syntax: !ref.:PropertyName accesses the attribute named "PropertyName" on the object referenced by !ref. Commonly used with mapping references to read linked object attributes.',
    example: '!classGroupName = !classAttributeItemRef.:MappingRefToClassGroup.namn\n!attributeName = !classAttributeItemRef.:MappingRefToAttributeMapping.namn',
    source: 'JDE_class-mapping-rename.pmlmac',
    tags: ['colon', 'dynamic-property', 'dbref', 'namn']
  },
  {
    id: 'mac_17_string_interpolation_dollar_var',
    category: 'pml-pattern',
    title: 'Pipe string interpolation with $! variable substitution',
    description: 'PML pipe-delimited strings with $! prefix for variable substitution inside the string. The $! causes the following variable name to be expanded inline. Example: |/$!<classGroupName>/$!<attributeName>| produces a string like /ClassName/AttributeName. This differs from string concatenation using & operator.',
    example: '!name = |/$!<classGroupName>/$!<attributeName>|\n$P $!classAttributeItem NAME $!name',
    source: 'JDE_class-mapping-rename.pmlmac',
    tags: ['string-interpolation', 'pipe-string', 'dollar-bang', 'substitution']
  },
  {
    id: 'mac_17_isnamed_pseudo_attribute',
    category: 'pml-pattern',
    title: 'ISNAMED pseudo-attribute for filtering unnamed elements',
    description: 'ISNAMED is a PML pseudo-attribute used in collect all filters to check whether an element has been named. Returns TRUE if the element has a name, FALSE if unnamed. Useful for filtering named vs unnamed elements in collections. Often negated with NOT in filter conditions.',
    example: 'var !unnamed collect all PIPE with (not(ISNAMED))\nvar !named collect all PIPE with (ISNAMED)',
    source: 'JDE_class-mapping-rename.pmlmac',
    tags: ['isnamed', 'pseudo-attribute', 'filter', 'named']
  },
  {
    id: 'mac_17_badref_method',
    category: 'pml-pattern',
    title: 'badref() method for reference validation',
    description: 'The badref() method tests whether a reference is a bad (invalid/null) reference. Returns TRUE if the reference is bad, FALSE if valid. Commonly used with NOT in collect all filters to ensure linked references are valid before accessing their attributes.',
    example: 'var !valid collect all OBJECT with (not(badref(:LinkedRef)))\nif ( !ref.badref() ) then\n  -- reference is bad\nendif',
    source: 'JDE_class-mapping-rename.pmlmac',
    tags: ['badref', 'reference-validation', 'filter']
  }
] as const;
