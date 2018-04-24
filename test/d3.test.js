const helper = require("./helper");

describe('d3.ru', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "d3.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#b-comment-22744657 .b-comment__body", "#b-comment-22747237 .b-comment__body");
    });

    after(async () => {
        await page.close();
    });
});
