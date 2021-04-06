module.exports.checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login/user");
    }
    next();
};

module.exports.checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
};

module.exports.isAdmin = (req,res,next)=>{
    if(req.user.role == 0 || req.user.role == 1 ){
        return next()
    }
    req.flash('error', 'You are not authorized');
    return res.redirect("/")
}
