---
description: Apply an OpenSpec change one task group at a time, a worker builds, pi runs the tests and a reviewer on another model checks
argument-hint: "<change>"
---
Apply the OpenSpec change "$1". Do not edit code yourself. First find the command that runs this project's
tests (package.json, Makefile, README, CI config), and run `git status --porcelain`: the paths it lists now
are not part of this change, so never commit them. Then read openspec/changes/$1/tasks.md and, for each task
group that still has unticked tasks, one group at a time and in order (finish step 2's commit before
starting the next group):
1. Call the subagent tool with workflow "./workflows/opsx-apply.js", args {change: "$1", group: <group number>,
   test: "<the test command>"} (leave test out if the project has no tests) and async false, and no other fields.
2. If the verdict is PASS, tick that group's tasks in tasks.md and, once that edit is done, commit tasks.md and
   the worker's changes (the paths `git status --porcelain` lists now that it did not list at the start; the
   result's build report names them too) with `git add -- <paths>`, never `git add -A`, and the message
   "$1: task group <n>", so the next reviewer's diff holds only the next group.
3. If the verdict is FAIL, stop. Leave the changes uncommitted and give every finding. If tests is "failed",
   run the tests and show what failed.
When every group has passed, say so and suggest /opsx-verify-review $1.
