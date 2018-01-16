chrome.contextMenus.create({
  id: 'blog-skipper',
  title: 'Skip'
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.sendMessage(tab.id, {});
});