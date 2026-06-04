/**
 * KB Patch for mac_40 — LOOPDATA object documentation
 *
 * Source file: docs/codebase/macros/loop-data-update.pmlmac
 * Review gap score: 0.55 (action: patch_kb)
 *
 * This patch adds a KB entry for the LOOPDATA object and its methods
 * which were absent from the knowledge base.
 */

import { KBEntry, KBCategory } from '../../../src/knowledge/schemas/kb-entry';

export const mac_40_patch: KBEntry = {
  id: 'loopdata_object',
  category: 'objects' as KBCategory,
  subcategory: 'loopdata',
  title: 'LOOPDATA Object — Data Export and Logging',
  principle:
    'LOOPDATA is an AVEVA system object for exporting loop data and instrument field information to external files such as Excel spreadsheets.',
  rule:
    'Use PML RELOAD OBJECT LOOPDATA before instantiation. Create an instance with object LOOPDATA(), call GetData() to populate data, set InstrumentFieldDataTransfer(false) to disable instrument field transfer, set pathName to the export directory, and call SaveLog(filename, overwrite) to write the export.',
  syntax: `!loop = object LOOPDATA()
!loop.GetData()
!loop.InstrumentFieldDataTransfer(FALSE)
!loop.pathName = |<export_path>|
!loop.SaveLog(|<filename>.xlsx|, FALSE)`,
  exampleCanonical: `-- CB loop-data-update.pmlmac
PML RELOAD OBJECT LOOPDATA

!loop = object LOOPDATA()

!loop.GetData()

!loop.InstrumentFieldDataTransfer(FALSE)

!loop.pathName = |C:\\path\\to\\log|

!loop.SaveLog(|loop-data-update-log.xlsx|, FALSE)`,
  exampleAntipattern: '',
  pitfalls: [
    'LOOPDATA must be reloaded with PML RELOAD OBJECT LOOPDATA before first use in a PML session.',
    'pathName must reference a writable directory on the target machine.',
    'SaveLog second argument is a BOOLEAN: TRUE overwrites existing file, FALSE does not.',
    'GetData() must be called before SaveLog() to populate the export data.',
  ],
  relatedIds: [],
  sourcedoc: 'AVEVA E3D LOOPDATA class documentation',
  sourcecodebase: 'loop-data-update.pmlmac',
};
