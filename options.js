function saveOptions(e) {
  e.preventDefault();

  const settings = {};

  settings["sites"] = [];
  const sites = document.querySelectorAll(".sites .site");
  for (site of sites) {
    const urlPattern = site.querySelector(".url-pattern").value;
    const commentSelector = site.querySelector(".comment-selector").value;
    if (urlPattern) {
      settings["sites"].push({
        "urlPattern": urlPattern,
        "commentSelector": commentSelector
      });
    }
  }

  settings["shortcuts"] = {};
  const skipShortcut = document.querySelector(".shortcuts .skip").value;
  if (skipShortcut) {
    settings["shortcuts"]["skip"] = skipShortcut;
  }
  const undoShortcut = document.querySelector(".shortcuts .undo").value;
  if (undoShortcut) {
    settings["shortcuts"]["undo"] = undoShortcut;
  }

  chrome.storage.sync.set({
    "settings": settings
  });
}

function restoreDefault() {
  loadDefault(renderSettings);
}

function restoreOptions() {
  load(renderSettings);
}

function renderSettings(settings) {
  const sitesElement = document.querySelector(".sites");
  while (sitesElement.firstChild) {
    sitesElement.removeChild(sitesElement.firstChild);
  }
  for (site of settings.sites) {
    sitesElement.appendChild(createSiteRowElement(site));
  }

  const shortcuts = settings["shortcuts"];
  if (shortcuts["skip"]) {
    document.querySelector(".shortcuts .skip").value = shortcuts["skip"];
  }
  if (shortcuts["undo"]) {
    document.querySelector(".shortcuts .undo").value = shortcuts["undo"];
  }
}

function createSiteRowElement(site) {
  const row = document.createElement('div');
  row.classList.add('row');
  
  row.appendChild(createSiteElement(site));
  
  const buttonElement = document.createElement('button');
  buttonElement.classList.add('remove-site');
  buttonElement.innerHTML = 'X';
  buttonElement.addEventListener('click', function() {
    row.parentElement.removeChild(row);
  });
  row.appendChild(buttonElement);
  
  return row;
}

function createSiteElement(site) {
  const siteElement = document.createElement('div');
  siteElement.classList.add('site');

  const urlElement = document.createElement('input');
  urlElement.classList.add('url-pattern');
  siteElement.appendChild(urlElement);
  
  const selectorElement = document.createElement('input');
  selectorElement.classList.add('comment-selector');
  siteElement.appendChild(selectorElement);
  
  if (site) {
    urlElement.value = site.urlPattern;
    selectorElement.value = site.commentSelector;
  }

  return siteElement;
}

function addNewSite() {
  const sitesElement = document.querySelector(".sites");
  sitesElement.appendChild(createSiteRowElement());
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector(".add-site").addEventListener("click", addNewSite);
document.querySelector(".default").addEventListener("click", restoreDefault);
document.querySelector("form").addEventListener("submit", saveOptions);
