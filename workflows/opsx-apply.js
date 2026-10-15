// One OpenSpec task group: worker builds it, pi runs the tests (args.test), reviewer checks it against the specs.
if (!args?.change || !args?.group) throw new Error("opsx-apply.js needs args {change, group, test?}");
const where = `openspec/changes/${args.change}`;
const review = { type: "object", additionalProperties: false, required: ["verdict", "findings"], properties: {
  verdict: { enum: ["ok", "block"] },
  findings: { type: "array", items: { type: "object", additionalProperties: false, required: ["severity", "file", "issue"], properties: {
    severity: { enum: ["P0", "P1", "P2"] }, file: { type: "string" }, line: { type: "integer" }, issue: { type: "string" } } } } } };
// gate: pi runs the command after the worker and fails the run if it fails; the reviewer can't run tests.
const build = await runs.run("build", { agent: "worker", task: `Implement task group ${args.group} of ${where}/tasks.md and nothing else. Read ${where}/proposal.md, design.md and specs/ first. Run the tests. Do not tick checkboxes. End with the files you changed.`, ...(args.test ? { gate: args.test } : {}) })
  .then(r => ({ ok: true, output: r.output }), e => ({ ok: false, output: String(e) }));
const check = await runs.run("check", { agent: "reviewer", task: `Review the uncommitted changes (watchdog_diff) against ${where}/specs/ and task group ${args.group} of ${where}/tasks.md. Do not edit. Verdict "block" if any P0.\n\nWhat the builder reported:\n` + build.output, outputSchema: review });
const v = check.structuredOutput;
return { verdict: build.ok && v.verdict === "ok" ? "PASS" : "FAIL", tests: !args.test ? "not run" : build.ok ? "passed" : "failed", build: build.output, findings: v.findings };
