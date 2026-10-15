---
description: Verify an OpenSpec change with a reviewer on another model, before archiving
argument-hint: "<change>"
---
Verify the OpenSpec change "$1" before it is archived. Do not check the code yourself: call the subagent
tool with workflow "./workflows/opsx-verify.js", args {change: "$1"} and async false. Then give the
verdict and every finding it returns, grouped by P0, P1 and P2. If the verdict is FAIL, say the change
is not ready to archive.
