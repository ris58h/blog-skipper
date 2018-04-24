const helper = require("./helper");

describe("dataworld.info", () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/dataworld.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        await helper.testNextTextContent(page, "h2", "Есть ли отличия от AdvCash и Perfect Money?");
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment-9267", "#comment-9206");
    });

    after(async () => {
        await page.close();
    });
});
