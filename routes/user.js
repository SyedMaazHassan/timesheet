const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const db = require('../models')
const passport = require('../strategies/strategyUser')
const {isAdmin, checkLoggedOut, checkLoggedIn} = require('../middleware')


router.get('/user', (req, res) => {
    res.render('loginUser')
})
router.get('/manager', (req, res) => {
    res.render('loginManager')
})
router.get('/admin', (req, res) => {
    res.render('loginAdmin')
})
router.post('/find', (req, res) => {
    db.Week.findOne({
        attributes:['createdAt'],
        where:{ConsultantId: null},
        order:[['id','DESC']],
        nest: true,
        raw: true

    }).then(result => console.log(result.createdAt ))
})
router.post('/create', (req, res) => {
    db.Week.create(
        {
            month: 4,
            state: 1,
            link_code:"www.facebook.com",
            creation_date: new Date().getDate()
        }
    ).then(result => console.log(result))
})

router.post('/user', passport.authenticate("user", {
        successRedirect: '/',
        failureRedirect: '/login/user',
        successFlash: true,
        failureFlash: true
    })
)
router.post('/manager', passport.authenticate("manager", {
        successRedirect: '/indexmanager',
        failureRedirect: '/login/manager',
        successFlash: true,
        failureFlash: true
    })
)
router.post('/admin', passport.authenticate("admin", {
        successRedirect: '/indexAdmin',
        failureRedirect: '/login/admin',
        successFlash: true,
        failureFlash: true
    })
)
router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        return res.redirect("/login/user");
    });
})

router.get("/changepassword", checkLoggedIn, (req, res) => {
    res.locals.currentUser = req.user
    res.render("changePass")
})
router.post("/changepassword", checkLoggedIn, async (req, res) => {
    res.locals.currentUser = req.user
    try {
        const {currentPassword, newPassword} = req.body;
        let match = await comparePassword(currentPassword, req.user.password)
        if (match === true) {
            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(newPassword, salt)
            if (req.user.role === 1) {
                await db.Consultant.update({password: hashedPassword}, {
                    where: {
                        email: 'admin@gmail.com'
                    }
                }).then(() => {
                    req.flash('success', 'Password has been changed successfully')
                    return res.redirect('/')
                });
            }
            if (req.user.role === 2) {
                await db.Linemanager.update({password: hashedPassword}, {
                    where: {
                        email: req.user.email
                    }
                }).then(() => {
                    req.flash('success', 'Password has been changed successfully')
                    return res.redirect('/')
                });
            }
            if (req.user.role === 3) {
                await db.Consultant.update({password: hashedPassword}, {
                    where: {
                        email: req.user.email
                    }
                }).then(() => {
                    req.flash('success', 'Password has been changed successfully')
                    return res.redirect('/')
                });
            }
        } else {
            req.flash('error', 'Incorrect current password')
            return res.redirect('/login/changepassword')
        }

    } catch (err) {
        req.flash("error", err);
        console.log('error from catch', err)
        return res.redirect("/changepassword");
    }


})
let comparePassword = (password, hashedPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            await bcrypt.compare(password, hashedPassword).then((isMatch) => {
                if (isMatch) {
                    resolve(true);
                } else {
                    resolve(`Incorrect Password`);
                }
            });
        } catch (e) {

            reject(e);
        }
    });
};


module.exports = router;