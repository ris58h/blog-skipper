const helper = require("./helper");

describe('youtube.com', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "youtube.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "ytd-comment-thread-renderer:nth-child(4)", "ytd-comment-thread-renderer:nth-child(5)");
    });

    after(async () => {
        await page.close();
    });
});
