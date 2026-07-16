const path = require('path');
const fs = require('fs');

/**
 * Giả sử bạn chạy backend bằng lệnh npm run dev trong thư mục backend.
 * process.cwd() = .../backend
 * ../sewing_process_images = .../project-root/sewing_process_images
 */
const sewingProcessImageDir = path.resolve(
    process.cwd(),
    '../sewing_process_images'
);

if (!fs.existsSync(sewingProcessImageDir)) {
    fs.mkdirSync(sewingProcessImageDir, { recursive: true });
}

console.log('[SEWING_PROCESS_IMAGE_DIR]', sewingProcessImageDir);

module.exports = sewingProcessImageDir;