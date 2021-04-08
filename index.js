const express = require("express");
const app = express();
const PORT = process.env.PORT || '3000'
const ejsMate = require('ejs-mate');
const path = require('path')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const {isAdmin, checkLoggedOut, checkLoggedIn} = require('./middleware')

//sequelize
const db = require("./models")
db.sequelize.sync().then(()=>{
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



const userRoutes= require('./routes/user')
app.use('/login',userRoutes)

app.get('/',checkLoggedIn,async (req,res)=>{
    res.locals.currentUser = req.user
    await db.Week.findOne({
        attributes:['createdAt'],
        where:{ConsultantId: null},
        order:[['id','DESC']],
        nest: true,
        raw: true
    }).then(result => {
        if(result.length > 0){
            weekCreatable = Number(result.createdAt.toLocaleDateString().split('/')[0])+7 < date.getDay()
            res.locals.weekCreatable = weekCreatable
        }
        else{
            res.locals.weekCreatable = true
        }
    })
    await db.Notification.findAll({
        where:{ConsultantId: req.user.id},
        include:[db.Consultant],
        nest:true,
        raw:true
    }).then(notifications=>{

        res.locals.notifications = notifications
    })
    await db.Week.findAll({
        nest: true,
        raw: true
    }).then(result => {
        res.locals.allWeeks = result

    })
    // console.log(req.user)
    await res.render('index')
})
app.get('/indexmanager',checkLoggedIn,async (req,res)=>{
    res.locals.currentUser = req.user
    await db.Notification.findAll({
        where:{ConsultantId: req.user.id},
        include:[db.Consultant],
        nest:true,
        raw:true
    }).then(notifications=>{
        res.locals.notifications = notifications
    })
    await res.render('indexManager')
})

app.get('/check',(req,res,next)=>{
    db.Week.findAll({
        attributes:['createdAt'],
        raw: true,
        nest: true
    }).then(result=>{

    })
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})