// Any change: worker makes it, reviewer (a different model) checks the diff at the end.
const build = await runs.run("build", { agent: "worker", task: `${args.task}\n\nRun the tests. End with the files you changed.` });
const check = await runs.run("check", { agent: "reviewer", task: `Review the uncommitted changes (git diff) against this request:\n${args.task}\n\nLook for mistakes in the code itself (bugs, broken edge cases, failing tests) as well as anything the request asked for that is missing. Do not edit. End with one line, VERDICT: PASS or VERDICT: FAIL, then each mistake with file, line and what is wrong.\n\nFiles the builder says it changed:\n` + build.output });
return { verdict: /VERDICT:\s*PASS/.test(check.output) ? "PASS" : "FAIL", review: check.output };
