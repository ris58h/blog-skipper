const puppeteer = require('puppeteer')
const except = require("chai").expect
const parseUrl = require("url").parse

describe("integration", () => {
    const width = 1920
    const height = 1080
    let browser

    before(async () => {
        browser = await puppeteer.launch({
            headless: false, // Chrome Headless doesn't support extensions. https://github.com/GoogleChrome/puppeteer/issues/659
            args: [
                `--window-size=${width},${height}`,// TODO use defaultViewport
                '--no-sandbox',
                '--disable-extensions-except=' + process.cwd(),
                '--load-extension=' + process.cwd(),
                '--mute-audio'
            ]
        })
    })

    describe('4pda.ru', () => {
        let page
        const headerHeight = 40

        before(async () => {
            page = await createPage("https://4pda.ru/2018/05/10/351164/#comments")
        })

        it('next header', async () => {
            await testSkipComparingTop2(page, "h2", headerHeight)
        })

        it('next comment root', async () => {
            await page.waitFor(1000) // Without this test fails. It seems like a race.
            await testSkipComparingTop2(page, ".comment-list.level-0 > li", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('bugs.launchpad.net', () => {
        let page
        let headerHeight = 0

        before(async () => {
            page = await createPage("https://bugs.launchpad.net/ubuntu/+source/linphone/+bug/566075")
        })

        it('next comment root', async () => {
            await testSkipComparingTop2(page, ".boardComment .boardCommentDetails", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('d3.ru', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://gif.d3.ru/nu-nakonets-to-1583095/")
        })

        it('next comment root', async () => {
            await testSkipComparingTop2(page, "#b-comment-root > .b-comment .b-comment__body", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("dataworld.info", () => {
        let page
        let headerHeight = 0

        before(async () => {
            page = await createPage("http://dataworld.info/payeer-karta-koshelek-obzor-otzyvy-registratsiya-russia-php.php")
        })

        it('next header', async () => {
            await testSkipComparingTop(page, "h2", "h4", headerHeight)
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment-9267", "#comment-9206", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('disqus.com comments', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://disqus.com/embed/comments/?base=default&f=disqus&t_i=5354070036&t_u=https%3A%2F%2Fblog.disqus.com%2Flittle-known-disqus-features&t_d=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2010%20Little-known%20Disqus%20Features%20You%20Should%20Know%20About%0A%20%20%20%20%20%20%20%20%20%20%20%20&t_t=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2010%20Little-known%20Disqus%20Features%20You%20Should%20Know%20About%0A%20%20%20%20%20%20%20%20%20%20%20%20&s_o=default#version=c0054b9f0e6fdc06531dbc13c60562c8")
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#post-3963748605", "#post-3947815796", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('habr.com', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://habr.com/post/354052/")
        })

        it('next header', async () => {
            await testSkipComparingTop(page, "h1", "h2", headerHeight)
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#comment_10769168", "#comment_10769254", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('livejournal.com', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://lozga.livejournal.com/170880.html")
        })

        // TODO: There is fixed footer with suggested articles that contains header.
        it.skip('next header', async () => {
            await testSkipComparingTop(page, "h2", "h2 ~ h2", headerHeight)
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page, "#ljcmt7121792", "#ljcmt7122304", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('news.ycombinator.com', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://news.ycombinator.com/item?id=16909056", "news.ycombinator.html")
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page, "tr[id='16909828'] .comment", "tr[id='16909655'] .comhead", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    //This site has 'z' shortcut that scrolls page up so we skip to the same element every time.
    describe('pikabu.ru', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://pikabu.ru/story/beregite_prirodu_5865577")
        })

        it('next comment root', async () => {
            await testSkipComparingTop2(page, ".comments__container > .comment", headerHeight, 2)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('reddit.com', () => {
        let page
        const oldHeaderHeight = 0
        const newHeaderHeight = 69
        const delta = 5

        before(async () => {
            page = await createPage("https://www.reddit.com/r/aww/comments/8dyrb3/ben_is_very_proud_of_himself_for_learning_to_go/")
        })

        it('next comment root', async () => {
            const oldDesignSelector = ".commentarea>.sitetable>.comment"
            const newDesignSelector = ".Comment.top-level"
            const oldDesign = await page.$(oldDesignSelector)
            if (oldDesign) {
                await testSkipComparingTop2(page, oldDesignSelector, oldHeaderHeight, delta)
            } else {
                await testSkipComparingTop2(page, newDesignSelector, newHeaderHeight, delta)
            }
        })

        after(async () => {
            await page.close()
        })
    })

    describe('spot.im comments', () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://spoxy-shard3.spot.im/v2/spot/sp_IjnMf2Jd/post/23418430/?elementId=b321749a16c5d64924c61888adcac21d&spot_im_platform=desktop&host_url=www.aol.com%2Farticle%2Fnews%2F2018%2F04%2F23%2Feagles-issue-interesting-statement-on-potential-white-house-visit%2F23418430%2F&host_url_64=d3d3LmFvbC5jb20vYXJ0aWNsZS9uZXdzLzIwMTgvMDQvMjMvZWFnbGVzLWlzc3VlLWludGVyZXN0aW5nLXN0YXRlbWVudC1vbi1wb3RlbnRpYWwtd2hpdGUtaG91c2UtdmlzaXQvMjM0MTg0MzAv&spot_im_ph__prerender_deferred=true&prerenderDeferred=true&sort_by=best&isStarsRatingEnabled=false&enableMessageShare=true&enableAnonymize=true&isConversationLiveBlog=false&enableSeeMoreButton=true")
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page,
                "[data-message-id='sp_IjnMf2Jd_23418430_c_66RJSY']",
                "[data-message-id='sp_IjnMf2Jd_23418430_c_wtCxyz']",
                headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('vc.ru', () => {
        let page
        const headerHeight = 50
        const commentHeaderHeight = headerHeight + 50

        before(async () => {
            page = await createPage("https://vc.ru/36920-vlasti-finlyandii-reshili-ne-prodlevat-eksperiment-s-vyplatoy-bazovogo-dohoda")
        })

        it('next header', async () => {
            await testSkipComparingTop(page,
                "h2",
                "h2 ~ h2",
                headerHeight)
        })

        it('next comment root', async () => {
            await testSkipComparingTop(page,
                "[data-id='696917'].comments__item .comments__item__self",
                "[data-id='696719'].comments__item .comments__item__self",
                commentHeaderHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe('youtube.com', () => {
        let page
        const headerHeight = 56

        before(async () => {
            page = await createPage("https://www.youtube.com/watch?v=gOsERJzMhLc")
        })

        it('next comment root', async () => {
            await waitThenScroll(page, "#comments #sections")
            await testSkipComparingTop2(page, "ytd-comment-thread-renderer", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    after(() => {
        browser.close()
    })

    async function createPage(url) {
        const page = await browser.newPage()
        await page._client.send('Emulation.clearDeviceMetricsOverride')
        await page.setRequestInterception(true)
        page.on('request', request => {
            if (isImageUrl(request.url())
                || isFontUrl(request.url())
                || urlHostnameEndsWith(request.url(), "doubleclick.net")
                || urlHostnameEndsWith(request.url(), "yandex.ru")
                || urlHostnameEndsWith(request.url(), "mail.ru")
                || urlHostnameEndsWith(request.url(), "rambler.ru")) {
                // console.log("abort " + request.url())
                request.abort()
            } else {
                request.continue()
            }
        })
        await page.goto(url)
        return page
    }

    function isImageUrl(url) {
        const pathname = parseUrl(url).pathname
        if (!pathname) {
            return false
        }
        return pathname.endsWith(".png")
            || pathname.endsWith(".jpg")
            || pathname.endsWith(".jpeg")
            || pathname.endsWith(".gif")
            || pathname.endsWith(".svg")
    }

    function isFontUrl(url) {
        const pathname = parseUrl(url).pathname
        if (!pathname) {
            return false
        }
        return pathname.endsWith(".woff")
            || pathname.endsWith(".woff2")
    }

    function urlHostnameEndsWith(url, ending) {
        const hostname = parseUrl(url).hostname
        if (!hostname) {
            return false
        }
        return hostname.endsWith(ending)
    }

    function scrollIntoView(element) {
        element.scrollIntoView()
    }

    async function waitThenScroll(page, selector) {
        await page.waitForSelector(selector)
        await page.$eval(selector, scrollIntoView)
    }

    function getTop(element) {
        return element.getBoundingClientRect().top
    }

    async function skipWithKey(page, selector) {
        await page.waitForSelector(selector)
        await page.$eval(selector, scrollIntoView)
        //TODO it could be different key
        await page.keyboard.press('KeyZ')
    }

    async function skipWithClick(page, selector) {
        await page.waitForSelector(selector)
        await page.click(selector, { button: "middle" })
    }

    async function skip(page, selector) {
        const useClick = true
        if (useClick) {
            await skipWithClick(page, selector)
        } else {
            await skipWithKey(page, selector)
        }
    }

    async function testSkipComparingTop(page, fromSelector, nextSelector, headerHeight, delta = 1) {
        await skip(page, fromSelector)
        const top = await page.$eval(nextSelector, getTop)
        except(headerHeight).to.be.closeTo(top, delta)
    }

    async function testSkipComparingTop2(page, selector, headerHeight, delta = 1) {
        await skip(page, selector)
        const top = await page.$$eval(selector, elements => elements[1].getBoundingClientRect().top)
        except(headerHeight).to.be.closeTo(top, delta)
    }
})
