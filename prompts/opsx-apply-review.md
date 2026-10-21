---
description: Apply an OpenSpec change one task group at a time, a worker builds, pi runs the tests and a reviewer on another model checks
argument-hint: "<change>"
---
Apply the OpenSpec change "$1". Do not edit code yourself. First run `git status --porcelain`: if it lists
any path outside openspec/changes/$1/, stop and ask me to commit, stash or discard those changes first, so
each reviewer's diff holds only one group. If openspec/changes/$1/ has uncommitted changes, commit them with
the message "$1: plan". Find the command that runs this project's tests (package.json, Makefile, README, CI
config). Then read openspec/changes/$1/tasks.md and, for each task group that still has unticked tasks, one
group at a time and in order:
1. Once every earlier commit has returned, call the subagent tool, alone in its turn (pi runs a turn's tool
   calls at the same time, so a commit sent with it would race the worker), with workflow
   "./workflows/opsx-apply.js", args {change: "$1", group: <group number>, test: "<the test command>"} (leave
   test out if the project has no tests yet; look again before each group, since a worker may have added
   some), async false and options {timeoutMs: 3600000}, and no other fields.
2. If the verdict is PASS, tick that group's tasks in tasks.md, delete any untracked test or build output the
   repo doesn't ignore (for example __pycache__/), and once that is done, commit everything (`git add -A`)
   with the message "$1: task group <n>". Keep the group's findings for the end.
3. If the verdict is FAIL, stop. Leave the changes uncommitted and give every finding. If there is an error,
   the build failed and the reviewer was skipped: give the error and the worker's report (build), then run
   the tests and show what failed.
When every group has passed, say so, give the findings the groups passed with, and suggest
/opsx-verify-review $1.
