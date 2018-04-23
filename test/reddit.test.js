const puppeteer = require('puppeteer');
const assert = require("assert");
const helper = require("./helper");

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
        const id = await helper.evalAgainstNext(page, "#thing_t1_dxr2q90", "id");
        assert.equal("thing_t1_dxr6ht6", id);
    });
});

after(() => {
    browser.close()
});
