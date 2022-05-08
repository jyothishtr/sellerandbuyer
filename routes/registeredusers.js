var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');


router.get("/",middleware.isLoggedIn,  function(req,res){

                   res.render('users/registeredusers');
   
   })

   ///registeredusers/processtabledata/


   router.post("/processtabledata",middleware.isLoggedIn,function(req,res){
   
      var draw = req.body.draw;
      var start = req.body.start;
      var length =  req.body.length;
      var orderby = req.body.order[0].column;
      var type = req.body.order[0].dir;
      var order;
      var search =(req.body.search.value)?req.body.search.value:"";

    console.log(orderby);
      switch(parseInt(orderby)) {
    
        case 6:
          order = "cdate"
          break;
        default:
          order = "userid"
      }
    
    
      console.log("orderby : "+order+"\n type :"+type);
     // return;
      var dataarray = [];
      var totalrec,filteredrec;
      console.log([start,length,order,type,search]);
      var sqlqry = "CALL sp_get_registeredusers(?,?,?,?,?)";
      connection.query(sqlqry,[start,length,order,type,search],function(err,rows){       
     if(err){
        console.log(err);
        res.send("Something went Wrong"); return;
    }else{
        
      
      totalrec = rows[0][0].totrec;
      filteredrec = rows[1][0].filrec;
      var length = rows[2].length;
      console.log("filteredrec : "+filteredrec);
      var count =0;
    
      if(length>0){
        rows[2].forEach(function(e){  
      
       
            var obj ={
      
            userid:e.userid,
            username:e.username,
            address:e.address,
            email:e.email,
            phone:e.phone,
            deviceid:e.deviceid,
            date:e.created
           
          };
        dataarray.push(obj);
        count++;
        
        if(count == length){
          setdataarray();
        }
        
        });
    
      }else{
        setdataarray();
      }
    }
        
    });
      
    function setdataarray(){
      var data = {
        "draw": draw,
        "recordsTotal": totalrec,
        "recordsFiltered": filteredrec,
        "data": dataarray
      };
      
      res.send(data);
    }
      });
    
    
    
module.exports = router;

