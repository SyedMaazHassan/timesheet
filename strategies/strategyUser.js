const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../models')


passport.use('user', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        // console.log(email, password)
        try {
            await db.Consultant.findOne({where: {email: email}, raw: true}).then(async (user) => {

                if (!user) {
                    return done(null, false, req.flash("error", `Email ${email} doesn't exist`));
                }
                if (user) {
                    // console.log('heyyy its a user', user)
                    let match = await comparePassword(password, user);
                    if (match === true) {
                        return done(null, user, null)
                    } else {
                        return done(null, false, req.flash("error", match))
                    }
                }
            });
        } catch (err) {
            console.log(err);
            return done(null, false);
        }
    }));
passport.use('manager', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        // console.log(email, password)
        try {
            await db.Linemanager.findOne({where: {email: email}, raw: true}).then(async (user) => {

                if (!user) {
                    return done(null, false, req.flash("error", `Email ${email} doesn't exist`));
                }
                if (user) {
                    // console.log('heyyy its a user', user)
                    let match = await comparePassword(password, user);

                    if (match === true) {
                        console.log('matching done here is the user >', user)
                        return done(null, user, null)
                    } else {
                        return done(null, false, req.flash("error", match))
                    }
                }
            });
        } catch (err) {
            console.log(err);
            return done(null, false);
        }
    }));

passport.use('admin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        // console.log(email, password)
        try {
            await db.Admin.findOne({where: {email: email}, raw: true}).then(async (user) => {

                if (!user) {
                    return done(null, false, req.flash("error", `Email ${email} doesn't exist`));
                }
                if (user) {
                    let match = await comparePassword(password, user);

                    if (match === true) {
                        return done(null, user, null)
                    } else {
                        return done(null, false, req.flash("error", match))
                    }
                }
            });
        } catch (err) {
            console.log(err);
            return done(null, false);
        }
    }));

let comparePassword = (password, userObject) => {
    return new Promise(async (resolve, reject) => {
        try {
            await bcrypt.compare(password, userObject.password).then((isMatch) => {
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

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    if (user.role === 2){
        db.Linemanager.findOne({where: {id: user.id}, raw: true}).then((user) => {
            return done(null, user)}).catch(error => {
            return done(error, null)
        });
    }else if(user.role === 3){
        db.Consultant.findOne({where: {id: user.id}, raw: true}).then((user) => {
            return done(null, user)}).catch(error => {
            return done(error, null)
        });

    }else if(user.role === 1){
        db.Admin.findOne({where: {id: user.id}, raw: true}).then((user) => {
            // console.log('printing userr****************')
            // console.log(user)
            return done(null, user)}).catch(error => {
            return done(error, null)
        });
    }



})

module.exports = passport


