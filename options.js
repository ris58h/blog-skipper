function loadDefault(callback) {
  const settingsUrl = chrome.runtime.getURL('settings.json');
  fetch(settingsUrl).then(function(response) {
    response.json().then(function(data) {
      callback(data);
    });
  });
}

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

  chrome.storage.sync.set({
    "settings": settings
  });
}

function restoreDefault() {
  loadDefault(renderSettings);
}

function restoreOptions() {
  chrome.storage.sync.get("settings", function(result) {
    if (result && result.settings) {
      renderSettings(result.settings);
    } else {
      restoreDefault();
    }
  });
}

function renderSettings(settings) {
  const sitesElement = document.querySelector(".sites");
  while (sitesElement.firstChild) {
    sitesElement.removeChild(sitesElement.firstChild);
  }
  for (site of settings.sites) {
    sitesElement.appendChild(createSiteRowElement(site));
  }
}

function createSiteRowElement(site) {
  const row = document.createElement('div');
  row.classList.add('row');
  
  row.appendChild(createSiteElement(site));
  
  const buttonElement = document.createElement('button');
  buttonElement.innerHTML = 'Remove';
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
