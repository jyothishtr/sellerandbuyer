var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');

//INDEX ROUTE
router.get("/", function(req, res){
      var qry = "CALL sp_get_dashboarddata()";
    connection.query(qry,function(err,rows){
        if(err){
           console.log(err);
           req.flash('error',"Cannot load data");
           res.json(err);
        }else{
            //console.log(rows[0][0].delayedorder);
            //req.flash('success',"Supplier created successfully");
           // res.json(rows);            
            res.render("dashboard/dashboard",{rows:rows});
           }
   });


 
  
});

//INDEX ROUTE
router.get("/getgraphdata", function(req, res){
let date = new Date();
var year = date.getFullYear();
console.log(year);

   var qry = "SELECT MONTHNAME(created) as Month, COUNT(*) AS newCustomers FROM usermaster WHERE created >= CURDATE() - INTERVAL 1 YEAR GROUP BY MONTH(created)";
 connection.query(qry,function(err,rows){
     if(err){
        console.log(err);
        req.flash('error',"Cannot load data");
        res.json(err);
     }else{
         //console.log(rows[0][0].delayedorder);
         //req.flash('success',"Supplier created successfully");
        // res.json(rows);            
         //res.send(rows);
         var monthArr = [];
         var newCustArr = [];
       rows.forEach(item => {
         monthArr.push(item.Month);
          newCustArr.push(item.newCustomers);
       });

       var data = {month : monthArr,custCount :newCustArr};
       res.send(data);
      
      }
});




});





//INDEX ROUTE
router.get("/getgraphdata2", function(req, res){
   let date = new Date();
   var year = date.getFullYear();
   console.log(year);
   
      var qry = "SELECT CONCAT(MONTHNAME(cdate),' - ',DAY(cdate)) AS orderdate, COUNT(DISTINCT orderid) AS neworders FROM orderheader WHERE cdate >= CURDATE() - INTERVAL 15 DAY GROUP BY DAY(cdate) ORDER BY cdate ;";
    connection.query(qry,function(err,rows){
        if(err){
           console.log(err);
           req.flash('error',"Cannot load data");
           res.json(err);
        }else{
            //console.log(rows[0][0].delayedorder);
            //req.flash('success',"Supplier created successfully");
           // res.json(rows);            
            //res.send(rows);
            var orderdate = [];
            var neworders = [];
          rows.forEach(item => {
            orderdate.push(item.orderdate);
            neworders.push(item.neworders);
          });
   
          var data = {orderdate : orderdate,neworders :neworders};
          res.send(data);
         
         }
   });
   
   
   
   
   });

   router.get("/getgraphdatasalesChart", function(req, res){
      let date = new Date();
      var year = date.getFullYear();
      console.log("New Year");
      
         var qry = "SELECT MONTHNAME(cdate) AS month, SUM(gradtot) AS salesValue FROM orderheader WHERE cdate >= CURDATE() - INTERVAL 1 YEAR  GROUP BY MONTH(cdate)";
       connection.query(qry,function(err,rows){
           if(err){
              console.log(err);
              req.flash('error',"Cannot load data");
              res.json(err);
           }else{
               //console.log(rows[0][0].delayedorder);
               //req.flash('success',"Supplier created successfully");
              // res.json(rows);            
               //res.send(rows);
               var monthArr = [];
               var salesValue = [];
             rows.forEach(item => {
               monthArr.push(item.month);
               salesValue.push(item.salesValue);
             });
      
             var data = {month : monthArr,salesValue :salesValue};
             res.send(data);
            
            }
      });
      
      
      
      
      });
module.exports = router;

