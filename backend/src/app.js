const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// dinh 25/07/2026
const cookieParser = require('cookie-parser');
const {
notFoundHandler,
    errorHandler,
} = require('./middlewares/error.middleware');

const apiRoutes = require('./routes');
const sewingProcessImageDir = require('./config/sewingProcessImageDir');
const gsdAnalysisImageDir = require('./config/gsdAnalysisImageDir');
const app = express();

// dinh 25/07/2026
app.set('trust proxy', 1);

app.use(
    cors({
        origin:
            process.env.FRONTEND_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({
    limit: '10mb',
}));

app.use(cookieParser());


// 1. Serve hình ảnh upload trước SPA fallback
app.use(
    '/sewing_process_images',
    express.static(sewingProcessImageDir),
);
app.use(
    '/gsd_analysis_images',
    express.static(gsdAnalysisImageDir)
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