const loggingEnabled = false
function log(s) {
	if (loggingEnabled) {
		console.log(s)
	}
}

function nextTarget(pageY, params = {}) {
	const elements = []

	let contentBounds = { left: Number.MAX_VALUE, right: Number.MIN_VALUE }
	function addToContentBounds(rect) {
		if (rect.left < contentBounds.left) {
			contentBounds.left = rect.left
		}
		if (rect.right > contentBounds.right) {
			contentBounds.right = rect.right
		}
	}
	function isUnrelatedContent(rect) {
		const contentWidth = contentBounds.right - contentBounds.left
		const elementLeft = rect.left - contentBounds.left
		return elementLeft > (contentWidth * 0.66)
	}
	let commentsBounds = null
	function addToCommentBounds(comment, rect) {
		const contentLeft = rect.left + leftPadding(comment)
		if (commentsBounds == null) {
			commentsBounds = {
				contentLeft,
				top: rect.top,
				bottom: rect.bottom
			}
		} else {
			if (contentLeft < commentsBounds.contentLeft) {
				commentsBounds.contentLeft = contentLeft
			}
			if (rect.top < commentsBounds.top) {
				commentsBounds.top = rect.top
			}
			if (rect.bottom > commentsBounds.bottom) {
				commentsBounds.bottom = rect.bottom
			}
		}
	}
	function inVertCommentBounds(rect) {
		if (commentsBounds == null) {
			return false
		}
		return commentsBounds.top <= rect.top && rect.bottom <= commentsBounds.bottom
	}
	function isLeftmostCommentContent(comment, rect) {
		if (commentsBounds == null) {
			return false
		}
		const contentLeft = rect.left + leftPadding(comment)
		return contentLeft === commentsBounds.contentLeft
	}

	let commentSelector = null
	if (params.commentSelector) {
		commentSelector = {
			selector: params.commentSelector,
			parent: 0,
		}
	}
	const isRootUrl = window.location.pathname == "/"
	if (!commentSelector && params.autoDetectComments && !isRootUrl) {
		commentSelector = guessComentSelector()
	}
	if (commentSelector) {
		let commentList = querySuperSelector(commentSelector)
		for (const comment of commentList) {
			if (!isHidden(comment)) {
				elements.push(comment)
				const rect = comment.getBoundingClientRect()
				addToContentBounds(rect)
				addToCommentBounds(comment, rect)
			}
		}
	}

	let headerList = []
	if (document.querySelectorAll("article").length == 1) {
		const headersSelector = 'article h1, article h2, article h3, article h4, article h5, article h6'
		headerList = document.querySelectorAll(headersSelector)
	}
	if (headerList.length == 0) {
		const headersSelector2 = 'h1, h2, h3, h4, h5, h6'
		headerList = document.querySelectorAll(headersSelector2)
	}
	for (const header of headerList) {
		addToContentBounds(header.getBoundingClientRect())
	}
	for (const header of headerList) {
		const rect = header.getBoundingClientRect()
		if (!isHidden(header) && !inVertCommentBounds(rect) && !isUnrelatedContent(rect)) {
			elements.push(header)
		}
	}

	if (elements.length == 0) {
		return null
	}

	elements.sort(compareTop)

	const index = indexOfSorted(elements, pageY)
	const curIndex = index < 0 ? -index - 2 : index
	if (curIndex >= elements.length - 1) {
		return null
	} else {
		if (curIndex < 0 || !inVertCommentBounds(elements[curIndex].getBoundingClientRect())) {
			return elements[curIndex + 1]
		} else {
			let lastComment = null
			for (let i = curIndex + 1; i < elements.length; i++) {
				const e = elements[i]
				const rect = e.getBoundingClientRect()
				if (inVertCommentBounds(rect)) {
					if (isLeftmostCommentContent(e, rect)) {
						return e
					}
					lastComment = e
				}
			}
			return lastComment
		}
	}
}

function querySuperSelector(superSelector) {
	const elements = document.querySelectorAll(superSelector.selector)
	if (superSelector.parent == 0) {
		return elements
	}
	const parents = []
	const processedKey = Symbol()
	for (const element of elements) {
		let parent = element
		for (let i = 0; i < superSelector.parent; i++) {
			parent = parent.parentElement
		}
		if (!parent[processedKey]) {
			parents.push(parent)
			parent[processedKey] = true
		}
	}
	for (const parent of parents) {
		delete parent[processedKey]
	}
	return parents
}

function leftPadding(e) {
	return parseFloat(window.getComputedStyle(e, null).getPropertyValue('padding-left'))
}

function compareTop(a, b) {
	const aRect = a.getBoundingClientRect()
	const bRect = b.getBoundingClientRect()
	return aRect.top - bRect.top
}

function indexOfSorted(elements, pageY) { //TODO binary search
	const y = pageY - window.scrollY
	let prevBottom = Number.NEGATIVE_INFINITY
	for (let i = 0; i < elements.length; i++) {
		const rect = elements[i].getBoundingClientRect()
		if (y < rect.top) {
			if (y <= prevBottom) {
				return i - 1
			} else {
				return -i - 1
			}
		}
		prevBottom = rect.bottom
	}
	return -elements.length - 1
}

function guessComentSelector() {
	if (document.querySelectorAll(".comment").length > 1) {
		log("Dumb comments detection is used!")
		return {
			selector: ".comment",
			parent: 0,
		}
	}
	for (const commentCandidatesSelector of commentCandidatesSelectors) {
		const stats = {}
		const commentCandidates = document.querySelectorAll(commentCandidatesSelector)
		for (const candidate of commentCandidates) {
			if (isHidden(candidate)) {
				continue
			}
			const cs = extractCommentSelector(candidate)
			if (cs) {
				const n = siblingIndex(candidate)
				const selector = cs + ":nth-child(" + n + ")"
				if (!stats[selector]) {
					stats[selector] = 0
				}
				stats[selector]++
			}
		}
		log(stats)
		const bestSelectors = bestKeys(stats)
		log(bestSelectors)
		let bestSelector = null
		if (bestSelectors.length == 0) {
			// do nothing
		} else if (bestSelectors.length == 1) {
			bestSelector = {
				selector: bestSelectors[0],
				parent: 0,
			}
		} else {
			// Lowest Common Ancestor & the closest comment element
			let lcaIndex = 0
			let closestSelector = bestSelectors[0]
			let parentGap = 0
			const path = []; {
				let element = document.querySelector(closestSelector)
				do {
					path.push(element)
				} while ((element = element.parentElement) != null)
			}
			for (let i = 1; i < bestSelectors.length; i++) {
				const selector = bestSelectors[i]
				let element = document.querySelector(selector)
				let parentCount = -1
				do {
					parentCount++
					const index = path.indexOf(element)
					if (index >= 0) {
						if (index == lcaIndex && parentCount < parentGap) {
							parentGap = parentCount
							closestSelector = selector
						} else if (index > lcaIndex) {
							const currentGap = index - lcaIndex
							if (parentCount  < currentGap) {
								parentGap = parentCount
								closestSelector = selector
							} else {
								parentGap += currentGap
							}
							lcaIndex = index
						}
						break
					}
				} while ((element = element.parentElement) != null)
				if (element == null) {
					throw "Separated trees?!"
				}
			}
			bestSelector = {
				selector: closestSelector,
				parent: parentGap,
			}
		}
		log(bestSelector)
		if (bestSelector) {
			return bestSelector
		}
	}
	return null
}

function extractCommentSelector(element) {
	if (element.id && includesCommentWord(element.id)) {
		if (endsWithInt(element.id)) {
			return startsWithSelector("id", trimIntEnding(element.id), true)
		} else {
			return '#' + element.id
		}
	}
	const fpArray = []
	for (const className of element.classList) {
		if (includesCommentWord(className)) {
			if (endsWithInt(className)) {
				fpArray.push(containsSelector('class', trimIntEnding(className), true))
			} else {
				fpArray.push('.' + className)
			}
		}
	}
	if (fpArray.length > 0) {
		return fpArray.sort().join('')
	} else {
		return null
	}
}

const commentWords = ["comment"] // must be lowercase
const commentCandidatesSelectors = []
for (const commentWord of commentWords) {
	const idSelector = containsSelector("id", commentWord, true) + ":not(code)"
	const classSelector = containsSelector("class", commentWord, true) + ":not(code)"
	commentCandidatesSelectors.push(idSelector + ',' + classSelector)
}
const includesCommentWord = s => commentWords.some(cw => s.toLowerCase().includes(cw))

const intEndingRegexp = /\d+$/

function endsWithInt(s) {
	return intEndingRegexp.test(s)
}

function trimIntEnding(s) {
	return s.replace(intEndingRegexp, '')
}

function startsWithSelector(attr, s, caseInsensitive) {
	return `[${attr}^="${s}"${caseInsensitive ? ' i' : ''}]`
}

function containsSelector(attr, s, caseInsensitive) {
	return `[${attr}*="${s}"${caseInsensitive ? ' i' : ''}]`
}

function siblingIndex(element) {
	let i = 1
	while((element = element.previousSibling)) {
		if (element.nodeType == 1) {
			i++
		}
	}
	return i
}

function bestKeys(stats) {
	const keys = Object.keys(stats).filter(k => stats[k] > 1)
	if (keys.length <= 1) {
		return keys
	}
	keys.sort((a, b) => stats[b] - stats[a])
	const topKeys = []
	for (let i = 0; topKeys.length == 0 || stats[keys[i]] == stats[keys[0]]; i++) {
		topKeys.push(keys[i])
	}
	if (topKeys.length == 1) {
		const topKeys2 = []
		const start = topKeys.length
		for (let i = start; topKeys2.length == 0 || stats[keys[i]] == stats[keys[start]]; i++) {
			topKeys2.push(keys[i])
		}
		if (topKeys2.length > 1 && stats[topKeys[0]] - stats[topKeys2[0]] == 1) {
			return topKeys2
		}
	}
	return topKeys
}

function isHidden(el) {
    const style = window.getComputedStyle(el)
	return style.display === 'none'
		|| (el.offsetParent === null && style.position !== 'fixed')
		|| style.visibility === 'hidden'
}
