const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../models')
// const flash = require('connect-flash');


passport.use('user',new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        // console.log(email, password)
        try {
            await db.Consultant.findOne({where:{email: email}, raw:true}).then(async (user) => {

                if (!user) {
                    return done(null, false, req.flash("error", `Email ${email} doesn't exist`));
                }
                if (user) {
                    // console.log('heyyy its a user', user)
                    let match = await comparePassword(password, user);

                    if (match === true) {
                        // console.log('matching done here is the user >', user)
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






let findUserById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            db.Consultant.findOne({where})

            db.query(' SELECT * FROM users WHERE user_id = ?  ', id, function(err, rows) {
                    if (err) {
                        reject(err)
                    }
                    let user = rows[0];
                    // console.log('printing user from FINDUSERBYID')
                    // console.log(user)
                    resolve(user);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

let comparePassword = (password, userObject) => {
    console.log(password, userObject.password)
    return new Promise(async (resolve, reject) => {
        try {
            await bcrypt.compare(password, userObject.password).then((isMatch) => {
                if (isMatch) {

                    console.log('matched')
                    resolve(true);
                } else {
                    console.log('Not matched')
                    console.log(bcrypt.hashSync('password',10))
                    resolve(`Incorrect Password`);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

passport.serializeUser((user, done) => {
    // console.log(`Inside Serializing user:>`)
    // console.log(user)
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // console.log(`Inside DESerializing user:>`)
    db.Consultant.findOne({where:{id:id}, raw:true}).then((user) => {
        // console.log('printing userr****************')
        // console.log(user)
        return done(null, user);
    }).catch(error => {
        return done(error, null)
    });
})

module.exports = passport


