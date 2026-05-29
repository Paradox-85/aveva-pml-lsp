export const prompts = [
  {
    name: 'write_macro',
    description: 'Guide an LLM to write AVEVA PML using official syntax constraints.',
    arguments: [
      { name: 'task', description: 'What the macro should do.', required: true },
      { name: 'pml_version', description: 'PML1, PML2, or both.', required: false },
    ],
    load: async ({ task, pml_version }: { task: string; pml_version?: string }) => `Write AVEVA PML ${pml_version ?? 'PML2'} code for: ${task}\n\nUse official PML syntax. Prefer DO/ENDDO loops, IF/ELSEIF/ELSE/ENDIF, !local variables, !!global functions/forms, and validate with lint_pml_code before returning.`,
  },
  {
    name: 'review_code',
    description: 'Review AVEVA PML code for syntax, hallucinated constructs, and maintainability.',
    arguments: [{ name: 'code', description: 'PML code to review.', required: true }],
    load: async ({ code }: { code: string }) => `Review this AVEVA PML code. Check syntax, PML1/PML2 compatibility, callbacks, array indices, and hallucinated non-PML constructs.\n\n${code}`,
  },
];
