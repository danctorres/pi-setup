#!/bin/sh
# Per-repo setup, run inside the repo: OpenSpec for pi, the workflows and prompts, the models.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
[ -d openspec ] || openspec init --tools pi .
mkdir -p workflows .pi/prompts
# Drop links to workflows and prompts this checkout no longer has.
for l in workflows/* .pi/prompts/*; do
  [ -L "$l" ] && [ ! -e "$l" ] && case $(readlink "$l") in "$here"/*) rm "$l" ;; esac
done
ln -sf "$here"/workflows/*.js workflows/
ln -sf "$here"/prompts/*.md .pi/prompts/
# The links point into this checkout, so keep them out of the repo's history.
[ ! -s .gitignore ] || [ -z "$(tail -c1 .gitignore)" ] || echo >> .gitignore
for l in "$here"/workflows/*.js "$here"/prompts/*.md; do
  case $l in */workflows/*) l=workflows/${l##*/} ;; *) l=.pi/prompts/${l##*/} ;; esac
  grep -qxF "$l" .gitignore 2>/dev/null || echo "$l" >> .gitignore
done
pi-model-sync
