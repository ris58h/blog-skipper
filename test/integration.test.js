const puppeteer = require('puppeteer');
const assert = require("assert");
const except = require("chai").expect;

// TODO it's impossible to do tests for sites that do not preserve order of comments

describe("sites", () => {
    let browser;
    let getParamsForUrl;

    before(async () => {
        browser = await puppeteer.launch({
            //TODO
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-extensions-except=' + process.cwd(),
                '--load-extension=' + process.cwd()
            ]
        });
    });

    describe('4pda.ru', () => {
        let page;
        const headerHeight = 40;

        before(async () => {
            page = await createPage("https://4pda.ru/2018/04/23/350937#comments");
        });

        it('next header', async () => {
            await waitThenScroll(page, "h2");
            await skip(page);
            const top = await page.$$eval('h2', (headers) => {
                return headers[1].getBoundingClientRect().top;
            });
            except(headerHeight).to.be.closeTo(top, 1);
        });

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment-4750748", "#comment-4750749", headerHeight);
        });

        after(async () => {
            await page.close();
        });
    });

    describe('d3.ru', () => {
        let page;
        const headerHeight = 0;

        before(async () => {
            page = await createPage("https://gif.d3.ru/nu-nakonets-to-1583095/");
        });

        it('next comment root', async () => {
            await testSkipComparingTop(
                page,
                "#b-comment-root > .b-comment:nth-child(1) .b-comment__body",
                "#b-comment-root > .b-comment:nth-child(2) .b-comment__body",
                headerHeight
            );
        });

        after(async () => {
            await page.close();
        });
    });

    describe("dataworld.info", () => {
        let page;
        let headerHeight = 0;

        before(async () => {
            page = await createPage("http://dataworld.info/payeer-karta-koshelek-obzor-otzyvy-registratsiya-russia-php.php");
        });

        it('next header', async () => {
            await testSkipComparingTop(page, "h2", "h4", headerHeight);
        });

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment-9267", "#comment-9206", headerHeight);
        });

        after(async () => {
            await page.close();
        });
    });

    describe('disqus comments', () => {
        let page;
        const headerHeight = 0;

        before(async () => {
            page = await createPage("https://disqus.com/embed/comments/?base=default&f=androidmr&t_i=54479%20http%3A%2F%2Fandroid.mobile-review.com%2F%3Fp%3D54479&t_u=http%3A%2F%2Fandroid.mobile-review.com%2Farticles%2F54479%2F&t_e=HiSilicon%3A%20%D0%B2%D1%81%D0%B5%20%D0%BE%20%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B5%20%D1%87%D0%B8%D0%BF%D1%81%D0%B5%D1%82%D0%BE%D0%B2%20%D0%B4%D0%BB%D1%8F%20Huawei&t_d=HiSilicon%3A%20%D0%B2%D1%81%D0%B5%20%D0%BE%20%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B5%20%D1%87%D0%B8%D0%BF%D1%81%D0%B5%D1%82%D0%BE%D0%B2%20%D0%B4%D0%BB%D1%8F%20Huawei&t_t=HiSilicon%3A%20%D0%B2%D1%81%D0%B5%20%D0%BE%20%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B5%20%D1%87%D0%B8%D0%BF%D1%81%D0%B5%D1%82%D0%BE%D0%B2%20%D0%B4%D0%BB%D1%8F%20Huawei&s_o=default&l=#version=3a153681e8d91dee2860bdf5f56e28f6");
        });

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#post-3867673899", "#post-3867648004", headerHeight);
        });

        after(async () => {
            await page.close();
        });
    });

    describe('geektimes.ru', () => {
        let page;
        const headerHeight = 0;

        before(async () => {
            page = await createPage("https://geektimes.com/post/300211/");
        });

        it('next header', async () => {
            await testSkipComparingTop(page, "h1", "h2", headerHeight);
        });

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment_10743077", "#comment_10743481", headerHeight);
        });

        after(async () => {
            await page.close();
        });
    });


    describe('habrahabr.ru', () => {
        let page;
        const headerHeight = 0;

        before(async () => {
            page = await createPage("https://habr.com/post/354052/");
        });

        it('next header', async () => {
            await testSkipComparingTop(page, "h1", "h2", headerHeight);
        });

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment_10769168", "#comment_10769254", headerHeight);        
        });

        after(async () => {
            await page.close();
        });
    });

    describe('livejournal.com', () => {
        let page;
        const headerHeight = 0;

        before(async () => {
            page = await createPage("https://lozga.livejournal.com/170880.html");
        });

        it('next header', async () => {
            // TODO
            // await testSkipComparingTop(page, "h2", "Мотивация и возможности", headerHeight);
        });

        it('next comment root', async () => {
            //TODO
            await testSkipComparingTop(page, "#t7122048", "#t7122304", headerHeight);     
        });

        after(async () => {
            await page.close();
        });
    });

    // describe('news.ycombinator.com', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("news.ycombinator.html");
    //         params = getParamsForUrl("https://news.ycombinator.com/item?id=16909056");
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page, "#unv_16909828", "#unv_16909655", params);
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    // describe('pikabu.ru', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("pikabu.html");
    //         params = getParamsForUrl("https://pikabu.ru/story/beregite_prirodu_5865577");
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page, "#comment_111899576", "#comment_111899341", params);        
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    // describe('reddit.com', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("reddit.html");
    //         params = getParamsForUrl("https://www.reddit.com/r/aww/comments/8dyrb3/ben_is_very_proud_of_himself_for_learning_to_go/");
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page, "#thing_t1_dxr2q90", "#thing_t1_dxr6ht6", params);
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    // describe('spot comments', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("spot.html");
    //         params = getParamsForUrl("https://spoxy-shard3.spot.im/v2/spot/sp_IjnMf2Jd/post/23418430/?elementId=b321749a16c5d64924c61888adcac21d&spot_im_platform=desktop&host_url=www.aol.com%2Farticle%2Fnews%2F2018%2F04%2F23%2Feagles-issue-interesting-statement-on-potential-white-house-visit%2F23418430%2F&host_url_64=d3d3LmFvbC5jb20vYXJ0aWNsZS9uZXdzLzIwMTgvMDQvMjMvZWFnbGVzLWlzc3VlLWludGVyZXN0aW5nLXN0YXRlbWVudC1vbi1wb3RlbnRpYWwtd2hpdGUtaG91c2UtdmlzaXQvMjM0MTg0MzAv&spot_im_ph__prerender_deferred=true&prerenderDeferred=true&sort_by=best&isStarsRatingEnabled=false&enableMessageShare=true&enableAnonymize=true&isConversationLiveBlog=false&enableSeeMoreButton=true");
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page,
    //             "[data-message-id='sp_IjnMf2Jd_23418430_c_66RJSY']",
    //             "[data-message-id='sp_IjnMf2Jd_23418430_c_wtCxyz']",
    //             params);
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    // describe('vc.ru', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("vc.html");
    //         params = getParamsForUrl("https://vc.ru/36920-vlasti-finlyandii-reshili-ne-prodlevat-eksperiment-s-vyplatoy-bazovogo-dohoda");
    //     });

    //     it('next header', async () => {
    //         await testNextTextContent(page,
    //             "h2",
    //             "Почему идея оказалась не так эффективна и какие есть альтернативы",
    //             params);
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page,
    //             "[data-id='696917'].comments__item .comments__item__self",
    //             "[data-id='696719'].comments__item .comments__item__self",
    //             params);
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    // describe('youtube.com', () => {
    //     let page;
    //     let params;

    //     before(async () => {
    //         page = await createPage("youtube.html");
    //         params = getParamsForUrl("https://www.youtube.com/watch?v=gOsERJzMhLc&t=28s");
    //     });

    //     it('next comment root', async () => {
    //         await testNextTop(page,
    //             "ytd-comment-thread-renderer:nth-child(4)",
    //             "ytd-comment-thread-renderer:nth-child(5)",
    //             params);
    //     });

    //     after(async () => {
    //         await page.close();
    //     });
    // });

    after(() => {
        // browser.close();
    });

    async function createPage(url) {
        const page = await browser.newPage();
        await page.goto(url);
        return page;
    }

    function scrollIntoView(element) {
        element.scrollIntoView();
    }

    async function waitThenScroll(page, selector) {
        await page.waitForSelector(selector);
        await page.$eval(selector, scrollIntoView);
    }

    function getTop(element) {
        return element.getBoundingClientRect().top;
    }

    async function skip(page) {
        //TODO it could be different key
        await page.keyboard.press('KeyZ');
    }

    async function testSkipComparingTop(page, fromSelector, nextSelector, headerHeight) {
        await waitThenScroll(page, fromSelector);
        await skip(page);
        const top = await page.$eval(nextSelector, getTop);
        except(headerHeight).to.be.closeTo(top, 1);
    }
});