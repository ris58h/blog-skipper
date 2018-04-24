const helper = require("./helper");

describe('youtube.com', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/youtube.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "ytd-comment-thread-renderer:nth-child(4)", "ytd-comment-thread-renderer:nth-child(5)");
    });

    after(async () => {
        await page.close();
    });
});
