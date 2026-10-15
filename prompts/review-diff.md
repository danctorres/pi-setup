---
description: Review a commit, a branch, a PR or only the unstaged changes, with parallel reviewers on a diff file
argument-hint: "[commit <sha> | branch [<base>] | PR <n> | unstaged]"
---
Review target: "$@" (empty means all uncommitted changes).

The reviewers have no shell and on their own only see uncommitted changes, so first write the target's diff
to a new temporary file (made with `mktemp`) yourself:
- commit <sha>: `git show <sha>`
- branch [<base>]: `git diff <base>...HEAD`; base defaults to the repo's default branch
- PR <n>: `gh pr checkout <n>`, then `gh pr diff <n>`. If the working tree has uncommitted changes, stop and
  say so instead of checking out.
- unstaged: `git diff`
- empty: write no file; the reviewers use their own diff tool.
If the diff is empty, say so and stop.

Then launch three reviewer subagents in parallel, with fresh context, each with a distinct angle you pick for
this change (for example correctness, tests, simplicity). Give each the diff file's path and tell it that the
file is the change under review and the working tree holds the surrounding code. Ask for evidence-backed
findings with file and line, labelled P0 (blocks merge), P1 or P2, ending with `Merge verdict: BLOCK`,
`Merge verdict: OK` or `Merge verdict: OK with notes`, or exactly `No issues found.` Reviewers must not edit
files.

Then sum up: fixes worth doing now, optional improvements, and what to ignore with a short reason. Do not
apply any fix unless I ask.
