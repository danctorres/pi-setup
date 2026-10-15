#!/bin/sh
# Per-repo setup, run inside the repo: OpenSpec for pi, the workflows, /opsx-verify-review, the apply guidance, the models.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
[ -d openspec ] || openspec init --tools pi .
mkdir -p workflows .pi/prompts
ln -sf "$here"/workflows/*.js workflows/
ln -sf "$here"/prompts/*.md .pi/prompts/
grep -q '^operations:' openspec/config.yaml || cat >> openspec/config.yaml <<'Y'

operations:
  apply:
    guidance:
      - Do not edit code yourself. For each task group call the subagent tool with workflow "./workflows/opsx-apply.js", args {change, group} and async false.
      - Tick a group's tasks only when the returned verdict is PASS.
Y
pi-model-sync
