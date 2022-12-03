const { Schema, model } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    passwordHash: String,
    name: String,
    phone: String,
    fridges: [{
        type: Schema.Types.ObjectId,
        ref: 'Fridge',
    }],
    resetToken: String,
    tokens: [String],
}, { collection: 'users' })

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject.resetToken
        delete returnedObject._id
        delete returnedObject.__v

        delete returnedObject.passwordHash
        delete returnedObject.tokens
    }
})

// userSchema.plugin(uniqueValidator)
const User = model('User', userSchema)
module.exports = User