#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const TARGET_DEVICE_NAME = process.env.EXPO_IOS_SIM_DEVICE || 'iPhone 16 Pro';
const HEALTH_RETRY_COUNT = Number(process.env.EXPO_IOS_SIM_HEALTH_RETRIES || 3);
const HEALTH_RETRY_DELAY_MS = Number(process.env.EXPO_IOS_SIM_HEALTH_DELAY_MS || 1500);
const HEALTH_PROBE_URL = process.env.EXPO_IOS_SIM_HEALTH_URL || 'http://127.0.0.1';

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function run(command, args, opts = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...opts });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${result.status ?? result.signal}`);
  }
  return result;
}

function runCapture(command, args, opts = {}) {
  return spawnSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

function runQuiet(command, args, opts = {}) {
  return spawnSync(command, args, { stdio: 'ignore', ...opts });
}

function readJSON(command, args) {
  const result = runCapture(command, args);
  if (result.status !== 0) {
    return null;
  }
  try {
    return JSON.parse(result.stdout.toString('utf8'));
  } catch (error) {
    return null;
  }
}

function getBootedDevices() {
  const json = readJSON('xcrun', ['simctl', 'list', 'devices', 'booted', '--json']);
  if (!json || !json.devices) {
    return [];
  }
  return Object.values(json.devices).flat();
}

function getAllDevices() {
  const json = readJSON('xcrun', ['simctl', 'list', 'devices', '--json']);
  if (!json || !json.devices) {
    return [];
  }
  return Object.values(json.devices).flat();
}

function findDeviceByName(name) {
  return getAllDevices().find((device) => device.name === name);
}

function isDeviceHealthy(deviceSpecifier = 'booted') {
  for (let attempt = 0; attempt < HEALTH_RETRY_COUNT; attempt += 1) {
    const result = runQuiet('xcrun', ['simctl', 'openurl', deviceSpecifier, HEALTH_PROBE_URL], {
      timeout: 5000,
    });
    if (result.status === 0) {
      return true;
    }
    sleep(HEALTH_RETRY_DELAY_MS);
  }
  return false;
}

function shutdownDevices(devices) {
  devices.forEach(({ udid, name }) => {
    const res = runQuiet('xcrun', ['simctl', 'shutdown', udid], { timeout: 10000 });
    if (res.status === 0) {
      console.log(`› Shut down simulator ${name} (${udid})`);
    } else {
      console.warn(`› Unable to shut down simulator ${name} (${udid})`);
    }
  });
}

function bootTarget(device) {
  console.log(`› Booting simulator ${device.name} (${device.udid})`);
  const res = runQuiet('xcrun', ['simctl', 'boot', device.udid], { timeout: 20000 });
  if (res.status !== 0 && res.status !== 149) {
    throw new Error(`Unable to boot simulator ${device.name}`);
  }
}

function waitForBoot(device) {
  console.log('› Waiting for simulator to become ready');
  run('xcrun', ['simctl', 'bootstatus', device.udid]);
}

function ensureSimulatorReady() {
  const targetDevice = findDeviceByName(TARGET_DEVICE_NAME);
  if (!targetDevice) {
    throw new Error(`Simulator named "${TARGET_DEVICE_NAME}" not found. Set EXPO_IOS_SIM_DEVICE to pick an available device.`);
  }

  const bootedDevices = getBootedDevices();
  if (bootedDevices.length === 0) {
    bootTarget(targetDevice);
    waitForBoot(targetDevice);
    if (!isDeviceHealthy('booted')) {
      throw new Error('Booted simulator is unresponsive.');
    }
    console.log('› Simulator booted and responsive');
    return;
  }

  if (isDeviceHealthy('booted')) {
    console.log('› Existing booted simulator is responsive');
    return;
  }

  console.log('› Booted simulator unresponsive, cycling devices');
  shutdownDevices(bootedDevices);
  bootTarget(targetDevice);
  waitForBoot(targetDevice);
  if (!isDeviceHealthy('booted')) {
    throw new Error('Simulator is still unresponsive after reboot.');
  }
  console.log('› Simulator rebooted and responsive');
}

try {
  ensureSimulatorReady();
} catch (error) {
  console.error(`Failed to ensure simulator readiness: ${error.message}`);
  process.exit(1);
}
