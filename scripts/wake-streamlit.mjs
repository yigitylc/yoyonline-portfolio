#!/usr/bin/env node
// Centralized wake-up for embedded Streamlit Community Cloud dashboards.
//
// Free Streamlit apps go to sleep after inactivity and show a
// "This app has gone to sleep" / "Zzzz" screen with a
// "Yes, get this app back up!" button. This script visits each public app,
// clicks that button when present, and waits for the app to start booting so
// visitors on yoyonline.com are less likely to land on the sleep screen.
//
// Best-effort only. No secrets, nothing private. Exits 0 unless EVERY app fails,
// so a single flaky Streamlit app never breaks the scheduled workflow.
//
// Run locally:
//   npm i -D playwright && npx playwright install chromium
//   node scripts/wake-streamlit.mjs

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// --- Configuration ---------------------------------------------------------

/** Public Streamlit dashboard URLs embedded on yoyonline.com. */
const APPS = [
  { name: "Asset Analytics YOY", url: "https://asset-analyticsyoy.streamlit.app/" },
  { name: "MA Distance Lab", url: "https://madistance-ile.streamlit.app/" },
  { name: "MACD vs Breadth Wild", url: "https://macd-v-breadthwild.streamlit.app/" },
  { name: "Macroeconomic Modeling YOY", url: "https://macroeconomicmodelingyoy.streamlit.app/" },
  { name: "Portfolio Analytics YOY", url: "https://portfolio-analyticsyoy.streamlit.app/" },
  { name: "Return Observations YOY", url: "https://returnobs-yoy.streamlit.app/" },
  { name: "Seasonality Terminal YOY", url: "https://seasonality-terminalyoy.streamlit.app/" },
];

const GOTO_TIMEOUT_MS = 120_000; // navigation budget per app
const WAKE_WAIT_MS = 90_000; // max wait for the app to start after clicking wake
const WAKE_MIN_WAIT_MS = 45_000; // give a freshly-woken app at least this long
const SLEEP_TEXT = [/this app has gone to sleep/i, /zzzz/i];
const WAKE_BUTTON_RE = /get this app back up/i;
const DEBUG_DIR = "wake-debug";

// --- Helpers ---------------------------------------------------------------

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const log = (name, msg) => console.log(`[${name}] ${msg}`);

/** Whether the page currently shows Streamlit sleep-screen text. */
async function hasSleepText(page) {
  let text = "";
  try {
    text = (await page.content()) ?? "";
  } catch {
    return false;
  }
  return SLEEP_TEXT.some((re) => re.test(text));
}

/** Locate the "Yes, get this app back up!" button, if present. */
function wakeButton(page) {
  // Prefer accessible role matching; fall back to any element with the text.
  return page.getByRole("button", { name: WAKE_BUTTON_RE });
}

async function screenshotOnFailure(page, name) {
  try {
    await mkdir(DEBUG_DIR, { recursive: true });
    const file = path.join(DEBUG_DIR, `${slug(name)}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(name, `saved debug screenshot -> ${file}`);
  } catch (err) {
    log(name, `could not save screenshot: ${err.message}`);
  }
}

/**
 * Visit one app and try to wake it.
 * @returns {{ status: string, note: string }}
 */
async function wakeApp(context, { name, url }) {
  const page = await context.newPage();
  try {
    log(name, `visiting ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: GOTO_TIMEOUT_MS });

    // Look for the wake button (short wait — it renders quickly if sleeping).
    const button = wakeButton(page);
    let sleeping = false;
    try {
      await button.waitFor({ state: "visible", timeout: 8_000 });
      sleeping = true;
    } catch {
      sleeping = await hasSleepText(page);
    }

    if (!sleeping) {
      log(name, "already awake");
      return { status: "already-awake", note: "no sleep screen detected" };
    }

    log(name, "sleep page detected");

    // Click the wake button if it exists; otherwise the app is already booting.
    if (await button.count()) {
      await button.first().click({ timeout: 15_000 });
      log(name, 'wake button clicked ("Yes, get this app back up!")');
    } else {
      log(name, "sleep text present but no wake button; app may be booting");
    }

    // Wait for the sleep UI to go away (app starting), bounded by WAKE_WAIT_MS,
    // but always give it at least WAKE_MIN_WAIT_MS to begin booting.
    const startedAt = Date.now();
    try {
      await button.first().waitFor({ state: "detached", timeout: WAKE_WAIT_MS });
    } catch {
      // Button may not detach cleanly; fall through to the floor wait below.
    }
    const elapsed = Date.now() - startedAt;
    if (elapsed < WAKE_MIN_WAIT_MS) {
      await page.waitForTimeout(WAKE_MIN_WAIT_MS - elapsed);
    }

    const stillSleeping = (await button.count()) > 0 || (await hasSleepText(page));
    if (stillSleeping) {
      log(name, "wake requested; app still starting (left booting in background)");
      return { status: "loaded", note: "wake clicked, app booting" };
    }

    log(name, "loaded successfully");
    return { status: "loaded", note: "woken and loading" };
  } catch (err) {
    log(name, `failed: ${err.message}`);
    await screenshotOnFailure(page, name);
    return { status: "failed", note: err.message.split("\n")[0].slice(0, 80) };
  } finally {
    await page.close().catch(() => {});
  }
}

function printSummary(results) {
  const nameW = Math.max(...results.map((r) => r.name.length), "App".length);
  const statusW = Math.max(...results.map((r) => r.status.length), "Status".length);
  const line = (a, b, c) =>
    `  ${a.padEnd(nameW)}  ${b.padEnd(statusW)}  ${c}`;

  console.log("\n=== Wake summary ===");
  console.log(line("App", "Status", "Note"));
  console.log(line("-".repeat(nameW), "-".repeat(statusW), "----"));
  for (const r of results) console.log(line(r.name, r.status, r.note));
  console.log("");
}

// --- Main ------------------------------------------------------------------

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/124.0.0.0 Safari/537.36 streamlit-wake-bot",
  });

  const results = [];
  try {
    for (const app of APPS) {
      const { status, note } = await wakeApp(context, app);
      results.push({ name: app.name, status, note });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  printSummary(results);

  const failed = results.filter((r) => r.status === "failed").length;
  const total = results.length;
  console.log(`${total - failed}/${total} app(s) reachable, ${failed} failed.`);

  // Only fail the workflow if EVERY app failed.
  process.exitCode = failed === total ? 1 : 0;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
