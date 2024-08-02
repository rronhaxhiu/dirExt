chrome.runtime.onInstalled.addListener(() => {
    console.log('Google Docs Explorer installed');
});

chrome.action.onClicked.addListener(() => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        fetch('https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.document\'', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (chrome.storage) {
                chrome.storage.local.set({ files: data.files }, () => {
                    chrome.tabs.create({ url: 'index.html' });
                });
            }
        })
        .catch(error => console.error(error));
    });
});
