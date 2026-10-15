#!/bin/sh
# Per-repo setup, run inside the repo: OpenSpec for pi, the workflows and prompts, the models.
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
pi-model-sync
