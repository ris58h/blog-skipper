async function evalAgainstElement(page, elementSelector, evalExpression) {
    return page.evaluate(`document.querySelector("${elementSelector}").` + evalExpression);
}

module.exports.evalAgainstElement = evalAgainstElement;
