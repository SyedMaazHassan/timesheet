const express = require("express");
const app = express();
const PORT = process.env.PORT || '3000'
const ejsMate = require('ejs-mate');
const path = require('path')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const {isAdmin, checkLoggedOut, checkLoggedIn, isConsultant, isManager} = require('./middleware')
const {v4: uuidv4} = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const nodemailer = require('nodemailer')


function sendEmail(email, link) {
    const output = `    
    <h3>A new timesheet has been approved by Manager</h3>           
    <p>Click on link below or paste the URL in the browser</p>  
    
    <ul>
        <li>
            <a href="${link}">${link}</a>
        </li>
    </ul> 
      
    
  `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'musabjaved10@gmail.com', // use your own email in env file or here
            pass: process.env.sender_email_pass || 'password'  // use your pass in env file or here
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"noreply" <musabjaved10@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: 'New timesheet', // Subject line
        text: 'Timesheet', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {msg: 'Email has been sent'});
    });
}


//sequelize
const db = require("./models")
db.sequelize.sync({alter: false}).then(() => {
    console.log('Sequelize is working')
})


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())


//use cookie parser
app.use(cookieParser('secret'));

//config session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 86400000 1 day
    }
}));

// //Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

const date = new Date();
let mydate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getDate() + 1}`
let todayDate = `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}`

app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user
    res.locals.returnTO = req.headers.referer
    res.locals.todayDate = todayDate
    next();
});
let weekCreatable = true


const userRoutes = require('./routes/user')
app.use('/login', userRoutes)

app.get('/', checkLoggedIn, async (req, res) => {
    res.locals.currentUser = req.user
    await db.Week.findOne({
        attributes: ['createdAt'],
        where: {ConsultantId: req.user.id},
        order: [['id', 'DESC']],
        nest: true,
        raw: true
    }).then(result => {
        console.log(result)
        if (result) {
            weekCreatable = Number(result.createdAt.toLocaleDateString().split('/')[0]) + 7 > date.getDay()
            res.locals.weekCreatable = false
        } else {
            res.locals.weekCreatable = true
        }
    })
    await db.Notification.findAll({
        where: {ConsultantId: req.user.id},
        include: [db.Consultant],
        nest: true,
        raw: true
    }).then(notifications => {

        res.locals.notifications = notifications
    })
    await db.Week.findAll({
        where: {
            ConsultantId: req.user.id
        },
        nest: true,
        raw: true
    }).then(result => {
        res.locals.day = new Date().getDay()
        res.locals.allWeeks = result
    })
    // console.log(req.user)
    await res.render('index')
})
app.get('/indexmanager', checkLoggedIn, async (req, res) => {
    res.locals.currentUser = req.user
    await db.Notification.findAll({
        where: {LinemanagerId: req.user.id},
        include: [db.Consultant],
        nest: true,
        raw: true
    }).then(notifications => {
        res.locals.notifications = notifications
        console.log(notifications)
    })
    await db.Consultant.findAll({
        where: {LinemanagerId: req.user.id},
        attributes: ['id'],
        nest: true,
        raw: true
    }).then(ids => {
        const consultantIds = []
        for (let id of ids) {
            consultantIds.push(id.id)
        }
        db.Consultant.findAll({
            where: {id: consultantIds},
            raw: true,
            nest: true
        }).then(
            db.Week.findAll({
                where: {ConsultantId: consultantIds, state: [-1, 0, 1]},
                include: [db.Consultant],
                nest: true,
                raw: true
            }).then(weeks => {

                res.render('indexManager', {weeks})
            }))
    })

})
app.post('/newweek', async (req, res) => {
    await db.Week.create({
        ConsultantId: req.user.id,
        link_code: uuidv4()
    })
    await db.Week.findOne({
        where: {ConsultantId: req.user.id},
        order: [['id', 'DESC']],
        nest: true,
        raw: true
    }).then(week => {
        if (week) {
            console.log(week)
            return res.redirect(`/week/${week.id}`)
        }
    })
})
app.get('/view/:link_code', (req, res) => {
    res.locals.currentUser = req.user
    db.Week.findAll({
        where: {link_code: req.params.link_code},
        include: [db.Linemanager, db.Consultant],
        raw: true,
        nest: true,
    }).then(week => {
        if (week && week.length > 0) {
            db.Timeschedule.findAll({
                where: {WeekId: week[0].id},
                raw: true,
                nest: true
            }).then(result => {
                if (result && result.length > 0) {
                    // return res.render('newWeek', {week,result:null})
                    console.log(week, '\nnow result', result)
                    return res.render('viewWeek', {week, result: JSON.stringify(result[0].data)})
                } else {
                    result = null
                    return res.render('viewWeek', {week, result})
                }
            })
        } else {
            req.flash('error', 'this week does not exists')
            return res.redirect('/')
        }
    })

})
app.post('/reject/:link_code', (req, res) => {
    res.locals.currentUser = req.user
    const content = req.body.content
    db.Week.update({state: -1, LinemanagerId: req.user.id}, {
        where: {link_code: req.params.link_code},
        raw: true,
        nest: true
    }).then(result => {
        db.Week.findAll({where: {link_code: req.params.link_code}, raw: true, nest: true}).then(week => {
            db.Feedback.create({
                content: content,
                WeekId: week[0].id,
                raw: true,
                nest: true
            }).then(() => {
                req.flash('success', 'Feedback has been sent')
                res.redirect('/indexmanager')
            })
        })
    })
})

app.post('/accept', (req, res) => {
    res.locals.currentUser = req.user;
    const link_code = req.body.link_code;
    db.Week.update({state: 2, LinemanagerId: req.user.id}, {
        where: {link_code: link_code}
    }).then(() => {
        db.Week.findAll({where: {link_code: link_code}, raw: true, nest: true}).then(week => {
            db.Feedback.destroy({
                where: {WeekId: week[0].id}
            }).then(async () => {
                await sendEmail('javed4130257@cloud.neduet.edu.pk', `http://localhost:3000/view/${link_code}`)
                req.flash('success', 'week accepted')
                res.redirect('/indexmanager')
            })
        })
    })

})

app.post('/submit',(req,res)=>{
    res.locals.currentUser = req.user
    const week_id = req.body.week_id
    db.Feedback.destroy({
        where:{WeekId: week_id}
    }).then(()=>{
        db.Week.update({state:1},{
            where:{id: week_id}
        }).then(()=>{
            req.flash('success','Week has been submitted for review')
            res.redirect(req.headers.referer)
        })
    })

})
app.get('/week/:id', checkLoggedIn, isConsultant, async (req, res) => {
    res.locals.currentUser = req.user
    res.locals.weekCreatable = false
    const id = req.params.id
    await db.Notification.findAll({
        where: {ConsultantId: req.user.id},
        include: [db.Consultant],
        nest: true,
        raw: true
    }).then(notifications => {

        res.locals.notifications = notifications
    })
    await db.Week.findAll({
        where: {id: id},
        nest: true,
        raw: true
    }).then(week => {
        if (week && week.length > 0) {
            console.log(week)
            db.Timeschedule.findAll({
                where: {WeekId: id},
                nest: true,
                raw: true
            }).then(result => {
                if (result && result.length > 0) {
                    // return res.render('newWeek', {week,result:null})
                    db.Feedback.findAll({
                        where: {WeekId: id},
                        raw: true,
                        nest: true
                    }).then(feedback => {
                        if (feedback.length > 0) {
                            return res.render('newWeek', {feedback, week, result: JSON.stringify(result[0].data)})
                        } else {
                            return res.render('newWeek', {feedback: null, week, result: JSON.stringify(result[0].data)})
                        }

                    })


                } else {
                    result = null
                    return res.render('newWeek', {feedback: null, week, result})
                }
            })
        } else {
            req.flash('error', `This week doesn't exist`)
            return res.redirect('/')
        }
    })

})
app.post('/savedata', (req, res) => {
    const {week_id, schedule} = req.body
    db.Timeschedule.findAll({
        where: {
            WeekId: parseInt(week_id),

        },

    }).then(week => {
        if (week && week.length > 0) {
            db.Timeschedule.update({data: schedule}, {
                where: {
                    WeekId: parseInt(week_id)
                }
            });
            return res.status(200).json({msg: "Your week schedule has been updated"})
        } else {
            db.Timeschedule.create({
                data: schedule,
                WeekId: week_id
            })
            return res.status(200).json({msg: "Your week schedule has been created"})

        }
    })
})

app.get('/check/:link_code', (req, res, next) => {
    db.Week.findAll({
        where: {link_code: req.params.link_code},
        include: [db.Linemanager, db.Consultant],
        raw: true,
        nest: true,
    }).then(week => {
        if (week && week.length > 0) {
            db.Timeschedule.findAll({
                where: {WeekId: week[0].id},
                raw: true,
                nest: true
            }).then(result => {
                if (result && result.length > 0) {
                    // return res.render('newWeek', {week,result:null})
                    console.log(week, '\nnow result', result)
                    return res.render('viewWeek', {week, result: JSON.stringify(result[0].data)})
                } else {
                    result = null
                    return res.render('viewWeek', {week, result})
                }
            })
        } else {
            req.flash('error', 'this week does not exists')
            return res.redirect('/')
        }
    })

})
app.get('/check2/:link_code', checkLoggedIn, isManager, (req, res) => {
    res.locals.weekCreatable = true
    res.locals.notifications = ['hello']
    // db.Consultant.findAll({
    //     where: {LinemanagerId: req.user.id},
    //     attributes: ['id'],
    //     nest: true,
    //     raw: true
    // }).then(ids => {
    //     const consultantIds = []
    //     for (let id of ids) {
    //         consultantIds.push(id.id)
    //     }
    //     console.log(consultantIds)
    //     db.Week.findAll({
    //         where: {ConsultantId: consultantIds, state: [-1, 0, 1]},
    //         include: [db.Consultant],
    //         nest: true,
    //         raw: true
    //     }).then(w => res.send(w[0].Consultant))
    //
    // })
    db.Week.findAll({
        where: {link_code: req.params.link_code},
        raw: true,
        nest: true
    }).then(result => console.log(result))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})