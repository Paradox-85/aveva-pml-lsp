import { KBEntry } from '../../../../src/knowledge/schemas/kb-entry';

export const mac_46_kb_patches: KBEntry[] = [
  {
    id: 'pdl_dbref_attr_access',
    category: 'pdmsinteraction',
    subcategory: 'dbref',
    title: 'DBREF-to-PDMS-Object Attribute Access via .:  Syntax',
    principle: 'Use .:  (dot-colon) notation to access PDMS object attributes from a PML DBREF variable. Unlike .query() which returns attribute values as strings, .:  provides direct object reference access for nested attribute chains.',
    rule: 'After assigning a DBREF to a PML variable, use !dbref.:AttributeName to access any PDMS object attribute. Nested attributes chain with additional .: , e.g., !obj.:HavePartOutGoingConnections.[1].:RefConnectionsOut.',
    syntax: '!dbref = !name.dbref()\n!attr = !dbref.:AttributeName\n!nested = !dbref.:Parent.:Child',
    exampleCanonical: '-- CB mac_46 (TB terminal correction macro)\n!ces = !!collectallfor(|CE|, ||, world)\ndo !ce values !ces\n  !!ce = !ce\n  !terminals = !!ce.:HavePartTerminals\n  !channels  = !!ce.:HavePartChannels\n  do !idx indices !terminals\n    !terminal = !terminals[!idx]\n    !outConn  = !terminal.:HavePartOutGoingConnections\n    !signals  = !terminal.:refPropagatedSignals\n  enddo\nenddo',
    exampleAntipattern: '-- BAD: Using .query() for nested attributes\n!attr = !ce.query(|HavePartOutGoingConnections|)\n-- .query() returns a string, not a collection reference',
    pitfalls: [
      '.:  requires a valid PDMS object reference; a BADREF will throw an error',
      'Unlike .query(), .:  returns the actual object/collection, not a string value',
      'Attribute names are case-insensitive in PML but should follow AVEVA canonical casing',
      'Chained .:  access like !a.:X.:Y requires that !a.:X returns an object'
    ],
    relatedIds: ['pml_dbref_creation', 'pml_query_vs_attr_access'],
    sourcedoc: 'AVEVA PDMS Customization Guide — Object Attribute Access',
    sourcecodebase: 'TB terminal correction macro.pmlmac'
  },
  {
    id: 'pml_block_constructor',
    category: 'datatypes',
    subcategory: 'block',
    title: 'object BLOCK(...) Constructor for Collection Evaluation',
    principle: 'Use object BLOCK(...) to create an inline code block that can be passed to collection methods like evaluate(). The block is evaluated once per collection element with the element referenced by the loop variable.',
    rule: 'Wrap a PML expression in object BLOCK(|expression|) to pass it as a block argument. Inside the block, use the loop variable name (e.g., !evalIndex) to access the current collection element.',
    syntax: '!result = !collection.evaluate(object BLOCK(|!loopVar.:Attribute|))',
    exampleCanonical: '-- CB mac_46 (TB terminal correction macro)\n!markings = !channelTerminals.evaluate(\n  object BLOCK(|!channelTerminals[!evalIndex].:marking[1]|)\n)',
    exampleAntipattern: '-- BAD: Passing a string instead of a block\n!markings = !channelTerminals.evaluate(\'|!channelTerminals[!evalIndex].:marking[1]|\')',
    pitfalls: [
      'The variable name inside object BLOCK must match the implicit iteration variable of the collection',
      'object BLOCK(...) is not the same as a string expression — it creates a PML code block',
      'Block variables are scoped to the evaluate() call',
      'The block expression is evaluated in the context of each collection element'
    ],
    relatedIds: ['array_evaluate_method', 'collection_iteration'],
    sourcedoc: 'AVEVA PML Reference — Collection Methods',
    sourcecodebase: 'TB terminal correction macro.pmlmac'
  },
  {
    id: 'pdms_terminal_attribute_names',
    category: 'pdmsinteraction',
    subcategory: 'terminals',
    title: 'Canonical AVEVA PDMS Terminal and Connection Attribute Names',
    principle: 'PDMS objects use specific PascalCased attribute names for terminal and connection management. These attributes are case-insensitive in PML but should be referenced with canonical casing for consistency.',
    rule: 'Use the canonical attribute names listed below when accessing terminal and connection data on PDMS objects. Do not mix casing within a single codebase.',
    syntax: `!terminals  = !ce.:HavePartTerminals
!channels   = !ce.:HavePartChannels
!outConn    = !terminal.:HavePartOutGoingConnections
!inConn     = !terminal.:HavePartIncomingConnections
!chanTerms  = !channel.:HavePartChannelTerminals
!refOut     = !conn.:RefConnectionsOut
!refIn      = !conn.:RefConnectionsIn
!actType    = !conn.:acttype`,
    exampleCanonical: '-- CB mac_46 (TB terminal correction macro)\n!terminals = !!ce.:HavePartTerminals\n!channels  = !!ce.:HavePartChannels\ndo !idx indices !terminals\n  !terminal = !terminals[!idx]\n  !channel  = !channels[!idx]\n  !signals  = !terminal.:refPropagatedSignals\n  !outConn  = !terminal.:HavePartOutGoingConnections\nenddo',
    exampleAntipattern: '-- BAD: Inconsistent casing in same file\n!terminals = !!ce.:HavePartTerminals\n!chanTerms = !channel.:havepartchannelTerminals\n!outConn   = !terminal.:Havepartoutgoingconnections',
    pitfalls: [
      'Attribute names are case-insensitive in PML but inconsistent casing causes maintenance issues',
      'Some attributes return collections (ARRAY/COLLECTION), others return single values',
      'refPropagatedSignals may be unset() for terminals with no propagated signals',
      'acttype returns a string like ":IncomingConnection" — compare with .eqnocase()'
    ],
    relatedIds: ['pdl_dbref_attr_access', 'array_remove_method', 'collection_set_unset'],
    sourcedoc: 'AVEVA PDMS Object Reference — Terminal and Connection Attributes',
    sourcecodebase: 'TB terminal correction macro.pmlmac'
  },
  {
    id: 'pml_eqnocase_method',
    category: 'typeconversion',
    subcategory: 'string',
    title: 'Case-Insensitive String Comparison with eqnocase()',
    principle: 'Use .eqnocase() method for case-insensitive string comparison. This is equivalent to .eq() but ignores letter case differences.',
    rule: 'Call .eqnocase(|value|) on a STRING object to compare against another string ignoring case. Returns TRUE if strings match regardless of case.',
    syntax: '!isMatch = !str1.eqnocase(|value|)',
    exampleCanonical: '-- CB mac_46 (TB terminal correction macro)\n!isIncomConn = !outConn[1].:RefConnectionsOut.acttype.eqnocase(|:IncomingConnection|)',
    exampleAntipattern: '-- BAD: Using .eq() for case-insensitive comparison\n!isMatch = !str1.eq(|:incomingconnection|)\n-- fails if case differs',
    pitfalls: [
      'eqnocase() is a STRING method; ensure the receiver is a STRING',
      'Not available on non-string PML types',
      'Use .eq() for case-sensitive comparison when needed',
      'eqnocase() may behave differently for non-ASCII characters'
    ],
    relatedIds: ['string_equality_methods', 'pml_operators'],
    sourcedoc: 'AVEVA PML Reference — String Methods',
    sourcecodebase: 'TB terminal correction macro.pmlmac'
  },
  {
    id: 'pml_nested_loop_collection_mutation',
    category: 'controlflow',
    subcategory: 'nested_loops',
    title: 'Nested DO/ENDDO with Indices Iteration and Collection.remove()',
    principle: 'When iterating over a collection by indices and conditionally removing elements, the loop index must account for shifting indices after removal. Using "indices" in the DO clause captures the index set at loop entry time, but removing elements shifts subsequent indices.',
    rule: 'When using DO !idx indices !collection with conditional .remove(), be aware that removing element at !idx shifts all higher indices down by 1. Consider iterating in reverse or using a while loop with manual index control.',
    syntax: `do !idx indices !collection
  !ele = !collection[!idx]
  if (shouldRemove(!ele)) then
    !collection.remove(!idx)
    -- Note: higher indices have shifted!
  endif
enddo`,
    exampleCanonical: '-- CB mac_46 (TB terminal correction macro)\ndo !d indices !incConn\n  !ele     = !incConn[!d]\n  !refCon  = !ele.:RefConnectionsIn\n  if (!refCon.unset()) then\n    !incConn.remove(!d)\n  else\n    break\n  endif\nenddo',
    exampleAntipattern: '-- BAD: Assuming indices are stable after remove\n-- This loop may skip elements or access invalid indices\ndo !idx indices !items\n  if (bad(!items[!idx])) then\n    !items.remove(!idx)\n    -- Next iteration !idx+1 points to wrong element\n  endif\nenddo',
    pitfalls: [
      'remove() shifts all higher indices — elements may be skipped',
      'Using "indices" captures the index set at loop start; removed elements still have valid index values but point to different elements',
      'break exits the entire loop, potentially leaving unprocessed elements',
      'Iterating in reverse (FROM !size TO 1) avoids index-shifting issues',
      'Consider collecting indices to remove first, then removing in reverse order'
    ],
    relatedIds: ['array_remove_method', 'do_indices_vs_values', 'pml_break_continue'],
    sourcedoc: 'AVEVA PML Reference — Control Flow',
    sourcecodebase: 'TB terminal correction macro.pmlmac'
  }
];
