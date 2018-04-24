const assert = require("assert");
const fs = require("fs");

async function createPage(browser, name) {
    const page = await browser.newPage();
    await page.goto("file://" + process.cwd() + `/test/${name}`);
    await page.evaluate(fs.readFileSync(process.cwd() + '/utils.js', 'utf8'));
    await page.evaluate(fs.readFileSync(process.cwd() + '/skipper.js', 'utf8'));
    return page;
}

async function evalAgainstElement(page, elementSelector, evalExpression) {
    return page.evaluate(`document.querySelector("${elementSelector}").` + evalExpression);
}

async function testNext(page, fromSelector, nextEval, expectedValue, commentSelector) {
    const from = await evalAgainstElement(page, fromSelector, "getBoundingClientRect().top");
    const paramsJson = JSON.stringify({
        autoDetectComments: true,
        commentSelector
    });
    const actualValue = await page.evaluate(`nextTarget(${from}, ${paramsJson}).` + nextEval);
    assert.equal(expectedValue, actualValue);
}

async function testNextTextContent(page, fromSelector, nextTextContent) {
    await testNext(page, fromSelector, "textContent", nextTextContent);
}

async function testNextTop(page, fromSelector, nextSelector, commentSelector) {
    const expectedTop = await evalAgainstElement(page, nextSelector, "getBoundingClientRect().top");
    await testNext(page, fromSelector, "getBoundingClientRect().top", expectedTop, commentSelector);
}

module.exports.createPage = createPage;
module.exports.evalAgainstElement = evalAgainstElement;
module.exports.testNext = testNext;
module.exports.testNextTextContent = testNextTextContent;
module.exports.testNextTop = testNextTop;
