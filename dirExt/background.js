chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.action.onClicked.addListener(() => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        fetch('https://www.googleapis.com/drive/v3/files', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('Files:', data.files);
                // Process and display the files as needed
            })
            .catch(error => console.error('Error:', error));
    });
});
