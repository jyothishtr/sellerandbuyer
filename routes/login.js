var express = require("express");
var router  = express.Router();
var passport = require('passport');
const { check, validationResult } = require('express-validator');


router.get("/",function(req,res){
  console.log(req.user);
    if(req.user){
    res.redirect("/dashboard");
    return;   
}
   
    res.render("login",{ message: req.flash('loginMessage') });
 })
 router.post('/login', passport.authenticate('local-login', {
    //successRedirect : '/dashboard', // redirect to the secure profile section
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}),
function(req, res) {
    //console.log("hello from test");
    console.log(req.body.remember);

    if (req.body.remember) {
     console.log("Session activated");
        req.session.cookie.maxAge = 1000 * 60 * 5;
    } else {
      req.session.cookie.expires = false;
    }
       // res.send("success");
    res.redirect('/dashboard');
});


router.get('/logout', function(req, res) {
    req.logout();
    req.flash("loginMessage", "Logged you out!");
    res.redirect('/');
});
 module.exports = router;