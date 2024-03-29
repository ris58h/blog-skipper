let autoDetectComments = false
let commentSelector = null
let shortcuts = {}
let skipOnMiddleClick = false

function initFromSettings(settings) {
	if (settings.autoDetectComments != null) {
		autoDetectComments = settings.autoDetectComments
	}
	if (settings.sites) {
		for (const site of settings.sites) {
			const urlRegex = new RegExp("^" + site.urlPattern.replace(/\*/g, ".*") + "$")
			if (urlRegex.test(window.location.href) && site.commentSelector) {
				commentSelector = site.commentSelector
				break
			}
		}
	}
	if (settings.shortcuts) {
		shortcuts = settings.shortcuts
	}
	if (settings.skipOnMiddleClick != null) {
		skipOnMiddleClick = settings.skipOnMiddleClick
	}
}

//TODO: race condition
extension.settings.load(initFromSettings)
extension.settings.addChangeListener(initFromSettings)

let prescrollPosition = null

function undo() {
	if (prescrollPosition != null) {
		window.scrollTo(prescrollPosition.x, prescrollPosition.y)
		prescrollPosition == null
	}
}

function doFullSkip(pageY) {
	prescrollPosition = {
		'x': window.scrollX,
		'y': window.scrollY
	}
	const headerHeight = doSkip(pageY, {autoDetectComments, commentSelector})
	chrome.runtime.sendMessage({
		type: 'scroll-parent-header',
		data: {
			scrolled: headerHeight
		}
	})
}

document.addEventListener("auxclick", function (e) {
	if (skipOnMiddleClick) {
		if (e.button == 1 && !inNode(e.target, "A")) {
			doFullSkip(e.pageY)
		}
	}

	function inNode(element, nodeName) {
		do {
			if (element.nodeName == nodeName) {
				return true
			}
			element = element.parentNode
		} while (element != null)
		return false
	}
})

let clickY

document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY
})

chrome.runtime.onMessage.addListener(function(msg) {
	if (msg.type == 'skip') {
		if (msg.mouse) {
			doFullSkip(clickY)
		} else {
			doFullSkip(headerSkipOffset())
		}
	} else if (msg.type == 'undo') {
		undo()
	} else if (msg.type == 'scroll-header') {
		const headerHeight = calcHeaderHeight()
		window.scrollBy(0, -(headerHeight - msg.data.scrolled))
	}
})

document.addEventListener('keyup', function(e) {
	if (document.activeElement
		&& (document.activeElement.tagName == "INPUT"
		|| document.activeElement.tagName == "SELECT"
			|| document.activeElement.tagName == "TEXTAREA")) {
				return
	}
	if (!e.ctrlKey && !e.altKey) {
		if (e.key == shortcuts['skip']) {
			doFullSkip(headerSkipOffset())
		} else if (e.key == shortcuts['undo']) {
			undo()
		}
	}
})

function headerSkipOffset() {
	const headerHeight = calcHeaderHeight()
	return window.scrollY + headerHeight + 1
}

function doSkip(pageY, params) {
	const next = nextTarget(pageY, params)
	return next == null ? null : goTo(next)
}

function goTo(element) {
	element.scrollIntoView()

	const headerHeight = calcHeaderHeight()
	window.scrollBy(0, -headerHeight)
	return headerHeight
}

function calcHeaderHeight() {
	const maxHeight = window.innerHeight / 2
	const minWidth = window.innerWidth / 2
	let lowestBottom = 0
	for (const e of document.body.querySelectorAll("div,nav,header,section")) {
		if (e.offsetHeight > 0
			&& e.offsetHeight < maxHeight
			&& e.offsetWidth > minWidth) {
			const style = window.getComputedStyle(e, null)
			if (isHidden(e)) {
				continue
			}
			const position = style.getPropertyValue('position')
			if (position == 'fixed' || position == 'sticky') {
				const rect = e.getBoundingClientRect()
				if (position == 'sticky') {
					const stuck = rect.top == parseFloat(e.style.top)
					if (!stuck) {
						continue
					}
				}
				const bottom = rect.bottom
				if (bottom < window.innerHeight / 2 && bottom > lowestBottom) {
					lowestBottom = bottom
				}
			}
		}
	}
	return lowestBottom
}
