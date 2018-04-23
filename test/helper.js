async function evalAgainstNext(page, fromSelector, nextElementEval) {
    await page.evaluate(`document.querySelector("${fromSelector}").scrollIntoView()`);
    const actualValue = await page.evaluate('nextTarget(window.scrollY + 1, {autoDetectComments: true}).' + nextElementEval);
    return actualValue;
}

module.exports.evalAgainstNext = evalAgainstNext;