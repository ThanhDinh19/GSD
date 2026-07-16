const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const sewingProcessImageDir = require('./config/sewingProcessImageDir');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Serve hình ảnh upload trước SPA fallback
app.use(
    '/sewing_process_images',
    express.static(sewingProcessImageDir)
);

// 2. API routes
app.use('/api', apiRoutes);

// 3. API not found
app.use('/api', notFoundHandler);

// 4. Serve frontend build nếu có
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// 5. Error handler để cuối cùng
app.use(errorHandler);

module.exports = app;