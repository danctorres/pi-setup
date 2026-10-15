// Any change: worker makes it, reviewer (a different model) checks the diff at the end.
if (!args?.task) throw new Error("build-review.js needs args {task}");
const build = await runs.run("build", { agent: "worker", task: `${args.task}\n\nRun the tests. End with the files you changed.` });
const check = await runs.run("check", { agent: "reviewer", task: `Review the uncommitted changes (git diff) against this request:\n${args.task}\n\nLook for mistakes in the code itself (bugs, broken edge cases, failing tests) as well as anything the request asked for that is missing. Do not edit. List each mistake with file, line and what is wrong. End with the Merge verdict line from your output format.\n\nFiles the builder says it changed:\n` + build.output });
const v = [...check.output.matchAll(/^[\s*_>-]*merge verdict:?[\s*_`]*(block|ok)/gim)].pop()?.[1];
return { verdict: v?.toLowerCase() === "ok" ? "PASS" : "FAIL", build: build.output, review: check.output };
