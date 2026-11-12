# Streamlit wake-up system

## Why this exists

The dashboards embedded across **yoyonline.com** are deployed on
**Streamlit Community Cloud** (the free tier). Apps on that tier **go to sleep
after a period of inactivity**. When a visitor opens a sleeping app they see a
"This app has gone to sleep" / "Zzzz" screen with a
**"Yes, get this app back up!"** button, and the dashboard takes a while to boot.

To reduce how often visitors hit that screen, this repo contains a **single,
centralized GitHub Actions workflow** that periodically wakes every deployed
dashboard. Wake logic lives **only here** — the individual Streamlit/model repos
are intentionally left untouched.

## How it works

- **Workflow:** [`.github/workflows/wake-streamlit.yml`](../.github/workflows/wake-streamlit.yml)
  - Runs on a schedule (**hourly**, cron `17 * * * *`) and supports manual runs
    via `workflow_dispatch`. Hourly is deliberate over-scheduling — GitHub skips
    roughly half of all scheduled slots (see Troubleshooting).
  - Spins up Node 24 + Playwright (Chromium) on `ubuntu-latest` and runs the
    wake script.
  - Has **no `concurrency` group** on purpose (see Troubleshooting).
- **Script:** [`scripts/wake-streamlit.mjs`](../scripts/wake-streamlit.mjs)
  - Visits each public Streamlit URL directly.
  - Detects the sleep screen (wake button + "gone to sleep" / "Zzzz" text).
  - Clicks **"Yes, get this app back up!"** when present and waits for the app
    to start booting.
  - Logs a clear per-app status (already awake / sleep detected / wake clicked /
    loaded / failed) and prints a summary table.
  - Continues to the next app if one fails, and **only fails the workflow if
    every app fails** — one flaky app won't break the schedule.
  - Uses **no secrets** and nothing private.

## Adding or removing an app

Edit the `APPS` array at the top of
[`scripts/wake-streamlit.mjs`](../scripts/wake-streamlit.mjs). Each entry is just
a `{ name, url }` pair pointing at the public `*.streamlit.app` URL.

## Running locally

```bash
cd code/yoyonline-portfolio   # repo root
npm install --no-save playwright
npx playwright install chromium
node scripts/wake-streamlit.mjs
```

Failures write a lightweight screenshot to `wake-debug/<app-name>.png`. That
directory (and Playwright report/test-results artifacts) is gitignored and is
**not** committed.

## Troubleshooting

- **Wake right now:** Actions → *Wake Streamlit Apps* → **Run workflow**.
- **A run is stuck on "Waiting for a runner to pick up this job…":** GitHub
  occasionally orphans a queued job, and GitHub-hosted runners have no documented
  queue timeout, so it may never start. Cancel it from the Actions tab. The
  workflow intentionally has no `concurrency` group: with one, a single stuck run
  blocked every later run (September 2026). Overlapping wake runs are harmless.
- **The schedule stopped entirely:** GitHub disables scheduled workflows in
  public repos after **60 days without repository activity** (this happened
  2026-07-31 and again 2026-11-12, exactly 60 days after the previous push).
  GitHub emails the repo owner when it does. **Any real push re-enables it:** on
  2026-11-12 a commit to `main` flipped the workflow from `disabled_inactivity`
  back to `active` within seconds and reset the 60-day clock. When there is no
  genuine change to push, re-enable it by hand instead via Actions →
  *Wake Streamlit Apps* → **Enable workflow**. Don't automate this with dummy
  commits or re-enable scripts — the popular keep-alive action for that was
  disabled by GitHub for a terms-of-service violation.
- **Apps asleep even though runs are green:** GitHub starts scheduled runs late
  and **drops many of them outright**. Measured over the 60 days to 2026-11-12,
  an every-3h cron produced only **227 of ~479 runs (47%)**, about 3.8 per day,
  with a 13.3 h gap on 2026-11-09 — past Streamlit's **12 hour** sleep threshold.
  The schedule is hourly to absorb those misses, not because apps need waking
  every hour.
- **Checking whether an app is asleep without a browser:**
  `curl -s https://<app>.streamlit.app/api/v2/app/status` returns JSON including
  a `status` field (`5` = running). Useful for monitoring; it is undocumented,
  and it does **not** wake an app or count as traffic — Streamlit counts the
  websocket session a real browser opens, which is why this repo drives
  Playwright rather than sending plain HTTP requests.

## Limitations

This is a **best-effort workaround, not true always-on hosting**. Between wake
runs an app can still go back to sleep, and a wake run only kicks off the boot —
it doesn't guarantee the app is fully warm the instant a visitor arrives.

For production-grade always-on behavior, important dashboards should eventually
move to **paid / always-on hosting** (e.g. a paid Streamlit plan or a container
host) rather than relying on this scheduled wake-up.
