const helper = require("./helper");

describe('geektimes.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/geektimes.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h1", "STL");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment_10743077", "#comment_10743481");
    });

    after(async () => {
        await page.close();
    });
});
