var commentSelector = null;
var offset = 0;
//TODO it shouldn't be hardcoded
if (window.location.hostname == 'habrahabr.ru') {
	commentSelector = '.comment';
} else if (window.location.hostname == 'news.ycombinator.com') {
	commentSelector = '.comment';
	offset = 25;
} else if (window.location.hostname == '4pda.ru') {
	commentSelector = '[id^="comment-"]';
	offset = 50;
} else if (window.location.hostname.endsWith('.d3.ru')) {
	commentSelector = '[id^="b-comment-"] > .b-comment__body';
} else if (window.location.hostname == 'vc.ru') {
	commentSelector = '.comments__item__self';
	offset = 100;
} else if (window.location.hostname == 'disqus.com') {
	commentSelector = '.post-content';
} else if (window.location.hostname == 'www.reddit.com') {
	commentSelector = '[id^="form-t1_"]';
	offset = 25;
}

var comments = [];
var clickedComment = null;

if (commentSelector != null) {
	console.log('>>> Using selector: ' + commentSelector); //TODO
	var nodeList = document.querySelectorAll(commentSelector);
	console.log('>>> Comments found: ' + nodeList.length); //TODO
	for (var i = 0; i < nodeList.length; i++) {
		var node = nodeList[i];
		onNewComment(node);
	}

	observerCallback = function(mutations) {
		for (var i = 0; i < mutations.length; i++) {
			var mutation = mutations[i];
			var addedNodes = mutation.addedNodes;
			for (var j = 0; j < addedNodes.length; j++) {
				var addedNode = addedNodes[j];
				if (matches(addedNode, commentSelector)) {
					console.log('>>> New comment detected!'); //TODO
					onNewComment(addedNode);
				} else {
					if (typeof addedNode.querySelectorAll === 'function') {
						var nodeList = addedNode.querySelectorAll(commentSelector);
						if (nodeList.length > 0) { //TODO
							console.log('>>> New comments detected: ' + nodeList.length);
						}
						for (var k = 0; k < nodeList.length; k++) {
							var node = nodeList[k];
							onNewComment(node);
						}
					}
				}
			}
		}
	};
	var observer = new MutationObserver(observerCallback);
	observer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

function onNewComment(element) {
	if (isHidden(element)) { //TODO
		console.log('>>> Skip new hidden comment!');
		return;
	}

	var eTop = element.getBoundingClientRect().top;
	var i;
	for (i = 0; i < comments.length; i++) {
		if (eTop < comments[i].getBoundingClientRect().top) {
			break;
		}
	}
	comments.splice(i, 0, element);

	element.addEventListener("contextmenu", function() {
		clickedComment = element;
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (clickedComment == null) {
		return;
	}

	var clickedIndex = comments.indexOf(clickedComment); //TODO binary search
	if (clickedIndex < 0) {
		console.error(">>> Comment not found in comments!");
		return;
	}

	var rootIndex = root(clickedIndex);
	var nextIndex = nextSameLevelTree(rootIndex);
	if (nextIndex >= 0) {
		goTo(nextIndex);
	}
	
	clickedComment = null;
});
	
function goTo(nextIndex) {
	comments[nextIndex].scrollIntoView();
	window.scrollBy(0, -offset);
}

function level(index) {
	return comments[index].getBoundingClientRect().left;
}

function parent(index) {
	var currentLevel = level(index);
	var prevIndex = index - 1;
	while (prevIndex >= 0 && level(prevIndex) >= currentLevel) {
		prevIndex--;
	}
	return prevIndex;
}

function root(index) {
	var rootIndex = index;
	var parentIndex = parent(index);
	while (parentIndex >= 0) {
		rootIndex = parentIndex;
		parentIndex = parent(parentIndex);
	}
	return rootIndex;
}

function nextSameLevelTree(index) {
	var currentLevel = level(index);
	var nextIndex = index + 1;
	while (nextIndex < comments.length && level(nextIndex) > currentLevel) {
		nextIndex++;
	}
	if (nextIndex < comments.length && level(nextIndex) == currentLevel) {
		return nextIndex;
	} else {
		return -1;
	}
}

function matches(elem, selector) {
	var proto = window.Element.prototype;
	var nativeMatches = proto.matches ||
		proto.mozMatchesSelector ||
		proto.msMatchesSelector ||
		proto.oMatchesSelector ||
		proto.webkitMatchesSelector;
  
	//TODO
	if (!elem || elem.nodeType !== 1) {
	  return false;
	}
  
	return nativeMatches.call(elem, selector);
}

function isHidden(el) {
	if (el.offsetParent === null) {
		return true;
	}
    var style = window.getComputedStyle(el);
    return (style.display === 'none')
}