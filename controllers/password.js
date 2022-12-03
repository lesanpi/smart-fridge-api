const bcrypt = require('bcrypt');
const passwordRouter = require('express').Router()
const User = require('../models/User')
const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY)

passwordRouter.post('/reset', async (request, response) => {
    const { body } = request
    const { email } = body
    console.log('body', body)
    if (!email) {
        return response.status(400).json({
            error: 'Required "Email" field is missing'
        })
    }

    console.log('email', email)
    const user = await User.findOne({
        email: email.toLowerCase(),
      });
    if (!user) {
        return response.status(400).json({
            error: 'El correo electrónico que has ingresado no se encuentra registrado'
        })
    }  


    const sixDigitNumber = Math.floor(100000 + Math.random() * 900000);
    user.resetToken = String(sixDigitNumber);

    await user.save();
    const emailRequest = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
    "Messages":[
        {
        "From": {
            "Email": "lsanchezp99@gmail.com",
            "Name": "ZonaRefri"
        },
        "To": [
            {
            "Email": `${user?.email}`,
            "Name": `${user?.name}`
            }
        ],
        "Subject": "[ZONAREFRI] Reiniciar tu contraseña.",
        "TextPart": "Reinicio de contraseña",
        "HTMLPart": `<h3>Reiniciar contraseña en ZonaRefri</h3><br />Tu código para reiniciar tu contraseña es: ${user?.resetToken}`,
        "CustomID": "AppGettingStartedTest"
        }
    ]
    })
    emailRequest
    .then((result) => {
        // console.log('mail sent', result.body)
        return response.json({ success: true });
    })
    .catch((err) => {
        // console.log(err.statusCode)
        return response.json({ success: false });
    })
})

passwordRouter.post('/validate', async (request, response) => {

    const { body } = request
    const { email, token } = body
    if (!token){
        return response.json({ success: false });

    }
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: token,
    });

    
    if (user) {
        console.log(user.email)
        console.log(user.resetToken)
        return response.json({ success: true });
    }
    return response.json({ success: false });
})

passwordRouter.post('/change', async (request, response) => {

    const { body } = request
    const { password, token } = body
    if (!token){
        return response.json({ success: false,
            message: 'Token not found', 
        });

    }
    if(!password){
        return response.json({ 
            success: false, 
            message: 'Password not found', 
        });
    }
    try {
        const user = await User.findOne({
          resetToken: token,

        });
        if (!user) {
            return response.json({ 
                success: false,
                message: 'User not found', 
            });
        }

        console.log('user found', user.email, user.name);
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)
        user.passwordHash = passwordHash;
        user.resetToken = undefined;
        await user.save();

        return response.json({ success: true });
      } catch (err) {
        return response.json({ 
            success: false,
            message: err.message, 
        });
      }
})

module.exports = passwordRouter;
