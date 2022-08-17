const { Schema, model } = require('mongoose');

const fridgeSchema = new Schema({
    type: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    temperatures: [
        {
            temp: {
                type: Number,
                required: true,
            },
            timestamp: {

            }
        }
    ]
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