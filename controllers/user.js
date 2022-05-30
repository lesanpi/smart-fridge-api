const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')



userRouter.post('/', userExtractor, async (request, response) => {
    const { userId } = request

    try {
        const user = await User.findById(userId).populate('fridges', {
            deviceId: 1,
            name: 1,
        })
        // console.log(user)
        return response.send({
            name: user.name,
            email: user.email,
            phone: user.phone,
            fridges: user.fridges,
        })
    } catch (error) {
        return response.status(404).json({
            error: 'No se pudo encontrar el usuario'
        })
    }

})

module.exports = userRouter