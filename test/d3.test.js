describe('d3.com', () => {
    let page;

    before(async () => {
        page = await browser.newPage();
        await page.goto("file://" + process.cwd() + "/test/d3.html");
        await page.addScriptTag({ path: process.cwd() + '/utils.js' });
        await page.addScriptTag({ path: process.cwd() + '/skipper.js' });
    });

    it('next comment root', async () => {
        const id = await helper.evalAgainstNext(page, "#b-comment-22744657 .b-comment__body", "parentElement.id");
        assert.equal("b-comment-22747237", id);
    });

    after(async () => {
        await page.close();
    });
});
