document.addEventListener('DOMContentLoaded', () => {
    const fileExplorer = document.getElementById('fileExplorer');

    chrome.storage.local.get(['files'], function (result) {
        const files = result.files || [];
        const fileStructure = convertFilesToTree(files);
        fileExplorer.appendChild(createTree(fileStructure));
    });

    fileExplorer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('folder')) {
            const collapsible = target.querySelector('.collapsible');
            if (collapsible) {
                collapsible.style.display = collapsible.style.display === 'none' ? 'block' : 'none';
            }
        }
    });

    function convertFilesToTree(files) {
        const tree = {};
        files.forEach(file => {
            const parts = file.name.split('/');
            let current = tree;
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = index === parts.length - 1 ? file : {};
                }
                current = current[part];
            });
        });
        return tree;
    }

    function createTree(structure) {
        const ul = document.createElement('ul');
        for (const key in structure) {
            const li = document.createElement('li');
            if (typeof structure[key] === 'object') {
                li.textContent = key;
                li.classList.add('folder');
                const innerUl = createTree(structure[key]);
                innerUl.classList.add('collapsible');
                li.appendChild(innerUl);
            } else {
                li.textContent = structure[key].name;
            }
            ul.appendChild(li);
        }
        return ul;
    }
});
