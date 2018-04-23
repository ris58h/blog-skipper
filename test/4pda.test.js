describe('4pda.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/4pda.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const from = await helper.evalAgainstElement(page, "h2", "getBoundingClientRect().top");
        const textContent = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).textContent`);
        assert.equal("Новые подробности о Xiaomi Mi6X и Mi Pad 4", textContent);
    });

    it('next comment root', async () => {
        const from = await helper.evalAgainstElement(page, "#comment-4750748", "getBoundingClientRect().top");
        const actualTop = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).getBoundingClientRect().top`);
        const expectedTop = await helper.evalAgainstElement(page, "#comment-4750749", "getBoundingClientRect().top");
        assert.equal(expectedTop, actualTop);
    });

    after(async () => {
        await page.close();
    });
});
