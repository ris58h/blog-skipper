const puppeteer = require('puppeteer');
global.assert = require("assert");
global.helper = require("./helper");

before(async () => {
    global.browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 100,
    });
});

after(() => {
    browser.close();
});
