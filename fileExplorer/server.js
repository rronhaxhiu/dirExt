const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Function to get file structure
const getFileStructure = (dirPath) => {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map(item => {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            return {
                name: item.name,
                type: 'folder',
                children: getFileStructure(fullPath)
            };
        } else {
            return {
                name: item.name,
                type: 'file'
            };
        }
    });
};

app.get('/files', (req, res) => {

    //DIRECTORY
    const dirPath = path.join(__dirname, '../../../'); 
    const fileStructure = getFileStructure(dirPath);
    res.json(fileStructure);
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
