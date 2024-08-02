const collapse = document.querySelector('#collapse');
const fileExplorer = document.querySelector('#fileExplorer');
let collapsed = false;

console.log('test');

console.log(collapse);
console.log(fileExplorer);

collapse.addEventListener('click', () => {
    if (!collapsed) {
        console.log('inside if');
        fileExplorer.style.display = "none";
        collapse.innerHTML = "Show";
    }
    else {
        console.log('inside else');
        fileExplorer.style.display = "block";
        collapse.innerHTML = "Hide";
    }

    collapsed = !collapsed;
})

async function fetchFileStructure() {
    const response = await fetch('/files');
    return response.json();
}

function createTree(structure) {
    const ul = document.createElement('ul');

    structure.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;

        if (item.type === 'folder') {
            li.classList.add('folder');
            const childrenUl = createTree(item.children);
            childrenUl.classList.add('collapsible');
            li.appendChild(childrenUl);
        } else {
            li.classList.add('file');
        }

        ul.appendChild(li);
    });

    return ul;
}

document.addEventListener('DOMContentLoaded', async () => {

    const fileExplorer = document.getElementById('fileExplorer');
    const fileStructure = await fetchFileStructure();
    fileExplorer.appendChild(createTree(fileStructure));

    fileExplorer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('folder')) {
            const collapsible = target.querySelector('.collapsible');
            if (collapsible) {
                collapsible.style.display = collapsible.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
});