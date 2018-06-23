function initFromSettings(settings) {
    const cm = settings["contextMenu"];
    if (cm == null || cm) { // backward compatibility
        chrome.contextMenus.create({
            id: "blog-skipper-skip",
            title: "Skip"
        });
    } else {
        chrome.contextMenus.remove("blog-skipper-skip");
    }
}

load(initFromSettings);

addChangeListener(initFromSettings);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.tabs.sendMessage(tab.id, { type: "skip" }, { frameId: info.frameId });
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type == "scroll-parent-header") {
        const tabId = sender.tab.id;
        const frameId = sender.frameId;
        if (frameId > 0) {
        chrome.webNavigation.getFrame({ tabId, frameId }, function(details) {
            const pFrameId = details.parentFrameId;
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
            );
            }
        });
        }
    }
});
