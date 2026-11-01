const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './browser-tests',
    timeout: 45000,
    expect: { timeout: 10000 },
    workers: 1,
    retries: 0,
    reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
        viewport: { width: 1365, height: 900 },
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
        { name: 'edge', use: { browserName: 'chromium', channel: 'msedge' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
    ],
});
