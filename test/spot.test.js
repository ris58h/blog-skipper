const helper = require("./helper");

describe('spot comments', () => {
    let page;

    before(async () => {
        page = await helper.createPage(browser, "spot.html");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page,
            "[data-message-id='sp_IjnMf2Jd_23418430_c_66RJSY']",
            "[data-message-id='sp_IjnMf2Jd_23418430_c_wtCxyz']",
            ".sppre_message-details");
    });

    after(async () => {
        await page.close();
    });
});
