const express = require("express");
const app = express();
const PORT = process.env.PORT || '3000'
const ejsMate = require('ejs-mate');
const path = require('path')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')

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

const date = new Date();
let mydate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getDate() + 1}`
let todayDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getDate()}`

app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user
    res.locals.returnTO = req.headers.referer
    res.locals.todayDate = todayDate
    next();
});

app.get('/',(req,res)=>{
    res.render('index')
})




app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})