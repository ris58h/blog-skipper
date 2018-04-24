const puppeteer = require('puppeteer');
const assert = require("assert");
const fs = require("fs");

describe("sites", () => {
    let browser;

    before(async () => {
        browser = await puppeteer.launch({
            // headless: false,
        });
        //TODO
        // const settings = await new Promise((resolve) => {
        //     const settingsUrl = "file://" + process.cwd() + "/settings.js";    
        //     fetch(settingsUrl).then(function(response) {
        //         response.json().then(function(settings) {
        //             resolve(settings);
        //         });
        //     });
        // });
        // global.getParamsForUrl = (url) => {
        //     return {
        //         autodetectComments: settings.autodetectComments,
        //         commentSelector: ""
        //     }
        // }
    });

    describe('4pda.ru', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "4pda.html");
        });
    
        it('next header', async () => {
            await testNextTextContent(page, "h2", "Новые подробности о Xiaomi Mi6X и Mi Pad 4");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#comment-4750748", "#comment-4750749");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('d3.ru', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "d3.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#b-comment-22744657 .b-comment__body", "#b-comment-22747237 .b-comment__body");
        });
    
        after(async () => {
            await page.close();
        });
    });
    
    describe("dataworld.info", () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "dataworld.html");
        });
    
        it('next header', async () => {
            await testNextTextContent(page, "h2", "Есть ли отличия от AdvCash и Perfect Money?");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#comment-9267", "#comment-9206");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('disqus comments', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "disqus.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#post-3867673899", "#post-3867648004");
        });
    
        after(async () => {
            await page.close();
        });
    });
        
    describe('geektimes.ru', () => {
        let page;

        before(async () => {
            page = await createPage(browser, "geektimes.html");
        });

        it('next header', async () => {
            await testNextTextContent(page, "h1", "STL");
        });

        it('next comment root', async () => {
            await testNextTop(page, "#comment_10743077", "#comment_10743481");
        });

        after(async () => {
            await page.close();
        });
    });


    describe('habrahabr.ru', () => {
        let page;

        before(async () => {
            page = await createPage(browser, "habrahabr.html");
        });

        it('next header', async () => {
            await testNextTextContent(page, "h1", "Установка certbot и плагинов");
        });

        it('next comment root', async () => {
            await testNextTop(page, "#comment_10769168", "#comment_10769254");        
        });

        after(async () => {
            await page.close();
        });
    });

    describe('livejournal.com', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "livejournal.html");
        });
    
        it('next header', async () => {
            await testNextTextContent(page, "h2", "Мотивация и возможности");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#t7122048", "#t7122304");      
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('news.ycombinator.com', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "news.ycombinator.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#unv_16909828", "#unv_16909655", ".comment-tree .comhead");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('pikabu.ru', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "pikabu.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#comment_111899576", "#comment_111899341");        
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('reddit.com', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "reddit.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "#thing_t1_dxr2q90", "#thing_t1_dxr6ht6");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('spot comments', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "spot.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page,
                "[data-message-id='sp_IjnMf2Jd_23418430_c_66RJSY']",
                "[data-message-id='sp_IjnMf2Jd_23418430_c_wtCxyz']",
                ".sppre_message-details");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('vc.ru', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "vc.html");
        });
    
        it('next header', async () => {
            await testNextTextContent(page, "h2", "Почему идея оказалась не так эффективна и какие есть альтернативы");
        });
    
        it('next comment root', async () => {
            await testNextTop(page,
                "[data-id='696917'].comments__item .comments__item__self",
                "[data-id='696719'].comments__item .comments__item__self",
                ".comments__item__self");
        });
    
        after(async () => {
            await page.close();
        });
    });

    describe('youtube.com', () => {
        let page;
    
        before(async () => {
            page = await createPage(browser, "youtube.html");
        });
    
        it('next comment root', async () => {
            await testNextTop(page, "ytd-comment-thread-renderer:nth-child(4)", "ytd-comment-thread-renderer:nth-child(5)");
        });
    
        after(async () => {
            await page.close();
        });
    });

    after(() => {
        browser.close();
    });

    async function createPage(browser, name) {
        const page = await browser.newPage();
        await page.goto("file://" + process.cwd() + `/test/sites_data/${name}`);
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
    
    async function testNextTextContent(page, fromSelector, nextTextContent, commentSelector) {
        await testNext(page, fromSelector, "textContent", nextTextContent, commentSelector);
    }
    
    async function testNextTop(page, fromSelector, nextSelector, commentSelector) {
        const expectedTop = await evalAgainstElement(page, nextSelector, "getBoundingClientRect().top");
        await testNext(page, fromSelector, "getBoundingClientRect().top", expectedTop, commentSelector);
    }
});