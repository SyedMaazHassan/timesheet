const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const db = require('../models')
const user_passport = require('../strategies/strategyUser')


router.get('/user', (req, res) => {
    res.render('loginUser')
})
router.get('/manager', (req, res) => {
    res.render('loginManager')
})
router.post('/find', (req, res) => {
    db.Consultant.findOne({
        where: {email: 'adrian@gmail.com'},
        nest: true,
        raw: true
    }).then(result => console.log(result.id))
})

router.post('/user', user_passport.authenticate("user", {
        successRedirect: '/',
        failureRedirect: '/login/user',
        successFlash: true,
        failureFlash: true
    })
)


module.exports = router;