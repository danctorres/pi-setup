#!/bin/sh
# Machine setup: pi, pi-subagents, modelcmp, OpenSpec, and the two scripts on PATH. Safe to run again.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
for c in npm jq cargo; do command -v $c >/dev/null || { echo "install.sh: $c is needed first" >&2; exit 1; }; done
command -v pi >/dev/null || npm i -g @earendil-works/pi-coding-agent
pi list 2>/dev/null | grep -q pi-subagents || pi install npm:pi-subagents
command -v modelcmp >/dev/null || cargo install --locked --git https://github.com/danctorres/modelcmp
command -v openspec >/dev/null || npm i -g @fission-ai/openspec
mkdir -p ~/.local/bin
ln -sf "$here/bin/pi-model-sync" "$here/bin/pi-pane" ~/.local/bin/
if command -v neoherdr >/dev/null; then
  neoherdr integration install pi
else
  echo "install.sh: no neoherdr found; build it (cargo install --path . --locked in its checkout), then run this again" >&2
fi
echo "done. Per repo: $here/init-repo.sh"
echo "neoherdr panes: neoherdr plugin link <neoherdr checkout>/plugins/subagents"
