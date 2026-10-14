// One OpenSpec task group: worker builds it, reviewer checks the result against the specs.
const where = `openspec/changes/${args.change}`;
const build = await runs.run("build", { agent: "worker", task: `Implement task group ${args.group} of ${where}/tasks.md and nothing else. Read ${where}/proposal.md, design.md and specs/ first. Run the tests. Do not tick checkboxes. End with the files you changed.` });
const check = await runs.run("check", { agent: "reviewer", task: `Review the uncommitted changes (git diff) against ${where}/specs/ and task group ${args.group} of ${where}/tasks.md. Do not edit. End with one line, VERDICT: PASS or VERDICT: FAIL, then findings with file and line.\n\nFiles the builder says it changed:\n` + build.output });
return { verdict: /VERDICT:\s*PASS/.test(check.output) ? "PASS" : "FAIL", review: check.output };
