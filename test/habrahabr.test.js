describe('habrahabr.ru', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/habrahabr.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next header', async () => {
        const textContent = await helper.evalAgainstNext(page, "h1", "textContent");
        assert.equal("Установка certbot и плагинов", textContent);
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#comment_10769168", "id");
        assert.equal("comment_10769254", id);
    });

    after(async () => {
        await page.close();
    });
});
