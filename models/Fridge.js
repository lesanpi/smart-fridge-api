const { Schema, model } = require('mongoose');

const fridgeSchema = new Schema({
    deviceId: String,
    name: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { collection: 'fridges' })

fridgeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Fridge = model('Fridge', fridgeSchema)
module.exports = Fridge 