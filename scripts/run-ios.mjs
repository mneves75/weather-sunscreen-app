#!/usr/bin/env node
// Ensure Expo builds to a valid, booted Simulator instead of a stale UDID
// Usage: `npm run ios` (defaults) or `npm run ios -- --simulator "iPhone 16"` / `--device "Your iPhone"`
// Pass-through of args is supported; if you specify a device/simulator, we won’t auto-select.

import { spawnSync } from 'node:child_process';

function run(cmd, args = [], opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', ...opts });
}

function hasFlag(flags, name) {
  return flags.includes(name) || flags.some((f) => f.startsWith(name + '='));
}

function getSimDevices() {
  const res = run('xcrun', ['simctl', 'list', '-j', 'devices']);
  if (res.status !== 0) {
    throw new Error(`Failed to list simulators: ${res.stderr || res.stdout}`);
  }
  return JSON.parse(res.stdout).devices;
}

function getAllowedDestinationUdids() {
  const res = run(
    'xcodebuild',
    [
      '-workspace',
      'ios/WeatherSunscreen.xcworkspace',
      '-scheme',
      'WeatherSunscreen',
      '-showdestinations',
    ],
    { cwd: process.cwd() },
  );
  if (res.status !== 0) return new Set();
  const ids = new Set();
  for (const line of res.stdout.split('\n')) {
    // e.g. { platform:iOS Simulator, arch:arm64, id:7559-..., OS:26.0, name:iPhone 17 Pro }
    const m = line.match(/\bid:([A-F0-9\-]+)\b/);
    if (m) ids.add(m[1]);
  }
  return ids;
}

function pickBestSimulator(devicesByRuntime) {
  const all = [];
  for (const [runtime, list] of Object.entries(devicesByRuntime)) {
    for (const d of list) {
      if (!d.isAvailable) continue;
      all.push({ ...d, runtime });
    }
  }

  // Prefer any booted iPhone first
  const booted = all.find((d) => d.state === 'Booted' && d.name.toLowerCase().includes('iphone'));
  if (booted) return booted;

  // Else prefer highest runtime iPhone (sort by semantic version inside runtime id)
  const parseRuntimeScore = (r) => {
    // e.g. com.apple.CoreSimulator.SimRuntime.iOS-26-0 => [26,0]
    const m = r.match(/iOS-(\d+)-(\d+)/);
    return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : 0;
  };

  const iphones = all
    .filter((d) => d.name.toLowerCase().includes('iphone'))
    .sort((a, b) => parseRuntimeScore(b.runtime) - parseRuntimeScore(a.runtime));
  if (iphones.length) return iphones[0];

  // Fallback: any available simulator
  return all[0];
}

function ensureBooted(udid) {
  // Open Simulator app (no-op if already open)
  run('open', ['-a', 'Simulator']);

  // Try boot; ignore error if already booted
  run('xcrun', ['simctl', 'boot', udid]);

  // Wait until boot completes
  const status = run('xcrun', ['simctl', 'bootstatus', udid, '-b']);
  if (status.status !== 0) {
    console.warn('[run-ios] Warning: bootstatus returned non-zero:', status.stderr || status.stdout);
  }
}

function main() {
  const passThrough = process.argv.slice(2);

  const userSpecified = hasFlag(passThrough, '--device') || hasFlag(passThrough, '--simulator') || hasFlag(passThrough, '--udid');

  let chosenName = null;
  if (!userSpecified) {
    try {
      const devices = getSimDevices();
      const allowed = getAllowedDestinationUdids();
      let chosen = pickBestSimulator(devices);
      // If chosen is not allowed, try to find an allowed iPhone by highest runtime
      if (chosen && allowed.size && !allowed.has(chosen.udid)) {
        const all = Object.values(devices).flat().filter((d) => d.isAvailable);
        const iphones = all.filter((d) => d.name.toLowerCase().includes('iphone'));
        chosen = iphones.find((d) => allowed.has(d.udid)) || iphones[0] || chosen;
      }
      if (!chosen) throw new Error('No available iOS Simulators found. Install one in Xcode > Settings > Platforms.');
      console.log(`[run-ios] Using Simulator: ${chosen.name} (${chosen.udid})`);
      ensureBooted(chosen.udid);
      // Pass UDID directly to avoid stale name->id caches in some CLIs
      chosenName = chosen.udid;
    } catch (e) {
      console.warn('[run-ios] Simulator selection failed:', e.message);
      console.warn('[run-ios] Proceeding to run Expo without preselecting a simulator...');
    }
  }

  const expo = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['expo', 'run:ios', ...passThrough];
  if (!userSpecified && chosenName) {
    // Expo CLI accepts --device to select simulator by UDID (preferred) or name
    args.push('--device', chosenName);
  }
  const child = run(expo, args, { stdio: 'inherit' });
  process.exit(child.status ?? 1);
}

main();
