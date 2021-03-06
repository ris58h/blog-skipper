const puppeteer = require("puppeteer")
const except = require("chai").expect
const parseUrl = require("url").parse

describe("integration", () => {
    const width = 1920
    const height = 1080
    let browser

    before(async () => {
        const pathToExtension = process.cwd() + "/extension"
        browser = await puppeteer.launch({
            headless: false, // Chrome Headless doesn't support extensions. https://github.com/GoogleChrome/puppeteer/issues/659
            args: [
                `--window-size=${width},${height}`,
                "--no-sandbox",
                "--disable-extensions-except=" + pathToExtension,
                "--load-extension=" + pathToExtension,
                "--mute-audio"
            ]
        })
    })

    describe("4pda.ru", () => {
        const headerHeight = 40

        describe("main page", async () => {
            let page

            before(async () => {
                page = await createPage("https://4pda.ru")
            })

            it("next header", async () => {
                await testSkipN(25, page, "h2.list-post-title", headerHeight, 1, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page

            before(async () => {
                page = await createPage("https://4pda.ru/2018/05/10/351164/#comments")
            })

            it("next header", async () => {
                await testSkipAll(page, ".content-box > h2", headerHeight)
            })

            it("next comment root", async () => {
                await page.waitFor(1000) // Without this test fails. It seems like a race.
                await testSkipAll(page, ".comment-list.level-0 > li", headerHeight)
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("bugs.launchpad.net", () => {
        let page
        let headerHeight = 0

        before(async () => {
            page = await createPage("https://bugs.launchpad.net/ubuntu/+source/linphone/+bug/566075")
        })

        it("next comment root", async () => {
            const n = 11 // because the end of the page
            await testSkipN(n, page, ".boardComment .boardCommentDetails", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("d3.ru", () => {
        const headerHeight = 0

        describe.skip("main page", async () => {
            let page

            before(async () => {
                page = await createPage("https://d3.ru")
            })

            it("next header", async () => {
                await testSkipAll(page, ".b-post-cut .b-post-header", headerHeight, 1, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page

            before(async () => {
                page = await createPage("https://gif.d3.ru/nu-nakonets-to-1583095/")
            })

            it("next comment root", async () => {
                const n = 4 //TODO greater value leads to an error
                await testSkipN(n, page, "#b-comment-root > .b-comment .b-comment__body", headerHeight)
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("dataworld.info", () => {
        let page
        let headerHeight = 0

        before(async () => {
            page = await createPage("http://dataworld.info/payeer-karta-koshelek-obzor-otzyvy-registratsiya-russia-php.php")
        })

        it("next header", async () => {
            await testSkipSelectors(page, ["h2", "h4"], headerHeight)
        })

        it("next comment root", async () => {
            await testSkipAll(page, ".commentlist > .comment", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("disqus.com comments", () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://disqus.com/embed/comments/?base=default&f=disqus&t_i=5354070036&t_u=https%3A%2F%2Fblog.disqus.com%2Flittle-known-disqus-features&t_d=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2010%20Little-known%20Disqus%20Features%20You%20Should%20Know%20About%0A%20%20%20%20%20%20%20%20%20%20%20%20&t_t=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2010%20Little-known%20Disqus%20Features%20You%20Should%20Know%20About%0A%20%20%20%20%20%20%20%20%20%20%20%20&s_o=default#version=c0054b9f0e6fdc06531dbc13c60562c8")
        })

        it("next comment root", async () => {
            await testSkipN(10, page, "#posts #post-list > .post", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("habr.com", () => {
        const headerHeight = 0

        describe("main page", async () => {
            let page

            before(async () => {
                page = await createPage("https://habr.com")
            })

            it("next header", async () => {
                //TODO ".posts_list h2.post__title" would be better but sometimes there are headers in post previews.
                await testSkipAll(page, ".posts_list h1, .posts_list h2, .posts_list h3, .posts_list h4", headerHeight, 1, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page

            before(async () => {
                page = await createPage("https://habr.com/post/354052/")
            })

            it("next header", async () => {
                await testSkipAll(page, "article.post h2", headerHeight)
            })

            it("next comment root", async () => {
                await testSkipAll(page, "#comments-list > li > .comment", headerHeight)
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("livejournal.com", () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://lozga.livejournal.com/170880.html")
        })

        // TODO: There is fixed footer with suggested articles that contains header.
        it.skip("next header", async () => {
            await testSkipSelectors(page, ["h2", "h2 ~ h2"], headerHeight)
        })

        it("next comment root", async () => {
            await testSkipSelectors(page, ["#ljcmt7121792", "#ljcmt7122304"], headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("news.ycombinator.com", () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://news.ycombinator.com/item?id=16909056")
        })

        it("next comment root", async () => {
            await testSkipSelectors(page, ["tr[id='16909828'] .comment", "tr[id='16909655'] .comhead"], headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    // This site has 'z' shortcut that scrolls page up.
    describe("pikabu.ru", () => {
        const headerHeight = 0

        describe.skip("main page", async () => {
            let page

            before(async () => {
                page = await createPage("https://pikabu.ru")
            })

            it("next header", async () => {
                await testSkipAll(page, "h2.story__title", headerHeight, 1, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page

            before(async () => {
                page = await createPage("https://pikabu.ru/story/beregite_prirodu_5865577")
            })

            it("next comment root", async () => {
                await testSkipN(10, page, ".comments__container > .comment", headerHeight, 3)
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("reddit.com", () => {
        const oldHeaderHeight = 0
        const newHeaderHeight = 69
        const delta = 7

        describe("main page", async () => {
            let page

            before(async () => {
                // It forces new design (Does it actually?). Old can't be tested anyway (no headers).
                page = await createPage("https://new.reddit.com")
            })

            it("next header", async () => {
                await testSkipN(20, page, ".Post h2", newHeaderHeight, delta, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page

            before(async () => {
                page = await createPage("https://www.reddit.com/r/aww/comments/8dyrb3/ben_is_very_proud_of_himself_for_learning_to_go/")
            })

            it("next comment root", async () => {
                const oldDesignSelector = ".commentarea>.sitetable>.comment"
                const newDesignSelector = ".Comment.top-level"
                const oldDesign = await page.$(oldDesignSelector)
                if (oldDesign) {
                    await testSkipN(10, page, oldDesignSelector, oldHeaderHeight, delta)
                } else {
                    await testSkipN(10, page, newDesignSelector, newHeaderHeight, delta)
                }
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("spot.im comments", () => {
        let page
        const headerHeight = 0

        before(async () => {
            page = await createPage("https://spoxy-shard3.spot.im/v2/spot/sp_IjnMf2Jd/post/23418430/?elementId=b321749a16c5d64924c61888adcac21d&spot_im_platform=desktop&host_url=www.aol.com%2Farticle%2Fnews%2F2018%2F04%2F23%2Feagles-issue-interesting-statement-on-potential-white-house-visit%2F23418430%2F&host_url_64=d3d3LmFvbC5jb20vYXJ0aWNsZS9uZXdzLzIwMTgvMDQvMjMvZWFnbGVzLWlzc3VlLWludGVyZXN0aW5nLXN0YXRlbWVudC1vbi1wb3RlbnRpYWwtd2hpdGUtaG91c2UtdmlzaXQvMjM0MTg0MzAv&spot_im_ph__prerender_deferred=true&prerenderDeferred=true&sort_by=best&isStarsRatingEnabled=false&enableMessageShare=true&enableAnonymize=true&isConversationLiveBlog=false&enableSeeMoreButton=true")
        })

        it("next comment root", async () => {
            await testSkipN(1, page, ".sppre_root-message", headerHeight)
        })

        after(async () => {
            await page.close()
        })
    })

    describe("vc.ru", () => {
        const headerHeight = 50

        describe("main page", async () => {
            let page

            before(async () => {
                page = await createPage("https://vc.ru")
            })

            it("next header", async () => {
                await testSkipN(30, page, ".b-article h2", headerHeight, 1, false)
            })

            after(async () => {
                await page.close()
            })
        })

        describe("entry page", async () => {
            let page
            const commentHeaderHeight = headerHeight + 50

            before(async () => {
                page = await createPage("https://vc.ru/36920-vlasti-finlyandii-reshili-ne-prodlevat-eksperiment-s-vyplatoy-bazovogo-dohoda#comments")
            })

            it("next header", async () => {
                await testSkipAll(page, "h1,h2", headerHeight)
            })

            it("next comment root", async () => {
                await testSkipN(5, page, ".comments__content > .comments__item > .comments__item__space > .comments__item__self", commentHeaderHeight)
            })

            after(async () => {
                await page.close()
            })
        })
    })

    describe("youtube.com", () => {
        let page
        const headerHeight = 56

        before(async () => {
            page = await createPage("https://www.youtube.com/watch?v=gOsERJzMhLc")
        })

        it("next comment root", async () => {
            await waitThenScroll(page, "#comments #sections")
            await testSkipAll(page, "ytd-comment-thread-renderer", headerHeight)
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
        await page._client.send("Emulation.clearDeviceMetricsOverride")
        await page.setRequestInterception(true)
        page.on("request", request => {
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

    async function skipUsingKey(page, element) {
        await page.evaluate(scrollIntoView, element)
        //TODO it could be different key
        await page.keyboard.press("KeyZ")
    }

    async function skipUsingClick(page, element) {
        await element.click({ button: "middle" })
    }

    async function skip(page, e, useClick = true) {
        if (useClick) {
            await skipUsingClick(page, e)
        } else {
            await skipUsingKey(page, e)
        }
    }

    async function testSkipSelectors(page, selectors, headerHeight, delta = 1, useClick) {
        if (selectors.length < 2) {
            throw `At least 2 selectors required. Only ${selectors.length} gotten.`
        }
        for (let i = 0; i < selectors.length - 1; i++) {
            const currentSelector = selectors[i]
            const nextSelector = selectors[i + 1]
            const element = await page.waitForSelector(currentSelector)
            await skip(page, element, useClick)
            const top = await page.$eval(nextSelector, getTop)
            except(headerHeight).to.be.closeTo(top, delta)
        }
    }

    async function testSkipN(n, page, selector, headerHeight, delta = 1, useClick) {
        await page.waitForSelector(selector)
        const elements = await page.$$(selector)
        const minNumOfElements = n <= 0 ? 2 : n + 1
        if (elements.length < minNumOfElements) {
            throw `Not enough elements! Only ${elements.length} found.`
        }
        const numberOfElements = n <= 0 ? elements.length - 1 : n
        for (let i = 0; i < numberOfElements; i++) {
            const current = elements[i]
            const next = elements[i + 1]
            await skip(page, current, useClick)
            const top = await page.evaluate(e => e.getBoundingClientRect().top, next)
            except(headerHeight).to.be.closeTo(top, delta)
        }
    }

    async function testSkipAll(page, selector, headerHeight, delta = 1, useClick) {
        await testSkipN(0, page, selector, headerHeight, delta, useClick)
    }
})
