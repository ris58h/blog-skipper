const puppeteer = require('puppeteer');
const assert = require("assert");

let page;
let browser;
// const width = 1200;
// const height = 700;

before(async () => {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        // args: [`--window-size=${width},${height}`]
    });
    page = await browser.newPage();
    // await page.setViewport({ width, height });

    await page.goto("file://" + process.cwd() + "/test/reddit.html");
    await page.addScriptTag({ path: process.cwd() + '/utils.js' });
    await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
});

describe('reddit.com', () => {
    it('next comment root', async () => {
        await page.evaluate('document.querySelector("#thing_t1_dxr2q90").scrollIntoView()');
        const nextTargetId = await page.evaluate('nextTarget(window.scrollY + 1, {autoDetectComments: true}).id');
        assert.equal("thing_t1_dxr6ht6", nextTargetId);
    });
});

after(() => {
    browser.close()
});
