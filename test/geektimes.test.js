const helper = require("./helper");

describe('geektimes.ru', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "geektimes.html");
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
