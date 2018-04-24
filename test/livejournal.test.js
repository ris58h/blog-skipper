const helper = require("./helper");

describe('livejournal.com', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "livejournal.html");
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h2", "Мотивация и возможности");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#t7122048", "#t7122304");      
    });

    after(async () => {
        await page.close();
    });
});
