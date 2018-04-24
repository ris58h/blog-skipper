describe('pikabu.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/pikabu.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        const from = await helper.evalAgainstElement(page, "#comment_111899576", "getBoundingClientRect().top");
        const actualTop = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).getBoundingClientRect().top`);
        const expectedTop = await helper.evalAgainstElement(page, "#comment_111899341", "getBoundingClientRect().top");
        assert.equal(expectedTop, actualTop);
    });

    after(async () => {
        await page.close();
    });
});
