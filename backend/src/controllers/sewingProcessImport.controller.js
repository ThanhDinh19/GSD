const {
    previewSewingProcessImport,
} = require('../services/sewingProcessImport.service');


function parseHeader(value) {
    if (!value) {
        return {};
    }

    if (
        typeof value === 'object' &&
        !Buffer.isBuffer(value)
    ) {
        return value;
    }

    try {
        const parsed = JSON.parse(
            String(value)
        );

        if (
            !parsed ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
        ) {
            throw new Error();
        }

        return parsed;
    } catch {
        const error = new Error(
            'Header gửi lên không đúng định dạng JSON.'
        );

        error.statusCode = 400;

        throw error;
    }
}


async function previewImport(
    req,
    res,
    next
) {
    try {
        if (
            !req.file ||
            !req.file.buffer
        ) {
            const error = new Error(
                'Vui lòng chọn file Excel để import.'
            );

            error.statusCode = 400;

            throw error;
        }


        const originalName =
            String(
                req.file.originalname || ''
            ).toLowerCase();


        const validExtension =
            originalName.endsWith('.xlsx') ||
            originalName.endsWith('.xls');


        if (!validExtension) {
            const error = new Error(
                'Chỉ hỗ trợ file Excel .xlsx hoặc .xls.'
            );

            error.statusCode = 400;

            throw error;
        }


        const header =
            parseHeader(
                req.body?.header
            );


        const result =
            await previewSewingProcessImport(
                req.file.buffer,
                header
            );


        return res.status(200).json({
            success: true,
            message:
                'Đọc file Excel thành công.',
            data: result,
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    previewImport,
};