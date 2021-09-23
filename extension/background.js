function initFromSettings(settings) {
    chrome.contextMenus.removeAll(function () {
        let cm = settings["contextMenu"]
        if (cm == null || typeof cm != "object") {
            cm = {
                "enabled": true,
                "items": {
                    "skip": true,
                    "undo": false
                }
            }
        }
        if (cm.enabled) {
            if (cm.items.skip) {
                chrome.contextMenus.create({
                    id: "skip",
                    title: "Skip"
                })
            }
            if (cm.items.undo) {
                chrome.contextMenus.create({
                    id: "undo",
                    title: "Undo"
                })
            }
        }
    })
}

extension.settings.load(initFromSettings)
extension.settings.addChangeListener(initFromSettings)

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "skip") {
        chrome.tabs.sendMessage(tab.id, { type: "skip", mouse: true }, { frameId: info.frameId })
    } else if (info.menuItemId == "undo") {
        chrome.tabs.sendMessage(tab.id, { type: "undo" }, { frameId: info.frameId })
    }
})

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, { type: "skip" })
})

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type == "scroll-parent-header") {
        const tabId = sender.tab.id
        const frameId = sender.frameId
        if (frameId > 0) {
        chrome.webNavigation.getFrame({ tabId, frameId }, function(details) {
            const pFrameId = details.parentFrameId
            if (pFrameId >= 0) {
            chrome.tabs.sendMessage(
                tabId,
                {
                    type: "scroll-header",
                    data: {
                        scrolled: msg.data.scrolled
                    }
                },
                { frameId: pFrameId }
            )
            }
        })
        }
    }
})
