// One OpenSpec task group: worker builds it, pi runs the tests (args.test), reviewer checks it against the specs.
if (!args?.change || !args?.group)
  throw new Error("opsx-apply.js needs args {change, group, test?}");
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
// gate: pi runs the command after the worker and fails the run if it fails; the reviewer can't run tests.
// runs.all, unlike runs.run, returns a failed child instead of throwing, so its report survives.
// The lead is blocked while this runs and can't answer contact_supervisor, so the worker must not wait on it.
const [build] = await runs.all([
  {
    key: "build",
    agent: "worker",
    task: `Implement task group ${args.group} of ${where}/tasks.md and nothing else. Read ${where}/proposal.md, design.md (if there) and specs/ first. Run the tests. Do not tick checkboxes. If you need a decision (for example, the plan contradicts itself), do not ask or wait for one: stop and end with the question. End with the files you changed.`,
    ...(args.test ? { gate: args.test } : {}),
  },
]);
// A failed build is FAIL anyway and gets reviewed on the retry, so skip the reviewer.
const v = !build.ok
  ? { findings: [] }
  : (
      await runs.run("check", {
        agent: "reviewer",
        task:
          `Review the uncommitted changes (watchdog_diff) against ${where}/specs/ and task group ${args.group} of ${where}/tasks.md. Do not edit. Verdict "block" if any P0.\n\nWhat the builder reported:\n` +
          build.output,
        outputSchema: review,
      })
    ).structuredOutput;
return {
  verdict: build.ok && v.verdict === "ok" ? "PASS" : "FAIL",
  tests: !args.test ? "not run" : build.ok ? "passed" : "not passed",
  ...(build.ok ? {} : { error: build.error ?? "stopped" }),
  build: build.output,
  findings: v.findings,
};
