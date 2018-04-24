const helper = require("./helper");

describe('news.ycombinator.com', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "news.ycombinator.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#unv_16909828", "#unv_16909655", ".comment-tree .comhead");
    });

    after(async () => {
        await page.close();
    });
});
