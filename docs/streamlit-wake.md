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
  - Runs on a schedule (**every 6 hours**, cron `17 */6 * * *`) and supports
    manual runs via `workflow_dispatch`.
  - Spins up Node 20 + Playwright (Chromium) on `ubuntu-latest` and runs the
    wake script.
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

## Limitations

This is a **best-effort workaround, not true always-on hosting**. Between wake
runs an app can still go back to sleep, and a wake run only kicks off the boot —
it doesn't guarantee the app is fully warm the instant a visitor arrives.

For production-grade always-on behavior, important dashboards should eventually
move to **paid / always-on hosting** (e.g. a paid Streamlit plan or a container
host) rather than relying on this scheduled wake-up.
