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

Then `/opsx-propose <change>`, `/opsx-apply`, `/opsx-verify`, `/opsx-archive`.

| File | What it is |
|---|---|
| `bin/pi-model-sync` | writes modelcmp's pick per role into `.pi/settings.json`; roles from `.pi/subagent-models` when present |
| `bin/pi-pane` | starts a full pi in a new herdr pane on modelcmp's pick and prints its answer |
| `workflows/scout-review.js` | scout maps a target, reviewer critiques it |
| `workflows/opsx-apply.js` | one OpenSpec task group: worker builds, reviewer returns PASS or FAIL |

Not yet proven end to end: `pi-pane`'s answer round trip and the reviewer step of `opsx-apply.js`.
