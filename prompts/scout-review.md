---
description: Check the setup works, a scout summarises a folder and a reviewer on another model says what it missed
argument-hint: "[folder]"
---
Call the subagent tool with workflow "./workflows/scout-review.js", args {target: "${@:-.}"} and async false.
Then give the scout's summary and the reviewer's reply. If either step failed, say which and show the error.
