const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');


async function addUser(req, res) {

    const { name, age } = req.body;

    await userService.addUser({
        name,
        age
    });

    return res.status(200).json({message: "Đã thêm thành công"});
};


async function getUser(req, res)
{   
    const data = await userService.getUser()
    return res.status(200).json({
        success: true,
        data
    })
}
module.exports = {
    addUser,
    getUser
}