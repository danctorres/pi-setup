// scout maps the target, reviewer (a different model) critiques what scout found.
if (!args?.target) throw new Error("scout-review.js needs args {target}");
const scan = await runs.run("scan", {
  agent: "scout",
  task: `List what is in ${args.target} and summarise it in 3 lines.`,
});
const review = await runs.run("review", {
  agent: "reviewer",
  task: "In 2 lines, say what is missing from this summary:\n" + scan.output,
});
return { scan: scan.output, review: review.output };
