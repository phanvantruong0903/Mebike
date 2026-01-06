import { waitForPortOpen } from '@nx/node/utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 50059;

  try {
    await waitForPortOpen(port, { host, retries: 120, retryDelay: 1000 });
    console.log(`Service is ready on ${host}:${port}`);
  } catch (error) {
    console.warn(`Warning: Service not available on ${host}:${port}. Tests may fail if they require the service.`);
    // Don't fail setup - let tests handle service unavailability
  }

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
