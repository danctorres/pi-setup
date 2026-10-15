---
description: Make a change with a worker, then have a reviewer on another model check it
argument-hint: "<what to change>"
---
Do not edit code yourself. Call the subagent tool with workflow "./workflows/build-review.js",
args {task: "$@"} and async false. Then give the verdict, the files changed and the test results from
the build report, and every finding in the review. Then run the project's tests yourself (the reviewer
cannot); if they fail, the verdict is FAIL. If the verdict is FAIL, say the change is not ready.
Do not commit.
