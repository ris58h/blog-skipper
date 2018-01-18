let commentSelector = null;
let offset = null;
//TODO it shouldn't be hardcoded
if (window.location.hostname == 'habrahabr.ru') {
	commentSelector = '.comment';
} else if (window.location.hostname == 'news.ycombinator.com') {
	commentSelector = '.comment';
	offset = 25;//TODO better selector
} else if (window.location.hostname == '4pda.ru') {
	commentSelector = '[id^="comment-"]';
} else if (window.location.hostname.endsWith('.d3.ru')) {
	commentSelector = '[id^="b-comment-"] > .b-comment__body';
} else if (window.location.hostname == 'vc.ru') {
	commentSelector = '.comments__item__self';
} else if (window.location.hostname == 'disqus.com') {
	commentSelector = '.post-content';
} else if (window.location.hostname == 'www.reddit.com') {
	commentSelector = '[id^="form-t1_"]';
	offset = 25;//TODO better selector
} else if (window.location.hostname == 'pikabu.ru') {
	commentSelector = '.b-comment__body';
} else if (window.location.hostname.endsWith('.livejournal.com')) {
	commentSelector = '.mdspost-thread';
}

let clickY;
document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	doSkip(clickY);	
});

document.addEventListener('keyup', function(e) {
	if (e.key == 'z') { //TODO
		const windowCenterY = window.scrollY + (window.innerHeight / 2);
		doSkip(windowCenterY);
	}
});

function doSkip(pageY) {
	let next = nextCommentRoot(pageY);
	if (next == null) {
		next = nextHeader(pageY);
	}
	if (next != null) {
		goTo(next);
	}
}

function nextCommentRoot(pageY) {
	if (commentSelector == null) {
		return null;
	}

	const comments = [];
	let rootLevel = null;
	const nodeList = document.querySelectorAll(commentSelector);
	if (nodeList.length == 0) {
		return null;
	}
	for (const comment of nodeList) {
		if (!isHidden(comment)) {
			comments.push(comment);
			const commentLevel = level(comment);
			if (rootLevel == null || commentLevel < rootLevel) {
				rootLevel = commentLevel;
			}
		}
	}
	comments.sort(compareTop);

	const index = indexOfSorted(comments, pageY);
	if (index == -1) {
		return null;
	}
	const nextIndex = index < 0 ? -index - 1 : index + 1;
	for (let i = nextIndex; i < comments.length; i++) {
		const comment = comments[i];
		if (level(comment) === rootLevel) {
			return comment;
		}
	}

	return null;
}

function nextHeader(pageY) {
	const headers = [];
	const headersSelector = 'article h1,article h2,article h3,article h4,article h5,article h6';
	let nodeList = document.querySelectorAll(headersSelector);
	if (nodeList.length == 0) {
		const headersSelector2 = 'h1,h2,h3,h4,h5,h6';
		nodeList = document.querySelectorAll(headersSelector2);
	}
	if (nodeList.length == 0) {
		return null;
	}
	for (const header of nodeList) {
		if (!isHidden(header)) {
			headers.push(header);
		}
	}
	headers.sort(compareTop);

	const index = indexOfSorted(headers, pageY);
	const nextIndex = index < 0 ? -index - 1 : index + 1;
	if (nextIndex < headers.length) {
		return headers[nextIndex];
	}

	return null;
}

function compareTop(a, b) {
	const aRect = a.getBoundingClientRect();
	const bRect = b.getBoundingClientRect();
	return aRect.top - bRect.top;	
}

function goTo(element) {
	element.scrollIntoView();
	
	let additionalScroll;
	if (offset == null) {
		additionalScroll = calcTopStuffHeight(element);	
	} else {
		additionalScroll = offset;
	}
	if (additionalScroll != 0) {
		window.scrollBy(0, -additionalScroll);
	}
}

function calcTopStuffHeight(element) {
	let pageHeaderHeight = 0;
	for (const e of document.body.getElementsByTagName("*")) {
		const style = window.getComputedStyle(e, null);
		if (style.getPropertyValue('position') == 'fixed') {
			if (e.getBoundingClientRect().top == 0
				&& e.offsetWidth > window.innerWidth / 2
				&& e.offsetHeight > 0) {
				pageHeaderHeight = e.offsetHeight;
				break;
			}
		}
	}
	let stickyHeaderHeight = 0;
	let parent = element;
	while ((parent = parent.parentElement) != null) {
		for (const e of parent.children) {
			const style = window.getComputedStyle(e, null);
			if (style.getPropertyValue('position') == 'sticky') {
				if (e.offsetHeight > 0) {
					stickyHeaderHeight = e.offsetHeight;
					break;
				}
			}
		}
	}
	return pageHeaderHeight + stickyHeaderHeight;
}

function level(comment) {
	return comment.getBoundingClientRect().left;
}

function matches(elem, selector) {
	const proto = window.Element.prototype;
	const nativeMatches = proto.matches ||
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
    const style = window.getComputedStyle(el);
    return (style.display === 'none')
}

function indexOfSorted(elements, pageY) { //TODO binary search
	const y = pageY - window.scrollY;
	let prevBottom = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < elements.length; i++) {
		const rect = elements[i].getBoundingClientRect();
		if (y < rect.top) {
			if (y <= prevBottom) {
				return i - 1;
			} else {
				return -i - 1;
			}
		}
		prevBottom = rect.bottom;
	}
	return -elements.length - 1;
}