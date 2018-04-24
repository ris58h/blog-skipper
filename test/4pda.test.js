const helper = require("./helper");

describe('4pda.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/4pda.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h2", "Новые подробности о Xiaomi Mi6X и Mi Pad 4");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment-4750748", "#comment-4750749");
    });

    after(async () => {
        await page.close();
    });
});
