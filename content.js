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
} else if (window.location.hostname == 'pikabu.ru') {
	commentSelector = '.b-comment__body';
} else if (window.location.hostname.endsWith('.livejournal.com')) {
	commentSelector = '.mdspost-thread';
	offset = 50;
}

if (commentSelector != null) {
	var clickY;
	document.addEventListener('contextmenu', function(e) {
        clickY = e.pageY;
	});
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		doSkip(clickY);	
	});

	document.addEventListener('keyup', function(e) {
		if (e.key == 'z') { //TODO
			var windowCenterY = window.scrollY + (window.innerHeight / 2);
			doSkip(windowCenterY);
		}
	});

	function doSkip(pageY) {
		var comments = [];
		var rootLevel = null;
		var nodeList = document.querySelectorAll(commentSelector);
		if (nodeList.length == 0) {
			return;
		}
		for (var i = 0; i < nodeList.length; i++) {
			var comment = nodeList[i];
			if (!isHidden(comment)) {
				comments.push(comment);
				var commentLevel = level(comment);
				if (rootLevel == null || commentLevel < rootLevel) {
					rootLevel = commentLevel;
				}
			}
		}
		comments.sort(function (a, b) {
			var aRect = a.getBoundingClientRect();
			var bRect = b.getBoundingClientRect();
			return aRect.top - bRect.top;	
		});
	
		var clickedIndex = indexOfClicked(comments, pageY);
		if (clickedIndex >= 0) {
			for (var i = clickedIndex + 1; i < comments.length; i++) {
				if (level(comments[i]) === rootLevel) {
					goTo(comments[i]);
					break;
				}
			}
		}
	}
}
	
function goTo(comment) {
	comment.scrollIntoView();
	window.scrollBy(0, -offset);
}

function level(comment) {
	return comment.getBoundingClientRect().left;
}

function matches(elem, selector) {
	var proto = window.Element.prototype;
	var nativeMatches = proto.matches ||
		proto.mozMatchesSelector ||
		proto.msMatchesSelector ||
		proto.oMatchesSelector ||
		proto.webkitMatchesSelector;
  
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

function indexOfClicked(elements, pageY) {
	for (var i = 0; i < elements.length; i++) {
		var elementY = window.scrollY + elements[i].getBoundingClientRect().top;
		if (elementY < pageY) {
			var isLast = i === elements.length - 1;
			var nextElementY = window.scrollY 
				+ (isLast ? elements[i].getBoundingClientRect().bottom 
					: elements[i + 1].getBoundingClientRect().top);
			if (pageY < nextElementY) {
				return i;
			}
		}
	}
	return -1;
}