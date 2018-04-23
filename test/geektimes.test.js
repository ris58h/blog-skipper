describe('geektimes.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/geektimes.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const textContent = await helper.evalAgainstNext(page, "h1", "textContent");
        assert.equal("STL", textContent);
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#comment_10743077", "id");
        assert.equal("comment_10743481", id);
    });

    after(async () => {
        await page.close();
    });
});
