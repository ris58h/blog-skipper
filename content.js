let autoDetectComments = false;
let sites = [];
let shortcuts = {};

//TODO: race condition
load(function (settings) {
	if (settings.autoDetectComments != null) {
		autoDetectComments = settings.autoDetectComments;
	}
	sites = settings.sites.map(site => {
		return {
			urlRegex: new RegExp("^" + site.urlPattern.replace(/\*/g, ".*") + "$"),
			commentSelector: site.commentSelector
		}
	});
	if (settings.shortcuts) {
		shortcuts = settings.shortcuts;
	}
});

let prescrollPosition = null;

let clickY;
document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});
chrome.runtime.onMessage.addListener(function(msg) {
	if (msg.type == 'skip') {
		doSkip(clickY);
	} else if (msg.type == 'scroll-header') {
		const fixedHeaderHeight = calcFixedHeaderHeight();//TODO sticky header
		window.scrollBy(0, -(fixedHeaderHeight - msg.data.scrolled));
	}
});

let precalcFixedHeaderHeight = null;//TODO get rid of this hack to improve performance
document.addEventListener('keyup', function(e) {
	if (document.activeElement 
		&& (document.activeElement.tagName == "INPUT" 
		|| document.activeElement.tagName == "SELECT"
			|| document.activeElement.tagName == "TEXTAREA")) {
				return;
	}
	if (e.key == shortcuts["skip"]) {
		precalcFixedHeaderHeight = calcFixedHeaderHeight();
		const headerHeight = precalcFixedHeaderHeight;
		const startFrom = window.scrollY + headerHeight + 1; //TODO sticky header
		doSkip(startFrom);
		precalcFixedHeaderHeight = null;
	} else if (e.key == shortcuts["undo"]) {
		if (prescrollPosition != null) {
			window.scrollTo(prescrollPosition.x, prescrollPosition.y);
			prescrollPosition == null;
		}
	}
});

function doSkip(pageY) {
	const next = nextTarget(pageY);
	if (next != null) {
		goTo(next);
	}
}

function nextTarget(pageY) {
	const elements = [];
	
	let commentsBounds = null;
	let commentSelector = null;
	for (const site of sites) {
		if (site.urlRegex.test(window.location.href) && site.commentSelector) {
			commentSelector = {
				selector: site.commentSelector,
				parent: 0,
			};
			break;
		}
	}
	if (!commentSelector && autoDetectComments) {
		commentSelector = guessComentSelector();
	}
	if (commentSelector) {
		let commentList = querySuperSelector(commentSelector);
		for (const comment of commentList) {
			if (!isHidden(comment)) {
				elements.push(comment);
				const rect = comment.getBoundingClientRect();
				if (commentsBounds == null) {
					commentsBounds = {
						contentLeft: rect.left + leftPadding(comment),
						top: rect.top,
						bottom: rect.bottom
					};
				} else {
					if (rect.left + leftPadding(comment) < commentsBounds.contentLeft) {
						commentsBounds.left = rect.left;
					}
					if (rect.top < commentsBounds.top) {
						commentsBounds.top = rect.top;
					}
					if (rect.bottom > commentsBounds.bottom) {
						commentsBounds.bottom = rect.bottom;
					}
				}
			}
		}
	}

	const inVertCommentBounds = function (e) {
		if (commentsBounds == null) {
			return false;
		}
		const rect = e.getBoundingClientRect();
		return commentsBounds.top <= rect.top && rect.bottom <= commentsBounds.bottom;	
	}

	const headersSelector = 'article h1,article h2,article h3,article h4,article h5,article h6';
	let headerList = document.querySelectorAll(headersSelector);
	if (headerList.length == 0) {
		const headersSelector2 = 'h1,h2,h3,h4,h5,h6';
		headerList = document.querySelectorAll(headersSelector2);
	}
	for (const header of headerList) {
		if (!isHidden(header) && !inVertCommentBounds(header)) {
			elements.push(header);
		}
	}

	if (elements.length == 0) {
		return null;
	}

	elements.sort(compareTop);

	const index = indexOfSorted(elements, pageY);
	const curIndex = index < 0 ? -index - 2 : index;
	if (curIndex >= elements.length - 1) {
		return null;
	} else {
		if (curIndex < 0 || !inVertCommentBounds(elements[curIndex])) {
			return elements[curIndex + 1];
		} else {
			let lastComment = null;
			for (let i = curIndex + 1; i < elements.length; i++) {
				const e = elements[i];
				if (inVertCommentBounds(e)) {
					const rect = e.getBoundingClientRect();
					if (rect.left + leftPadding(e) === commentsBounds.contentLeft) {
						return e;
					}
					lastComment = e;
				}
			}
			return lastComment;
		}
	}
}

function querySuperSelector(superSelector) {
	const elements = document.querySelectorAll(superSelector.selector);
	if (superSelector.parent == 0) {
		return elements;
	}
	const parents = [];
	const processedKey = Symbol();
	for (const element of elements) {
		let parent = element;
		for (let i = 0; i < superSelector.parent; i++) {
			parent = parent.parentElement;
		}
		if (!parent[processedKey]) {
			parents.push(parent);
			parent[processedKey] = true;
		}
	}
	for (const parent of parents) {
		delete parent[processedKey];
	}
	return parents;
}

function leftPadding(e) {
	return window.getComputedStyle(e, null).getPropertyValue('padding-left')
}

function compareTop(a, b) {
	const aRect = a.getBoundingClientRect();
	const bRect = b.getBoundingClientRect();
	return aRect.top - bRect.top;	
}

function goTo(element) {
	prescrollPosition = {
		'x': window.scrollX,
		'y': window.scrollY
	}
	
	element.scrollIntoView();

	const fixedHeaderHeight = precalcFixedHeaderHeight == null ? calcFixedHeaderHeight() 
			: precalcFixedHeaderHeight;
	const stickyHeaderHeight = calcStickyHeaderHeight(element);
	const headerHeight = fixedHeaderHeight + stickyHeaderHeight;	
	window.scrollBy(0, -headerHeight);
	chrome.runtime.sendMessage({
		type: 'scroll-parent-header',
		data: {
			scrolled: headerHeight
		}
	})
}

function calcFixedHeaderHeight() {
	const maxHeight = window.innerHeight / 2;
	const minWidth = window.innerWidth / 2;
	let lowestBottom = 0;
	for (const e of document.body.querySelectorAll("div,nav,header")) {
		if (e.offsetHeight > 0
			&& e.offsetHeight < maxHeight
			&& e.offsetWidth > minWidth
			&& window.getComputedStyle(e, null).getPropertyValue('position') == 'fixed') {
			const bottom = e.getBoundingClientRect().bottom;
			if (bottom < window.innerHeight / 2 && bottom > lowestBottom) {
				lowestBottom = bottom;
			}
		}
	}
	return lowestBottom;
}

function calcStickyHeaderHeight(element) {
	let parent = element;
	while ((parent = parent.parentElement) != null) {
		for (const e of parent.children) {
			if (e.offsetHeight > 0
				&& e.offsetHeight < e.offsetWidth
				&& window.getComputedStyle(e, null).getPropertyValue('position') == 'sticky') {
				return e.offsetHeight;
			}
		}
	}
	return 0;
}

function isHidden(el) {
	if (el.offsetParent === null) {
		return true;
	}
    const style = window.getComputedStyle(el);
    return style.display === 'none';
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

const commentWords = ["comment", "message", "post"];
const commentCandidatesSelectors = [];
for (const commentWord of commentWords) {
	const idSelector = containsSelector("id", commentWord);
	const classSelector = containsSelector("class", commentWord);
	commentCandidatesSelectors.push(idSelector + ',' + classSelector);
}
const includesCommentWord = s => commentWords.some(cw => s.includes(cw));

const intEndingRegexp = /\d+$/;

function endsWithInt(s) {
	return intEndingRegexp.test(s);
}

function trimIntEnding(s) {
	return s.replace(intEndingRegexp, '');
}

function startsWithSelector(attr, s) {
	return "[" + attr + "^='" + s + "']";
}

function containsSelector(attr, s) {
	return "[" + attr + "*='" + s + "']";
}

function extractCommentSelector(element) {
	if (element.id && includesCommentWord(element.id)) {
		if (endsWithInt(element.id)) {
			return startsWithSelector("id", trimIntEnding(element.id));
		} else {
			return '#' + element.id;
		}
	}
	const fpArray = [];
	for (const className of element.classList) {
		if (includesCommentWord(className)) {
			if (endsWithInt(className)) {
				fpArray.push(containsSelector('class', trimIntEnding(className)));
			} else {
				fpArray.push('.' + className);
			}
		}
	}
	if (fpArray.length > 0) {
		return fpArray.sort().join('');
	} else {
		return null;
	}
}

function guessComentSelector() {
	for (const commentCandidatesSelector of commentCandidatesSelectors) {
		const stats = {};
		const commentCandidates = document.querySelectorAll(commentCandidatesSelector);
		for (const candidate of commentCandidates) {
			if (isHidden(candidate)) {
				continue;
			}
			const cs = extractCommentSelector(candidate);
			if (cs) {
				const n = nthChild(candidate);
				const selector = "* > " + cs + ":nth-child(" + n + ")";
				if (!stats[selector]) {
					stats[selector] = 0;
				}
				stats[selector]++;
			}
		}
		console.log(stats);//TODO
		const topSelectors = topKeys(stats);
		console.log(topSelectors);//TODO
		let bestSelector = null;
		if (topSelectors.length == 0) {
			// do nothing
		} else if (topSelectors.length == 1) {
			bestSelector = {
				selector: topSelectors[0],
				parent: 0,
			};
		} else {
			// Lowest Common Ancestor & the closest comment element
			let lcaIndex = 0;
			let closestSelector = topSelectors[0];
			let parentGap = 0;
			const path = []; {
				let element = document.querySelector(closestSelector);
				do {
					path.push(element);
				} while ((element = element.parentElement) != null);
			}
			for (let i = 1; i < topSelectors.length; i++) {
				const selector = topSelectors[i];
				let element = document.querySelector(selector);
				let parentCount = -1;
				do {
					parentCount++;
					const index = path.indexOf(element);
					if (index >= 0) {
						if (index == lcaIndex && parentCount < parentGap) {
							parentGap = parentCount;
							closestSelector = selector;
						} else if (index > lcaIndex) {
							const currentGap = index - lcaIndex;
							if (parentCount  < currentGap) {
								parentGap = parentCount;
								closestSelector = selector;
							} else {
								parentGap += currentGap;
							}
							lcaIndex = index;
						}
						break;
					}
				} while ((element = element.parentElement) != null);
				if (element == null) {
					throw "Separated trees?!";
				}
			}
			bestSelector = {
				selector: closestSelector,
				parent: parentGap,
			}
		}
		console.log(bestSelector);//TODO
		if (bestSelector) {
			return bestSelector;
		}
	}
	return null;
}

function nthChild(element) {
	let i = 1;
	while(element = element.previousSibling) {
		if (element.nodeType == 1) {
			i++;
		}
	}
	return i;
}

// TODO better name for this function.
function topKeys(stats) {
	let topCount = 0;
	let topKeys = [];
	let prevTopCount = 0;
	let prevTopKeys = [];
	for (const key of Object.keys(stats)) {
		const count = stats[key];
		if (count > topCount) {
			prevTopCount = topCount;
			topCount = count;
			prevTopKeys = topKeys;
			topKeys = [];
			topKeys.push(key);
		} else if (count == topCount) {
			topKeys.push(key);
		}
	}
	if (topKeys.length == 1
		&& prevTopKeys.length > 1
		&& topCount - prevTopCount == 1) {
			return prevTopKeys;
	}
	return topKeys;
}
