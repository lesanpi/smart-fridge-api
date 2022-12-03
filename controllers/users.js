const bcrypt = require('bcrypt')
const { token } = require('morgan')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.post('/reset', async (request, response) => {
    console.log('request', request)
    return response.json({
         success: true 
    })
   


})

usersRouter.get('/', async (request, response) => {
    try {
        const users = await User.find({})
            .populate('fridges', {
                deviceId: 1,
                name: 1,
            })

        response.json(users)
    } catch (error) {
        // console.error(error)
        next(error)
    }
})

usersRouter.post('/', async (request, response) => {
    const { body } = request
    const { email, name, password, phone, fcmToken } = body

    if (!email) {
        return response.status(400).json({
            error: 'Required "Email" field is missing'
        })
    }
    

    if (!phone) {
        return response.status(400).json({
            error: 'Required "Phone" field is missing'
        })
    }

    if (!name) {
        return response.status(400).json({
            error: 'Required "Name" field is missing'
        })
    }

    if (!password) {
        return response.status(400).json({
            error: 'Required "Password" field is missing'
        })
    }

    if (!fcmToken) {
        return response.status(400).json({
            error: 'An error occurred'
        })
    }

    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
        email: email.toLowerCase(),
        name,
        phone,
        passwordHash,

    })
    user.tokens = [fcmToken];
    // console.log(user)
    user.save()
        .then(
            savedUser => response.json(savedUser)
        ).catch(
            err => {
                console.log(err)
                response.status(400).json({
                    error: 'User already registered'
                })
            }
        )

})




module.exports = usersRouter