async function evalAgainstNext(page, fromSelector, evalExpression) {
    await page.evaluate(`document.querySelector("${fromSelector}").scrollIntoView()`);
    return page.evaluate('nextTarget(window.scrollY + 1, {autoDetectComments: true}).' + evalExpression);
}

async function evalAgainstElement(page, selector, evalExpression) {
    return page.evaluate(`document.querySelector("${selector}").` + evalExpression);
}

module.exports.evalAgainstNext = evalAgainstNext;
module.exports.evalAgainstElement = evalAgainstElement;
