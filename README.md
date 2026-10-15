# pi-setup

pi as a lead agent that hands work to subagents: pi-subagents runs them, modelcmp picks each
role's model, OpenSpec drives the workflow, and the neoherdr subagents plugin shows each one in a pane.

Full write-up and test results: https://claude.ai/code/artifact/fa2d0ccf-8700-40e6-813b-a7cf02c2c1b0

## New machine

```sh
git clone https://github.com/danctorres/pi-setup ~/repos/pi-setup && ~/repos/pi-setup/install.sh
```

Needs `npm`, `jq` and `cargo` first. Then log pi in to your providers, and link the panes plugin:
`neoherdr plugin link <neoherdr checkout>/plugins/subagents`.

## New repository

```sh
cd ~/repos/myrepo && ~/repos/pi-setup/init-repo.sh
```

## Use

```sh
pi-model-sync      # refresh the models when prices or benchmarks move
pi --approve       # start the lead, inside herdr
```

Then `/opsx-propose <change>`, `/opsx-apply-review <change>`, `/opsx-verify-review <change>`, `/opsx-archive`.

To run a workflow, ask the lead to call the subagent tool with it, e.g.
"run `./workflows/build-review.js` with args `{task: \"add a --dry-run flag\"}`".

## Subagents

From pi-subagents (`~/.pi/agent/npm/node_modules/pi-subagents/agents/`). `pi-model-sync` sets the
first six to modelcmp's pick; the rest keep their defaults.

| Agent | Role | Model (task/tier) |
|---|---|---|
| `scout` | fast codebase recon, compressed context for handoff | value/low |
| `worker` | implements changes | coding/mid |
| `reviewer` | read-only review of diffs, plans, PRs; P0/P1/P2 findings and a merge verdict | reasoning/high |
| `oracle` | keeps decisions consistent with what came before | reasoning/high |
| `researcher` | web research brief | agentic/mid |
| `evidence-auditor` | checks research claims against their sources | reasoning/mid |
| `delegate` | lightweight, inherits the lead's model | lead's |
| `claude-code`, `codex-exec`, `cursor-agent` | that CLI, read-only; `-writer` variants may edit | that CLI's |

pi-subagents also ships prompts: `/parallel-review`, `/review-loop`, `/parallel-research`,
`/parallel-cleanup`, `/council`, `/gather-context-and-clarify`.

## Reviewing someone else's PR

```sh
gh pr checkout 123
gh pr diff 123 > /tmp/pr-123.diff
```

Then in pi: `/parallel-review PR 123, diff at /tmp/pr-123.diff`. The reviewer can't run git and its
diff tool only sees uncommitted changes, so it needs the diff as a file; the checkout lets it read
the surrounding code.

| File | What it is |
|---|---|
| `bin/pi-model-sync` | writes modelcmp's pick per role into `.pi/settings.json`; roles from `.pi/subagent-models` when present |
| `bin/pi-pane` | starts a full pi in a new herdr pane on modelcmp's pick and prints its answer |
| `workflows/scout-review.js` | scout maps a target, reviewer critiques it |
| `workflows/build-review.js` | any change, args `{task}`: worker builds, reviewer returns PASS or FAIL |
| `workflows/opsx-apply.js` | one OpenSpec task group: worker builds, reviewer returns PASS or FAIL |
| `workflows/opsx-verify.js` | a finished OpenSpec change, args `{change}`: reviewer checks code against the artifacts, PASS or FAIL |
| `prompts/opsx-apply-review.md` | `/opsx-apply-review <change>`: runs `opsx-apply.js` per group, commits each PASS; use it in place of `/opsx-apply` |
| `prompts/opsx-verify-review.md` | `/opsx-verify-review <change>`: runs `opsx-verify.js`, use it in place of `/opsx-verify` |

`/opsx-apply` treats the `operations.apply.guidance` from `init-repo.sh` as optional advice and implements
the tasks itself, so use `/opsx-apply-review` instead.
