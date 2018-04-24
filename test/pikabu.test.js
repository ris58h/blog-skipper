const helper = require("./helper");

describe('pikabu.ru', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "pikabu.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment_111899576", "#comment_111899341");        
    });

    after(async () => {
        await page.close();
    });
});
