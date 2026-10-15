# pi-setup

Use the [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) coding agent as a lead
that hands work out instead of doing it all itself. You talk to one pi session, the **lead**. It
gives coding to a **worker** subagent, and a **reviewer** subagent on a *different* model checks the
result before it counts as done, so one model's blind spots don't go unchecked. The lead then runs
the tests itself, since the reviewer only reads code.

What's in here, and what does what:

- [pi-subagents](https://www.npmjs.com/package/pi-subagents) runs the subagents (worker, reviewer, scout, …).
- [pi-web-access](https://www.npmjs.com/package/pi-web-access) gives the `researcher` and `evidence-auditor`
  subagents web search and page fetching, with no API key needed.
- [modelcmp](https://github.com/danctorres/modelcmp) picks each subagent's model from current prices
  and benchmarks, out of the models your pi logins can reach.
- [OpenSpec](https://www.npmjs.com/package/@fission-ai/openspec) makes bigger changes plan-first: a
  written proposal, specs and a task list, then the code.
- [neoherdr](https://github.com/danctorres/neoherdr) (optional) is a terminal multiplexer, a fork of
  [herdr](https://herdr.dev). Its subagents plugin opens a pane for each subagent so you can watch it work.

## What you can do

| You want to | Run, inside pi |
|---|---|
| Plan a change, then have it built and reviewed task group by task group | `/opsx-propose <change>`, then `/opsx-apply-review <change>` |
| Check a finished change against its plan before closing it | `/opsx-verify-review <change>`, then `/opsx-archive` |
| Check that your setup works, right after installing | `/scout-review` (or `/scout-review src` for one folder) |
| Make a small change with a review, no plan | `/build-review add a --dry-run flag` |
| Review a PR, yours or someone else's | `/parallel-review` (see [Reviewing a PR](#reviewing-a-pr)) |
| Research a question, clean up code, get several opinions | `/parallel-research`, `/parallel-cleanup`, `/council` |
| Hand one task to a separate, visible pi session | `pi-pane` in a shell (see [pi-pane](#pi-pane)) |

## Install (once per machine)

You need `git`, `npm`, `jq` and `cargo` (Rust). The scripts are POSIX `sh`, tested on Linux and WSL.

```sh
git clone https://github.com/danctorres/pi-setup ~/repos/pi-setup
~/repos/pi-setup/install.sh
```

You can clone it anywhere; the commands below assume `~/repos/pi-setup`. `install.sh` installs pi,
pi-subagents, pi-web-access, modelcmp and OpenSpec if they are missing, sets every subagent to load
pi-web-access's web tools, and puts `pi-model-sync` and `pi-pane` in
`~/.local/bin` (make sure that's on your `PATH`). It is safe to run again.

**Log in to a model provider.** Start `pi` and run `/login`. Use an API key, or an
[OpenRouter](https://openrouter.ai) key to reach many providers with one account. A Claude
subscription (Pro/Max) login does not work: Anthropic refuses it from third-party apps unless your plan
has extra usage. The setup works best when you can reach models from more than one provider, so the
reviewer can be a different model from the worker.

**Optional, to watch subagents in panes:** build neoherdr and link its plugin, then run `install.sh` again
so it can install neoherdr's pi integration.

```sh
git clone https://github.com/danctorres/neoherdr ~/repos/neoherdr
cd ~/repos/neoherdr && cargo install --path . --locked
neoherdr plugin link ~/repos/neoherdr/plugins/subagents
~/repos/pi-setup/install.sh
```

## Set up a repository (once per repo, by each person)

```sh
cd ~/repos/myrepo && ~/repos/pi-setup/init-repo.sh
```

This:

- runs `openspec init` if the repo has no `openspec/` yet, which adds `openspec/`, `.pi/skills/` and the
  `/opsx-*` prompts in `.pi/prompts/`
- links this repo's `workflows/*.js` into `workflows/` and its prompts into `.pi/prompts/`, and adds those
  links to `.gitignore` (they point into your checkout, so they don't belong in git)
- writes each subagent's model into `.pi/settings.json` (see [Models](#models))

Commit `openspec/`, `.pi/skills/`, OpenSpec's `.pi/prompts/opsx-*.md` and `.gitignore`. Everyone else on
the repo runs `init-repo.sh` once to get their own links and models. Leave `.pi/settings.json` out of git
(add it to `.gitignore`) unless everyone logs in to the same providers: it holds the models picked for your
logins, and each person's `pi-model-sync` would overwrite it.

## Use

Start pi in the repo, inside neoherdr if you want the panes:

```sh
pi --approve
```

`--approve` trusts the repo's `.pi/` folder for this run. Without it pi asks first, and if you decline it
ignores the model choices and prompts this setup adds.

The first time, run `/scout-review`. A scout summarises the repo and a reviewer says what it missed. If
both answer, your logins, models and subagents work.

### Plan-first changes with OpenSpec

1. `/opsx-propose add-dark-mode`: the lead asks what you want, then writes
   `openspec/changes/add-dark-mode/` with `proposal.md`, specs and `tasks.md`. Read them and edit
   anything that's wrong; `/opsx-explore` helps if you want to think it through first.
2. `/opsx-apply-review add-dark-mode`: for each task group, the worker builds it and the reviewer checks
   the diff against the specs. On PASS the lead ticks the tasks and commits that group. On FAIL it stops
   and shows you the reviewer's findings, with the changes left uncommitted for you to fix or retry.
3. `/opsx-verify-review add-dark-mode`: a reviewer checks the whole change against its plan and lists
   findings as P0 (must fix), P1 and P2.
4. `/opsx-archive add-dark-mode`: archives the change, offering first to merge its specs into `openspec/specs/`.

Use `/opsx-apply-review` and `/opsx-verify-review` rather than OpenSpec's own `/opsx-apply` and
`/opsx-verify`, which have the lead do the work and check it itself.

New to OpenSpec? `/opsx-onboard` walks you through one full cycle.

### Workflows

A workflow is a short script that runs subagents in a fixed order. The `/build-review`,
`/opsx-apply-review`, `/opsx-verify-review` and `/scout-review` prompts run them for you, so you
shouldn't need to run one directly.

| Workflow | Args | What it does |
|---|---|---|
| `build-review.js` | `{task}` | worker makes the change and runs the tests, reviewer returns PASS or FAIL; used by `/build-review` |
| `opsx-apply.js` | `{change, group}` | one OpenSpec task group, used by `/opsx-apply-review` |
| `opsx-verify.js` | `{change}` | whole-change check, used by `/opsx-verify-review` |
| `scout-review.js` | `{target}` | scout summarises a folder, reviewer says what it missed; a quick check that your setup works; used by `/scout-review` |

### Reviewing a PR

```sh
gh pr checkout 123
gh pr diff 123 > /tmp/pr-123.diff
```

Then in pi: `/parallel-review PR 123, diff at /tmp/pr-123.diff`. The reviewer can't run git and only
sees uncommitted changes on its own, so give it the diff as a file. The checkout lets it read the
surrounding code.

### pi-pane

Needs herdr or neoherdr. From a shell inside one of them:

```sh
pi-pane build coding mid task.md     # name, modelcmp task, tier, prompt file (or - for stdin)
```

It opens a pane to the right with a full pi on modelcmp's pick for that task and tier, sends the prompt,
waits up to 10 minutes (`PI_PANE_TIMEOUT`) and prints the answer. The pane stays open so you can keep
talking to it, by typing in it or with `neoherdr agent prompt build "..." --wait` (`herdr` under herdr).

## Models

`pi-model-sync` asks modelcmp for the best model per subagent and writes it into `.pi/settings.json`.
`init-repo.sh` runs it for you; run it again when prices or benchmarks change, or after you log in to a
new provider. `pi-model-sync ~/.pi/agent/settings.json` sets the models for every repo instead.

| Subagent | What it does | modelcmp task/tier |
|---|---|---|
| `scout` | fast look around the codebase, hands a short summary on | value/low |
| `worker` | writes the code | coding/mid |
| `reviewer` | read-only review, P0/P1/P2 findings and a merge verdict | reasoning/high |
| `oracle` | keeps decisions consistent with earlier ones | reasoning/high |
| `researcher` | web research brief | agentic/mid |
| `evidence-auditor` | checks research claims against their sources | reasoning/mid |

To choose differently for one repo, create `.pi/subagent-models` with one `subagent task tier` per line
(e.g. `worker coding high`) and run `pi-model-sync`. To pin an exact model, edit `.pi/settings.json` and
don't run `pi-model-sync` afterwards. pi-subagents has more subagents (`delegate`, `claude-code`,
`codex-exec`, `cursor-agent`), which keep their defaults; see
`~/.pi/agent/npm/node_modules/pi-subagents/agents/`.

## Updating

```sh
cd ~/repos/pi-setup && git pull && ./install.sh
```

Repos pick up changes to existing workflows and prompts straight away, since they are links. Run
`init-repo.sh` again in each repo to get newly added ones.

## Troubleshooting

- **`404 {"error":{"message":"Not Found"…`** from a subagent on an `openrouter/anthropic/…` model: your
  `~/.pi/agent/models.json` probably sets `baseUrl` on the whole `openrouter` provider. pi sends Claude models
  to OpenRouter in Anthropic's format at a different URL, which that setting breaks. Remove the provider's
  `baseUrl` and `api` (put them on your own model entries instead), or delete the entry if pi already has the model.
- **`researcher` fails with "these child tools were unavailable: web_search…"**: run `install.sh` again. It
  installs pi-web-access and sets subagents to load it.
- **"Third-party apps now draw from your extra usage"**: a subagent's model goes through a Claude
  subscription login. Log in with an API key or OpenRouter instead, then run `pi-model-sync`.
- **`pi-model-sync: worker and reviewer are both …`**: your logins only reach one good model, so the review
  is not a second opinion. Log in to another provider (OpenRouter is the quick way) and run `pi-model-sync`.
- **`pi-model-sync: no … model on pi`**: none of your logins reach a model for that task and tier, so that
  subagent keeps its default model. Log in to another provider or change the tier in `.pi/subagent-models`.
- **`/build-review`, `/scout-review` or the `/opsx-*-review` prompts are missing in pi**: start pi with `--approve`, and run `init-repo.sh` in
  that repo.
- **A workflow says it needs args**: pass them as shown in the [Workflows](#workflows) table.
