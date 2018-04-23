describe('habrahabr.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/habrahabr.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const from = await helper.evalAgainstElement(page, "h1", "getBoundingClientRect().top");
        const textContent = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).textContent`);
        assert.equal("Установка certbot и плагинов", textContent);
    });

    it('next comment root', async () => {
        const from = await helper.evalAgainstElement(page, "#comment_10769168", "getBoundingClientRect().top");
        const actualTop = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).getBoundingClientRect().top`);
        const expectedTop = await helper.evalAgainstElement(page, "#comment_10769254", "getBoundingClientRect().top");
        assert.equal(expectedTop, actualTop);
    });

    after(async () => {
        await page.close();
    });
});
