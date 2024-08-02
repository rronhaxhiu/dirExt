document.addEventListener('DOMContentLoaded', () => {
    if (chrome.storage) {
        chrome.storage.local.get('files', (result) => {
            const fileExplorer = document.getElementById('fileExplorer');
            const files = result.files || [];

            const createTree = (structure) => {
                const ul = document.createElement('ul');

                structure.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.name;
                    li.classList.add('file');
                    ul.appendChild(li);
                });

                return ul;
            };

            fileExplorer.appendChild(createTree(files));
        });
    }
});
