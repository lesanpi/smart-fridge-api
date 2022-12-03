require('dotenv').config()
require('./database')

const time = require('express-timestamp')
const express = require('express')
const morgan = require('morgan');
const app = express();
const notFound = require('./middlewares/notFound')
const handleError = require('./middlewares/handleErrors')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const userRouter = require('./controllers/user')
const fridgesRouter = require('./controllers/fridges')
const passwordRouter = require('./controllers/password')

// const friendRequestRouter = require('./controllers/friendRequest')
// const friendAcceptRouter = require('./controllers/friendAccept')

// Middlewares
app.use(time.init)
app.use(morgan('dev'))
app.use(express.json())

// Routes
// app.use('/api/friends/request', friendRequestRouter)
// app.use('/api/friends/accept', friendAcceptRouter)
app.use('/api/user', userRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/password', passwordRouter)
app.use('/api/fridges', fridgesRouter)
app.use(notFound)
app.use(handleError)

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }