const helper = require("./helper");

describe('vc.ru', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "vc.html");
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h2", "Почему идея оказалась не так эффективна и какие есть альтернативы");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page,
            "[data-id='696917'].comments__item .comments__item__self",
            "[data-id='696719'].comments__item .comments__item__self",
            ".comments__item__self");
    });

    after(async () => {
        await page.close();
    });
});
