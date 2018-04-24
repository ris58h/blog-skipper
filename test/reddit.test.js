const helper = require("./helper");

describe('reddit.com', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "reddit.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#thing_t1_dxr2q90", "#thing_t1_dxr6ht6");
    });

    after(async () => {
        await page.close();
    });
});
