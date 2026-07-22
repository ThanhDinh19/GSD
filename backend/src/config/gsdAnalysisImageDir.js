const path = require('path');
const fs = require('fs');

/**
 * Giả sử bạn chạy backend bằng lệnh npm run dev trong thư mục backend.
 * process.cwd() = .../backend
 * ../gsd_analysis_images = .../project-root/gsd_analysis_images
 */
const gsdAnalysisImageDir = path.resolve(
    process.cwd(),
    '../gsd_analysis_images'
);

if (!fs.existsSync(gsdAnalysisImageDir)) {
    fs.mkdirSync(gsdAnalysisImageDir, { recursive: true });
}

console.log('[GSD_ANALYSIS_IMAGE_DIR]', gsdAnalysisImageDir);

module.exports = gsdAnalysisImageDir;