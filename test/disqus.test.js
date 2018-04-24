const helper = require("./helper");

describe('disqus comments', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "disqus.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#post-3867673899", "#post-3867648004");
    });

    after(async () => {
        await page.close();
    });
});
