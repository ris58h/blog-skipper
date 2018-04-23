describe('4pda.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/4pda.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const textContent = await helper.evalAgainstNext(page, "h2", "textContent");
        assert.equal("Новые подробности о Xiaomi Mi6X и Mi Pad 4", textContent);
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#comment-4750748", "firstChild.id");
        assert.equal("comment4750749", id);
    });

    after(async () => {
        await page.close();
    });
});
