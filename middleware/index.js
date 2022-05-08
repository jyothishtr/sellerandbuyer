//console.log("Hi from Middleware");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    // if(req.isAuthenticated()){
    //  // res.locals.user = req.user.username;
    //     return next();
    // }
    // req.flash("loginMessage", "You need to login !");
    // res.redirect("/");
    return next();
}
module.exports = middlewareObj;