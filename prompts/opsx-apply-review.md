---
description: Apply an OpenSpec change one task group at a time, a worker builds and a reviewer on another model checks
argument-hint: "<change>"
---
Apply the OpenSpec change "$1". Do not edit code yourself. Read openspec/changes/$1/tasks.md and, for each
task group that still has unticked tasks, in order:
1. Call the subagent tool with workflow "./workflows/opsx-apply.js", args {change: "$1", group: <group number>}
   and async false.
2. If the verdict is PASS, run the project's tests yourself (the reviewer cannot). If they fail, treat it
   as FAIL. Otherwise tick that group's tasks in tasks.md and, once that edit is done, commit everything
   with the message "$1: task group <n>", so the next reviewer's diff holds only the next group.
3. If the verdict is FAIL, stop. Leave the changes uncommitted and give the reviewer's findings and any
   failing tests.
When every group has passed, say so and suggest /opsx-verify-review $1.
