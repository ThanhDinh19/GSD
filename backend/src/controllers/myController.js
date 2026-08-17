const myService = require('../services/myservices');

async function vGSD30BizDoc(req, res, next) {
    try {
        const result = await myService.vGSD30BizDoc();

        return res.status(200).json({
            success: true,
            columns: result.columns,
            data: result.data,
        });
    } catch (err) {
        next(err);
    }
}



module.exports = {
    vGSD30BizDoc
}