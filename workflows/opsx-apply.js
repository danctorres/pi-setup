// One OpenSpec task group: worker builds it, reviewer checks the result against the specs.
if (!args?.change || !args?.group) throw new Error("opsx-apply.js needs args {change, group}");
const where = `openspec/changes/${args.change}`;
const build = await runs.run("build", { agent: "worker", task: `Implement task group ${args.group} of ${where}/tasks.md and nothing else. Read ${where}/proposal.md, design.md and specs/ first. Run the tests. Do not tick checkboxes. End with the files you changed.` });
const check = await runs.run("check", { agent: "reviewer", task: `Review the uncommitted changes (git diff) against ${where}/specs/ and task group ${args.group} of ${where}/tasks.md. Do not edit. List findings with file and line. End with the Merge verdict line from your output format.\n\nFiles the builder says it changed:\n` + build.output });
const v = [...check.output.matchAll(/^[\s*_>-]*merge verdict:?[\s*_]*(block|ok)/gim)].pop()?.[1];
return { verdict: v?.toLowerCase() === "ok" ? "PASS" : "FAIL", review: check.output };
