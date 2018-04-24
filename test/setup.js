const puppeteer = require('puppeteer');

before(async () => {
    global.browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 100,
    });
});

after(() => {
    browser.close();
});
