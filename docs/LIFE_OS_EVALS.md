# Life OS Eval Loop

This repo now includes a deterministic eval loop that can be run locally to evaluate loop quality and generate improvement artifacts.

## What is included

- eval fixtures for:
  - health/performance
  - work/income
  - relationships/networking
  - stalled loops
  - contradictory requests
- metrics:
  - loop closure rate
  - unnecessary question rate
  - approval correctness
  - memory usefulness
  - intervention usefulness
  - blocker recurrence
- capability proposal ranking based on recurring blockers and severity
- skill promotion/decay rules based on repeated outcomes
- persistent reports and improvement artifacts in `artifacts/life-os/`

## Run

```bash
npm run evals:life-os
```

## Outputs

- `artifacts/life-os/latest-eval-report.json`
- `artifacts/life-os/latest-improvement-artifacts.json`
- timestamped historical snapshots for each run
