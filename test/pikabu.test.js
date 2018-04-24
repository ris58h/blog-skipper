const helper = require("./helper");

describe('pikabu.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/pikabu.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        await helper.testNextTop(page, "#comment_111899576", "#comment_111899341");        
    });

    after(async () => {
        await page.close();
    });
});
