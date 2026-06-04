/**
 * KB patch generated from mac_26 gap analysis.
 * Adds missing DATETIME object methods to the knowledge base.
 */

export const kbPatch_mac_26 = {
  entries: [
    {
      id: "object-datetime-methods",
      title: "DATETIME Object Methods",
      category: "object",
      description:
        "OBJECT DATETIME() creates a DATETIME object representing the current date and time. Individual components are accessed via method calls. Components return INTEGER values that can be further converted to STRING via .string('I2') for zero-padded formatting.",
      codeExample: `!now = OBJECT DATETIME()
!year = !now.year()
!month = !now.month().string('I2')
!day = !now.date().string('I2')
!hour = !now.hour().string('I2')
!minute = !now.minute().string('I2')
-- Result: year=2026, month="06", day="03", hour="14", minute="05"`,
      tags: ["datetime", "date", "time", "timestamp", "OBJECT"],
      source: "mac_26 (JDE_leirvik_tag_export.pmlmac)",
      severity: "high"
    }
  ]
};
