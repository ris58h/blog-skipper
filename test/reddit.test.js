describe('reddit.com', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/reddit.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#thing_t1_dxr2q90", "id");
        assert.equal("thing_t1_dxr6ht6", id);
    });

    after(async () => {
        await page.close();
    });
});
