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

    await page.goto("file://" + process.cwd() + "/test/habrahabr.html");
    await page.addScriptTag({ path: process.cwd() + '/utils.js' });
    await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
});

describe('habrahabr.ru', () => {
    it ('next header', async () => {
        await page.evaluate('document.querySelector("h1").scrollIntoView()')
        const nextTargetTextContent = await page.evaluate('nextTarget(window.scrollY + 1, {autoDetectComments: true}).textContent');
        assert.equal("Установка certbot и плагинов", nextTargetTextContent);
    });

    it('next comment root', async () => {
        await page.evaluate('document.querySelector("#comment_10769168").scrollIntoView()');
        const nextTargetId = await page.evaluate('nextTarget(window.scrollY + 1, {autoDetectComments: true}).id');
        assert.equal("comment_10769254", nextTargetId);
    });
});

after(() => {
    browser.close()
});
