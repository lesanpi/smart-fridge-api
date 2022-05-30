const bcrypt = require('bcrypt')
const fridgesRouter = require('express').Router()
const Fridge = require('../models/Fridge')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')

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

fridgesRouter.get('/:id', (request, response, next) => {
    const { id } = request.params;
    Fridge.findById(id)
        .then(fridge => {
            if (fridge) return response.json(fridge)
            response.status(404).send({ error: `Fridge with id ${id} not found` })
        })
        .catch(err => next(err))

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
    const fridge = request.body

    if (!fridge.name) {
        return response.status(400).json({
            error: 'Required "Name" field is missing'
        })
    }

    if (!fridge.deviceId) {
        return response.status(400).json({
            error: 'Required "Device Id" field is missing'
        })
    }

    const { userId } = request

    const user = await User.findById(userId)

    const newFridge = new Fridge({
        deviceId: fridge.deviceId,
        name: fridge.name,
        user: user._id
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

        response.json(savedFridge)
    } catch (error) {
        next(error)
    }

})

module.exports = fridgesRouter;