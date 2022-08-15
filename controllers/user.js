const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')



userRouter.post('/', userExtractor, async (request, response) => {
    const { body } = request
    const { userId } = request
    const { fcmToken } = body

    if (!fcmToken) {
        return response.status(404).json({
            error: 'No token or invalid'
        })
    }

    try {
        const user = await User.findById(userId).populate('fridges', {
            deviceId: 1,
            name: 1,
        })
        user.tokens = [...user.tokens.filter(token => token !== fcmToken), fcmToken]

        return response.send({
            id: user._id,
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

userRouter.post('/tokens', userExtractor, async (request, response) => {
    const { userId } = request

    try {
        const user = await User.findById(userId).populate('fridges', {
            deviceId: 1,
            name: 1,
        })
        return response.send({
            id: user._id,
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