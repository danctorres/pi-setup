#!/bin/sh
# Per-repo setup, run inside the repo: OpenSpec for pi, the workflows, /opsx-verify-review, the apply guidance, the models.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
[ -d openspec ] || openspec init --tools pi .
mkdir -p workflows .pi/prompts
ln -sf "$here"/workflows/*.js workflows/
ln -sf "$here"/prompts/*.md .pi/prompts/
# The links point into this checkout, so keep them out of the repo's history.
for l in "$here"/workflows/*.js "$here"/prompts/*.md; do
  case $l in */workflows/*) l=workflows/${l##*/} ;; *) l=.pi/prompts/${l##*/} ;; esac
  grep -qxF "$l" .gitignore 2>/dev/null || echo "$l" >> .gitignore
done
grep -q '^operations:' openspec/config.yaml || cat >> openspec/config.yaml <<'Y'

operations:
  apply:
    guidance:
      - Do not edit code yourself. For each task group call the subagent tool with workflow "./workflows/opsx-apply.js", args {change, group} and async false.
      - Tick a group's tasks only when the returned verdict is PASS, then commit that group before starting the next, so the next reviewer's diff holds only the next group.
Y
pi-model-sync
