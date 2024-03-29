function saveOptions(e) {
    e.preventDefault()

    const settings = {}

    settings["autoDetectComments"] = document.querySelector("#autoDetectComments").checked

    settings["contextMenu"] = {}
    settings["contextMenu"]["enabled"] = document.querySelector("#contextMenu-enabled").checked
    settings["contextMenu"]["items"] = {}
    settings["contextMenu"]["items"]["skip"] = document.querySelector("#contextMenu-item-skip").checked
    settings["contextMenu"]["items"]["undo"] = document.querySelector("#contextMenu-item-undo").checked

    settings["skipOnMiddleClick"] = document.querySelector("#skipOnMiddleClick").checked

    settings["sites"] = []
    const sites = document.querySelectorAll("#sites .site")
    for (const site of sites) {
        const urlPattern = site.querySelector(".url-pattern").value
        const commentSelector = site.querySelector(".comment-selector").value
        if (urlPattern) {
            settings["sites"].push({
                "urlPattern": urlPattern,
                "commentSelector": commentSelector
            })
        }
    }

    settings["shortcuts"] = {}
    const skipShortcut = document.querySelector("#shortcuts .skip").value
    if (skipShortcut) {
        settings["shortcuts"]["skip"] = skipShortcut
    }
    const undoShortcut = document.querySelector("#shortcuts .undo").value
    if (undoShortcut) {
        settings["shortcuts"]["undo"] = undoShortcut
    }

    extension.settings.save(settings)
}

function restoreDefault() {
    extension.settings.loadDefault(renderSettings)
}

function restoreOptions() {
    extension.settings.load(renderSettings)
}

function renderSettings(settings) {
    document.querySelector("#autoDetectComments").checked = settings["autoDetectComments"]

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
    document.querySelector("#contextMenu-enabled").checked = cm["enabled"]
    document.querySelector("#contextMenu-item-skip").checked = cm["items"]["skip"]
    document.querySelector("#contextMenu-item-undo").checked = cm["items"]["undo"]

    document.querySelector("#skipOnMiddleClick").checked = settings["skipOnMiddleClick"]

    const sitesElement = document.querySelector("#sites")
    while (sitesElement.firstChild) {
        sitesElement.removeChild(sitesElement.firstChild)
    }
    for (const site of settings.sites) {
        sitesElement.appendChild(createSiteRowElement(site))
    }

    const shortcuts = settings["shortcuts"]
    if (shortcuts["skip"]) {
        document.querySelector("#shortcuts .skip").value = shortcuts["skip"]
    }
    if (shortcuts["undo"]) {
        document.querySelector("#shortcuts .undo").value = shortcuts["undo"]
    }
}

function createSiteRowElement(site) {
    const row = document.createElement('div')
    row.classList.add('row')

    row.appendChild(createSiteElement(site))

    const buttonElement = document.createElement('button')
    buttonElement.classList.add('remove-site')
    buttonElement.innerHTML = 'X'
    buttonElement.addEventListener('click', function() {
        row.parentElement.removeChild(row)
    })
    row.appendChild(buttonElement)

    return row
}

function createSiteElement(site) {
    const siteElement = document.createElement('div')
    siteElement.classList.add('site')

    const urlElement = document.createElement('input')
    urlElement.type = "text"
    urlElement.classList.add('url-pattern')
    siteElement.appendChild(urlElement)

    const selectorElement = document.createElement('input')
    selectorElement.type = "text"
    selectorElement.classList.add('comment-selector')
    selectorElement.placeholder = 'none'
    siteElement.appendChild(selectorElement)

    if (site) {
        urlElement.value = site.urlPattern
        selectorElement.value = site.commentSelector
    }

    return siteElement
}

function addNewSite() {
    const sitesElement = document.querySelector("#sites")
    sitesElement.appendChild(createSiteRowElement())
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("#add-site").addEventListener("click", addNewSite)
document.querySelector("#default").addEventListener("click", restoreDefault)
document.querySelector("form").addEventListener("submit", saveOptions)
