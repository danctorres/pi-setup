#!/bin/sh
# Machine setup: pi, pi-subagents, modelcmp, OpenSpec, and the two scripts on PATH. Safe to run again.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
for c in npm jq cargo; do command -v $c >/dev/null || { echo "install.sh: $c is needed first" >&2; exit 1; }; done
command -v pi >/dev/null || npm i -g --ignore-scripts @earendil-works/pi-coding-agent
pi list 2>/dev/null | grep -q pi-subagents || pi install npm:pi-subagents
pi list 2>/dev/null | grep -q pi-web-access || pi install npm:pi-web-access
# researcher and evidence-auditor need its web tools, and subagents started in the foreground don't load
# pi's extensions, so load it in every subagent. (A repo's agentOverrides replace user ones, so not there.)
d=${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}
s=$d/settings.json w=$d/npm/node_modules/pi-web-access
[ -s "$s" ] || echo '{}' > "$s"
jq --arg w "$w" '.subagents.defaultSubagentOnlyExtensions = ((.subagents.defaultSubagentOnlyExtensions // []) - [$w] + [$w])' "$s" > "$s.tmp" && mv "$s.tmp" "$s"
command -v modelcmp >/dev/null || cargo install --locked --git https://github.com/danctorres/modelcmp
command -v openspec >/dev/null || npm i -g @fission-ai/openspec
mkdir -p ~/.local/bin
ln -sf "$here/bin/pi-model-sync" "$here/bin/pi-handoff" ~/.local/bin/
# Lets herdr/neoherdr tell when pi is working or idle, which pi-handoff waits on. Both share the one pi extension.
if h=$(command -v neoherdr || command -v herdr); then
  "$h" integration install pi
else
  echo "install.sh: no neoherdr or herdr found; for panes, install one, then run this again" >&2
fi
echo "done. Per repo: $here/init-repo.sh"
echo "neoherdr panes: neoherdr plugin link <neoherdr checkout>/plugins/subagents"
