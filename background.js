chrome.contextMenus.create({
  id: 'blog-skipper',
  title: 'Skip Tree',
  contexts: ['all']
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.sendMessage(tab.id, {});
})