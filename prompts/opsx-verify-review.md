---
description: Verify an OpenSpec change with a reviewer on another model, before archiving
argument-hint: "<change>"
---
Verify the OpenSpec change "$1" before it is archived. Do not check the code yourself: call the subagent
tool with workflow "./workflows/opsx-verify.js", args {change: "$1"}, async false and options {timeoutMs: 3600000}, and no other fields. Then give the
verdict and every finding it returns (severity, file, line, issue), grouped by P0, P1 and P2. Then run the
project's tests yourself (the reviewer cannot); a failing test counts as P0. If the verdict is FAIL or a
test fails, say the change is not ready to archive.
