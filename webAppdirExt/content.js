document.addEventListener('DOMContentLoaded', () => {
    if (chrome.storage) {
        chrome.storage.local.get('items', (result) => {
            const fileExplorer = document.getElementById('fileExplorer');
            const items = result.items || [];

            fileExplorer.innerHTML = '';

            const buildTree = (items) => {
                const itemMap = {};
                const tree = [];

                items.forEach(item => {
                    itemMap[item.id] = item;
                    item.children = [];
                });

                items.forEach(item => {
                    if (item.parents.length > 0 && itemMap[item.parents[0]]) {
                        itemMap[item.parents[0]].children.push(item);
                    } else {
                        tree.push(item);
                    }
                });

                return tree;
            };

            const renderTree = (nodes) => {
                const ul = document.createElement('ul');

                nodes.forEach(node => {
                    const li = document.createElement('li');

                    if (node.mimeType === 'application/vnd.google-apps.folder') {
                        const folderLink = document.createElement('a');
                        folderLink.textContent = node.name;
                        folderLink.href = '#';
                        folderLink.classList.add('folder');
                        folderLink.onclick = (e) => {
                            e.preventDefault();
                            const childUl = li.querySelector('ul');
                            if (childUl) {
                                childUl.style.display = childUl.style.display === 'none' ? 'block' : 'none';
                            }
                        };

                        li.appendChild(folderLink);

                        // Create a nested UL for the folder's children and hide it initially
                        const childTree = renderTree(node.children);
                        if (childTree.childElementCount > 0) {
                            childTree.style.display = 'none';  // Hide child folders by default
                            li.appendChild(childTree);
                        }
                    } else {
                        const fileLink = document.createElement('a');
                        fileLink.textContent = node.name;
                        fileLink.href = node.url;
                        fileLink.target = '_blank';
                        fileLink.classList.add('file');
                        li.appendChild(fileLink);
                    }

                    ul.appendChild(li);
                });

                return ul;
            };

            const tree = buildTree(items);
            fileExplorer.appendChild(renderTree(tree));
        });
    } else {
        console.error('Chrome storage API is not available.');
    }
});
