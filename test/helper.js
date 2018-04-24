const assert = require("assert");

async function evalAgainstElement(page, elementSelector, evalExpression) {
    return page.evaluate(`document.querySelector("${elementSelector}").` + evalExpression);
}

async function testNext(page, fromSelector, nextEval, expectedValue) {
    const from = await evalAgainstElement(page, fromSelector, "getBoundingClientRect().top");
    const actualValue = await page.evaluate(`nextTarget(${from},  {autoDetectComments: true}).` + nextEval);
    assert.equal(expectedValue, actualValue);
}

async function testNextTextContent(page, fromSelector, nextTextContent) {
    await testNext(page, fromSelector, "textContent", nextTextContent);
}

async function testNextTop(page, fromSelector, nextSelector) {
    const expectedTop = await evalAgainstElement(page, nextSelector, "getBoundingClientRect().top");
    await testNext(page, fromSelector, "getBoundingClientRect().top", expectedTop);
}

module.exports.evalAgainstElement = evalAgainstElement;
module.exports.testNext = testNext;
module.exports.testNextTextContent = testNextTextContent;
module.exports.testNextTop = testNextTop;
