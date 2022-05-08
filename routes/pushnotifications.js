var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');
var admin = require("firebase-admin");

router.get("/", function(req, res){
 
 res.render('pushnotification/sendpush');
});

router.post("/send", function(req, res){
 console.log(req.body.notificationtitle);
 console.log(req.body.notificationbody);
 var Qry = "SELECT tokenkey FROM tbl_token";
 connection.query(Qry,function(err,rows){
          
    if(err){
       console.log(err);
res.send("Error ");
    }else{
     console.log(rows.length);
        if(rows.length  >0){
            var tokenarr = [];  
            var count = 0;
            rows.forEach(row => {
            tokenarr.push(row.tokenkey); 
            count ++;   
            if(count == parseInt(rows.length)){
                console.log(tokenarr);
                firebasemessages(req.body.notificationtitle,req.body.notificationbody,tokenarr);  
           
            }
            });
        }else {
            res.redirect("/pushnotification");
            req.flash('error',"NO Tokens Available");
            

        }
       }
});


function firebasemessages(title,body,registrationToken){
    console.log(registrationToken);
    var payload = {
      notification: {
        title: title,
        body: body,
        click_action:"FCM_PLUGIN_ACTIVITY", 
      },
      data: {
       //  orderid : String(lastid)
       }
    };
    var options = {
      priority: "high",
      timeToLive: 60 * 60 *24
    };
   
    admin.messaging().sendToDevice(registrationToken, payload, options)
    .then(function(response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
      console.log("Error sending message:", error);
    });

    res.redirect("/pushnotification");
    req.flash('Success',"Notifications Send");
  }


   });
   
   


module.exports = router;

