chrome.runtime.onInstalled.addListener(() => {
    console.log('Google Docs Explorer installed');
});

chrome.action.onClicked.addListener(() => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError.message);
            return;
        }

        console.log('Token received:', token);

        const allItems = new Map();  // Use Map to avoid duplicate entries

        const fetchFiles = (pageToken = '', folderId = null) => {
            let query = folderId ? `'${folderId}' in parents and ` : '';
            query += 'mimeType=\'application/vnd.google-apps.document\' or ' +
                'mimeType=\'application/vnd.google-apps.folder\' or ' +
                'mimeType=\'application/vnd.google-apps.spreadsheet\' or ' +
                'mimeType=\'application/vnd.google-apps.presentation\' or ' +
                'mimeType=\'application/vnd.google-apps.form\' or ' +
                'mimeType=\'text/plain\' or ' +
                'mimeType=\'text/csv\' or ' +
                'mimeType=\'application/pdf\' or ' +
                'mimeType=\'image/jpeg\' or ' +
                'mimeType=\'image/png\' or ' +
                'mimeType=\'image/gif\' or ' +
                'mimeType=\'application/vnd.ms-excel\' or ' +
                'mimeType=\'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\' or ' +
                'mimeType=\'application/vnd.ms-powerpoint\' or ' +
                'mimeType=\'application/vnd.openxmlformats-officedocument.presentationml.presentation\' or ' +
                'mimeType=\'application/msword\' or ' +
                'mimeType=\'application/vnd.openxmlformats-officedocument.wordprocessingml.document\' or ' +
                'mimeType=\'application/zip\' or ' +
                'mimeType=\'application/x-tar\'';
            let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,webViewLink,webContentLink,parents)`;
            if (pageToken) {
                url += `&pageToken=${pageToken}`;
            }

            console.log('Fetching URL:', url);  // Log the URL being fetched

            return fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Fetched data:', data);  // Log the fetched data

                    data.files.forEach(file => {
                        console.log('Processing file:', file);  // Log each file being processed
                        allItems.set(file.id, file);  // Ensure unique entries
                    });

                    if (data.nextPageToken) {
                        return fetchFiles(data.nextPageToken, folderId);
                    }
                })
                .catch(error => {
                    console.error('Error fetching files:', error);
                });
        };

        const fetchFolderContents = (folderId) => {
            return fetchFiles('', folderId).then(() => {
                const folderItems = Array.from(allItems.values()).filter(item => item.parents && item.parents.includes(folderId));
                const subFolderPromises = folderItems.filter(item => item.mimeType === 'application/vnd.google-apps.folder').map(subFolder => fetchFolderContents(subFolder.id));

                return Promise.all(subFolderPromises);
            });
        };

        const processAndStoreData = () => {
            const items = Array.from(allItems.values());
            const constructDocUrl = (fileId) => `https://docs.google.com/document/d/${fileId}/view`;

            const itemsWithLinks = items.map(item => ({
                id: item.id,
                name: item.name,
                mimeType: item.mimeType,
                url: item.webViewLink || item.webContentLink || (item.mimeType === 'application/vnd.google-apps.document' ? constructDocUrl(item.id) : 'No Link Available'),
                parents: item.parents || []
            }));

            console.log('Items with links:', itemsWithLinks);  // Log the final items with links

            if (chrome.storage) {
                chrome.storage.local.set({ items: itemsWithLinks }, () => {
                    chrome.tabs.create({ url: 'index.html' });
                });
            } else {
                console.error('Chrome storage API is not available.');
            }
        };

        fetchFiles().then(() => {
            const rootFolders = Array.from(allItems.values()).filter(item => item.mimeType === 'application/vnd.google-apps.folder' && (!item.parents || item.parents.length === 0));

            if (rootFolders.length) {
                const rootFolderPromises = rootFolders.map(folder => fetchFolderContents(folder.id));

                Promise.all(rootFolderPromises).then(() => {
                    processAndStoreData();
                });
            } else {
                processAndStoreData();
            }
        });
    });
});
