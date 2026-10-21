// A finished OpenSpec change: reviewer (not the model that built it) checks the code against its artifacts.
if (!args?.change) throw new Error("opsx-verify.js needs args {change}");
const where = `openspec/changes/${args.change}`;
const review = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "findings"],
  properties: {
    verdict: { enum: ["ok", "block"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "file", "issue"],
        properties: {
          severity: { enum: ["P0", "P1", "P2"] },
          file: { type: "string" },
          line: { type: "integer" },
          issue: { type: "string" },
        },
      },
    },
  },
};
const check = await runs.run("verify", {
  agent: "reviewer",
  task: `Verify the implementation of ${where} before it is archived. Read ${where}/proposal.md, tasks.md, design.md (if there) and specs/, then find the code each requirement and scenario is about. Check completeness (every task ticked, every requirement implemented), correctness (each scenario handled, with a test that covers it) and coherence (the code follows design.md and the repo's patterns). Do not edit. Use P0 for what must be fixed before archiving; verdict "block" if any P0.`,
  outputSchema: review,
});
const v = check.structuredOutput;
return { verdict: v.verdict === "ok" ? "PASS" : "FAIL", findings: v.findings };
