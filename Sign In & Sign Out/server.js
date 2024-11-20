const express = require('express');
const path = require('path');
const app = express();
const port = 5504;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle all routes by sending index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
}); 