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

    await page.goto("file://" + process.cwd() + "/test/geektimes.html");
    await page.addScriptTag({ path: process.cwd() + '/utils.js' });
    await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
});

describe('geektimes.ru', () => {
    it ('next header', async () => {
        const textContent = await helper.evalAgainstNext(page, "h1", "textContent");
        assert.equal("STL", textContent);
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#comment_10743077", "id");
        assert.equal("comment_10743481", id);
    });
});

after(() => {
    browser.close()
});
