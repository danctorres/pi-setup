// A finished OpenSpec change: reviewer (not the model that built it) checks the code against its artifacts.
if (!args?.change) throw new Error("opsx-verify.js needs args {change}");
const where = `openspec/changes/${args.change}`;
const check = await runs.run("verify", { agent: "reviewer", task: `Verify the implementation of ${where} before it is archived. Read ${where}/proposal.md, tasks.md, design.md (if there) and specs/, then find the code each requirement and scenario is about. Check completeness (every task ticked, every requirement implemented), correctness (each scenario handled, with a test that covers it) and coherence (the code follows design.md and the repo's patterns). Do not edit. Use P0 for what must be fixed before archiving. End with the Merge verdict line from your output format.` });
const v = [...check.output.matchAll(/^[\s*_>-]*merge verdict:?[\s*_]*(block|ok)/gim)].pop()?.[1];
return { verdict: v?.toLowerCase() === "ok" ? "PASS" : "FAIL", review: check.output };
