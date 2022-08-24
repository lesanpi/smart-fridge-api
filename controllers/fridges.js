const bcrypt = require('bcrypt')
const fridgesRouter = require('express').Router()
const Fridge = require('../models/Fridge')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')
const fridgeExtractor = require('../middlewares/fridgeExtractor')

fridgesRouter.get('/', (request, response) => {
    Fridge.find({}).populate('user', {
        email: 1,
        name: 1
    })
        .then(fridges => {
            response.json(fridges)
        })
        .catch(err => next(err))
})



fridgesRouter.post('/alert', fridgeExtractor, async (request, response, next) => {
    const { body } = request
    const { user, id } = request
    const { message } = body

    const fridge = await Fridge.findById(id);
    if (!fridge) {
        return response.status(401).json({
            error: 'Fridge not found'
        })
    }
    const userId = fridge.user;
    const ownerUser = await User.findById(userId);
    if (!ownerUser) {
        return response.status(401).json({
            error: 'User not found'
        })
    }

    if (!message) {
        return response.status(401).json({
            error: 'No message'
        })
    }

    var axios = require('axios');
    ownerUser.tokens.forEach(
        (token) => {
            var data = JSON.stringify({
                "to": token,
                "notification": {
                    "title": `¡Alerta de #${id}!`,
                    "body": `${body.message}`
                },
                "priority": "high"
            });

            var config = {
                method: 'post',
                url: 'https://fcm.googleapis.com/fcm/send',
                headers: {
                    'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function (result) {

                })
                .catch(function (error) {
                });
        }

    )
    response.json({ 'success': true })


})

fridgesRouter.delete('/:id', (request, response) => {
    const { id } = request.params
    Fridge.findByIdAndDelete(id)
        .then(result => {
            response.json({ message: "Fridge deleted succesfully" })
        })
        .catch(err => next(err))
})

fridgesRouter.put('/:id', (request, response, next) => {
    const { id } = request.params
    const fridge = request.body

    const newFridgeInfo = {
        name: fridge.name
    }

    Fridge.findByIdAndUpdate(id, newFridgeInfo, { new: true })
        .then(result => {
            response.json(result)
        })
        .catch(next)
})

fridgesRouter.post('/', userExtractor, async (request, response, next) => {
    const { body } = request
    const { type } = body


    const { userId } = request

    const user = await User.findById(userId)
    if (!user) {
        return response.status(401).json({
            error: 'User not found'
        })
    }
    if (type === null || !(type === 0 || type === 1)) {
        return response.status(401).json({
            error: 'Invalid type or not found'
        })
    }
    const newFridge = new Fridge({
        user: user._id,
        type: type
    })

    // newFridge.save().then(saveFridge => {
    //     response.json(saveFridge)
    // }).catch(err => next(err))


    try {
        const savedFridge = await newFridge.save()

        // user.notes = user.fridges.concat(savedFridge._id)
        // await user.save()
        // console.log(user.notes)

        await User.findByIdAndUpdate(
            user._id,
            { fridges: user.fridges.concat(savedFridge._id) },
            { new: true })
        return response.json(savedFridge)
    } catch (error) {
        next(error)
    }

})

fridgesRouter.get('/temperatures/:id', userExtractor, async (request, response, next) => {
    const { body } = request
    const { type } = body

    const { id } = request.params
    const { userId } = request


    const ownerUser = await User.findById(userId);
    if (!ownerUser) {
        return response.status(401).json({
            error: 'User not found'
        })
    }

    const owned = ownerUser.fridges.find(e => e == id);

    if (!owned) {
        return response.status(401).json({
            error: 'User not authorized'
        })
    }

    const fridge = await Fridge.findById(owned);
    if (!fridge) {
        return response.status(401).json({
            error: 'Fridge not found'
        })
    }

    response.json(fridge.temperatures)

})

fridgesRouter.post('/push', fridgeExtractor, async (request, response, next) => {
    const moment = request.timestamp
    const { body } = request
    const { user, id } = request
    const { temp } = body

    const fridge = await Fridge.findById(id);
    if (!fridge) {
        return response.status(401).json({
            error: 'Fridge not found'
        })
    }
    const userId = fridge.user;
    const ownerUser = await User.findById(userId);
    if (!ownerUser) {
        return response.status(401).json({
            error: 'User not found'
        })
    }
    if (!temp) {
        return response.status(401).json({
            error: 'No temperature found'
        })
    }

    const tempData = {
        temp,
        timestamp: moment.tz("America/Caracas").format()
    }


    // log(newFridgeTemps);
    try {
        await Fridge.findByIdAndUpdate(
            fridge._id,
            {
                temperatures: [...fridge.temperatures.slice(-1440

                ), tempData,]
            },
            { new: true })
        response.json({ 'success': true })

    } catch (error) {
        next(error)
    }

})

module.exports = fridgesRouter;