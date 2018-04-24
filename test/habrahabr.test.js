const helper = require("./helper");

describe('habrahabr.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/habrahabr.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h1", "Установка certbot и плагинов");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment_10769168", "#comment_10769254");        
    });

    after(async () => {
        await page.close();
    });
});
