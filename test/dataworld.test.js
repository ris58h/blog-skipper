describe("dataworld.info", () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/dataworld.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const from = await helper.evalAgainstElement(page, "h2", "getBoundingClientRect().top");
        const textContent = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).textContent`);
        assert.equal("Есть ли отличия от AdvCash и Perfect Money?", textContent);
    });

    it('next comment root', async () => {
        const from = await helper.evalAgainstElement(page, "#comment-9267", "getBoundingClientRect().top");
        const actualTop = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).getBoundingClientRect().top`);
        const expectedTop = await helper.evalAgainstElement(page, "#comment-9206", "getBoundingClientRect().top");
        assert.equal(expectedTop, actualTop);
    });

    after(async () => {
        await page.close();
    });
});
