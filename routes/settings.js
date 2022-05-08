var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var bcrypt = require('bcrypt-nodejs');

var connection  = require('../lib/db');


router.get("/",middleware.isLoggedIn,function(req,res){

    connection.query("SELECT minordervalue from settings",function(err, rows) {
    //console.log(rows[0].minordervalue);
     
    // return done(null, newUserMysql);
       res.render('settings/settingsview',{minordervalue :parseFloat(rows[0].minordervalue).toFixed(3)})
    });

    
});




router.post("/createuser",middleware.isLoggedIn,[
    check('username').not().isEmpty().withMessage('Username Cannot be empty'),
    check('password','Password cannot be empty').not().isEmpty()
],function(req,res){
   console.log("Hello world");
   var username = req.body.username;
   var password = req.body.password;
   var confirmpassword = req.body.confirmpassword;
   if(password !=confirmpassword ){
    req.flash("error","Password Doesn't Match");  
    res.redirect("/settings");
    return false;
   }
   var errors = validationResult(req);
    var user =res.locals.user;
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);

      res.render('settings/settingsview',{user:user,error:errorarry});
      return false;
    }
    console.log("res.locals.user : "+req.user.username);
    connection.query("SELECT ifnull(isadmin,0) as isadmin from users where username = ?",[req.user.username],function(err,row){
if(err) return err;
console.log(JSON.stringify(row));
if(parseInt(row[0].isadmin) == 1){

    connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
        if (err)
            return err;

            console.log(JSON.stringify(rows));
        if (rows.length) {
            //return done(null, false, req.flash('error', 'That username is already taken.'));
            req.flash("error","User name already exist");
            res.redirect("/settings");
            return false;
        } else {
            // if there is no user with that username
            // create the user
            var newUserMysql = {
                username: username,
                password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
            };

            var insertQuery = "INSERT INTO users ( username, password,createdby,cdate ) values (?,?,?,NOW())";
            //connection.connect();
            // connection.connect(function(error){
            //     if(!!error){
            //       console.log(error);
            //     }else{
            //       console.log('Database Connected!!');
            //     }
            //   }); 
            connection.query(insertQuery,[newUserMysql.username, newUserMysql.password,req.user.username],function(err, rows) {
                newUserMysql.id = rows.insertId;
                req.flash("success","User Created");
                res.redirect("/settings");
               // return done(null, newUserMysql);
            });
            //connection.end();
        }
    });

}else{
    req.flash("error","You are not allowed to Create New User");
    res.redirect("/settings");

}
    });
    //return;
   
//    if(password != confirmpassword ){
//         req.flash('error',"Password does not match");
//         res.redirect("/settings");
       
//        // req.flash("error","Password does not match");
//     }
   
    // res.render('settings/settingsview')
    });


    

    
router.post("/updateusername",middleware.isLoggedIn,[
    check('newusername').not().isEmpty().withMessage('Username Cannot be empty') 
],function(req,res){
   //console.log("Hello world");
   var newusername = req.body.newusername;
   var errors = validationResult(req);
    var user =res.locals.user;
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);

      res.render('settings/settingsview',{user:user,error:errorarry});
      return false;
    }
    console.log("res.locals.user : "+req.user.username);
    connection.query("Update users set username = ? where username = ?",[newusername,req.user.username],function(err,row){
if(err) return err;
console.log(JSON.stringify(row));
req.flash("success","Username Updated");
res.redirect("/settings");
    });
  
    });


    router.post("/updatepassword",middleware.isLoggedIn,[
        check('currpass').not().isEmpty().withMessage('Username Cannot be empty'),
        check('newpass').not().isEmpty().withMessage('Username Cannot be empty'),
        check('confirmnewpass').not().isEmpty().withMessage('Username Cannot be empty')
    ],function(req,res){
      // console.log("Hello world");
       var username = req.user.username;
       var currpass =  req.body.currpass;
       var newpass = req.body.newpass;
       var confirmnewpass = req.body.confirmnewpass;
       if(newpass !=confirmnewpass ){
        req.flash("error","Password Doesn't Match");  
        res.redirect("/settings");
        return false;
       }
       var errors = validationResult(req);
        var user =res.locals.user;
        var errors1 = errors.errors;
        var length = errors1.length;  
        var errorarry = [];
        if(length>0){  
         for(i= 0 ;i<length;i++){
             errorarry.push(errors1[i].msg);
            }
          console.log(errorarry);
    
          res.render('settings/settingsview',{user:user,error:errorarry});
          return false;
        }
        console.log("res.locals.user : "+req.user.username);
        connection.query("SELECT * FROM users WHERE username = ?",[username],function(err,row){
    if(err) return err;
    console.log(JSON.stringify(row));
    if(row.length){
    

        if (bcrypt.compareSync(currpass, row[0].password)){
            var password = bcrypt.hashSync(newpass, null, null) ; 
     
            var updateQuery = "UPDATE users set password = ? where username = ?";
   
            connection.query(updateQuery,[password,username],function(err, rows) {
                req.flash("success","Password Updated");
                res.redirect("/settings");
             
            });
           }else{

            req.flash("error","Incorret Password Try Again");
            res.redirect("/settings");

           }
     
        }else{

            req.flash("error","Incorret Password Try Again");
            res.redirect("/settings");
        }
      
    
            
        
   
        });
 
    
        });



        

    
router.post("/minordervalue",middleware.isLoggedIn,[
    check('minordervalue').not().isEmpty().withMessage('Value Cannot be empty') 
],function(req,res){
   //console.log("Hello world");
   var minordervalue = parseFloat(req.body.minordervalue).toFixed(3);
   var errors = validationResult(req);
    var user =res.locals.user;
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);

      connection.query("SELECT minordervalue from settings",function(err, rows) {
        //console.log(rows[0].minordervalue);
         
        // return done(null, newUserMysql);
           res.render('settings/settingsview',{user:user,error:errorarry,minordervalue :parseFloat(rows[0].minordervalue).toFixed(3)})
           return false;
        });

     
     
    }else{
 
        connection.query("Update settings set minordervalue = ?",[minordervalue],function(err,row){
            if(err) return err;
            console.log(JSON.stringify(row));
            req.flash("success","Minimum Order Value Updated");
            res.redirect("/settings");
                });
    }
   
  
    });

module.exports = router;

