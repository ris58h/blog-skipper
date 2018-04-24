const helper = require("./helper");

describe('d3.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/d3.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#b-comment-22744657 .b-comment__body", "#b-comment-22747237 .b-comment__body");
    });

    after(async () => {
        await page.close();
    });
});
