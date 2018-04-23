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

    await page.goto("file://" + process.cwd() + "/test/4pda.html");
    await page.addScriptTag({ path: process.cwd() + '/utils.js' });
    await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
});

describe('4pda.ru', () => {
    it ('next header', async () => {
        const textContent = await helper.evalAgainstNext(page, "h2", "textContent");
        assert.equal("Новые подробности о Xiaomi Mi6X и Mi Pad 4", textContent);
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#comment-4750748", "firstChild.id");
        assert.equal("comment4750749", id);
    });
});

after(() => {
    browser.close();
});
