var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');
const { AsyncParser } = require('json2csv');
var admin = require("firebase-admin");


router.get("/pending", function(req,res){
  res.render("orders/orders_review",{type:"pending"});
});
router.get("/confirmed", function(req,res){
  res.render("orders/orders_review",{type:"confirmed"});
});
router.get("/delivered", function(req,res){
  res.render("orders/orders_review",{type:"delivered"});
});
router.get("/rejected", function(req,res){
  res.render("orders/orders_review",{type:"rejected"});
});
router.get("/delayed", function(req,res){
  res.render("orders/orders_review",{type:"delayed"});
});


router.post("/exportData", async function(req, res, next) {
  console.log("flag 1");  // For flagging
//SELECT oh.orderid AS order_id,CONVERT(DATE(oh.cdate),CHAR) AS order_date,DATE_FORMAT(oh.ctime,'%k:%i') AS order_time,um.username AS customer,SUBSTRING(osd.custlocation,1,60) AS `area`,oh.statusflag AS `status`,osd.custphone as phone,(SELECT COUNT(orderid) AS cnt FROM orderheader WHERE STR_TO_DATE(CONCAT(DATE_FORMAT(cdate,'%Y-%m-%d'), ' ', ctime), '%Y-%m-%d %H:%i:%s') <= STR_TO_DATE(CONCAT(DATE_FORMAT(oh.cdate,'%Y-%m-%d'), ' ', oh.ctime), '%Y-%m-%d %H:%i:%s') AND userphone =oh.`userphone` AND oh.`statusflag` IN (0,1,2,3,4)) AS ordercnt,oh.paymentmode as paymentmode FROM orderheader oh INNER JOIN ordershippingdetail osd ON osd.orderid = oh.orderid INNER JOIN `usermaster` um ON um.phone = osd.custphone WHERE oh.statusflag = ",var_status," ORDER BY ",var_orderby,""
  const fields = ['order_id', 'order_date', 'order_time','customer','area','status','phone','paymentmode'];
  const opts = { fields };
  const transformOpts = { highWaterMark: 8192 };

  const asyncParser = new AsyncParser(opts, transformOpts);

  console.log("flag 2");  // For flagging
  let csv = '';
  asyncParser.processor
    .on('data', chunk => (csv += chunk.toString()))
    .on('end', () => res.send(csv))
    .on('error', err => console.error(err));
    
    let sqlqry= "CALL sp_get_orders_export(0,'','')"
    connection.query(sqlqry,function(err,rows){       
      if(err){
         console.log(err); 
     }else{
          console.log(rows[0]);
          asyncParser.input.push(JSON.stringify(rows[0]));
          asyncParser.input.push(null); 

         }
    });
  // asyncParser.input.push('{ "field1": 1, "field2": 2, "field3": 3 }');
  // asyncParser.input.push(null); // Sending `null` to a stream signal that no more data is expected and ends it.
});


router.post("/test/processtabledata/:id", function(req,res){
  console.log("Helllo ");

  console.log(req.body)
 // return;
  console.log(req.params.id);
  var status;
  var draw = req.body.draw;
  var start = req.body.start;
  var length =  req.body.length;
  var orderby = req.body.order[0].column;
  var type = req.body.order[0].dir;
  var order;
  var search =(req.body.search.value)?req.body.search.value:"";
  //console.log(search);
  switch(req.params.id) {
      case 'pending':
     console.log("0");
      status = 0;
      break;
      case 'confirmed':
        console.log("1");
      status = 1;
      break;
      case 'delayed':
        console.log("2");
      status = 2;
      break;  
      case 'delivered':
        console.log("3");
      status = 3;
      break;  
      case 'rejected':
        console.log("4");
      status = 4;
      break;
  }

  switch(parseInt(orderby)) {
    case 0:
      order = "oh.orderid"
      break;
    case 1:
      order = "oh.cdate"
      break;
      case 2:
        order = "oh.ctime"
        break;
        case 3:
          order = "um.username"
          break;
    default:
      order = "oh.orderid"
  }


  console.log("orderby : "+order+"\n type :"+type);
  var dataarray = [];
  var totalrec,filteredrec;
  console.log([start,length,order,type,search,status]);
  var sqlqry = "CALL sp_get_orders(?,?,?,?,?,?)";
  connection.query(sqlqry,[start,length,order,type,search,status],function(err,rows){       
 if(err){
    console.log(err);
    res.send("Something went Wrong"); return;
}else{
    
  
  totalrec = rows[0][0].totrec;
  filteredrec = rows[1][0].filrec;
  var length = rows[2].length;
  console.log("filteredrec : "+filteredrec);
  var count =0;
console.log(JSON.stringify(rows));
  if(length>0){
    rows[2].forEach(function(e){  
        console.log(e.ordercnt);
      var status,paymentmode;
      if(parseInt(e.status) == 0){status  ="Pending"}else if(parseInt(e.status)  == 1){status  ="Confirmed"}else if(parseInt(e.status) == 2){status  ="Delayed"}else if(parseInt(e.status)==3){status  ="Delivered"}else if(parseInt(e.status) ==4){status  ="Rejected"};
      if(parseInt(e.paymentmode) == 0){paymentmode  ="C.O.D"}else if(parseInt(e.paymentmode)  == 1){paymentmode  ="Coupon"}else if(parseInt(e.paymentmode) == 2){paymentmode  ="Debit Card"}else if(parseInt(e.paymentmode)==3){paymentmode  ="Credit Card"}else if(parseInt(e.paymentmode) ==4){paymentmode  ="POS"}
        
      console.log(e.ordercnt)
      var obj ={
        checkbox:e.checkbox,
        order_id:e.order_id,
        order_date:e.order_date,
        order_time:e.order_time,
        customer:e.customer,
        area:e.area,
        status:status,
       phone:e.phone,
       paymentmode: paymentmode,
       ordercount:e.ordercnt,
        action:'<a href="/orders/'+e.order_id+'"><i class="fas fa-search"></i> </a>'
        
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




router.get("/:id",  function(req,res){
    var id =  req.params.id;
    console.log("id = "+id);
    var sqlqry = "CALL sp_order_data("+id+")";
      connection.query(sqlqry,function(err,rows){       
     if(err){
        console.log(err); 
    }else{
         console.log(rows);
        
      
         if( parseInt(rows[0].length) == 0){
              req.flash('error',"Order ID does not exist");
              res.redirect('/dashboard');
              return;
            } else{
                     let data = {
                        orderheader:rows[0],
                        orderdetail:rows[1],
                        shippingdetail : rows[2],
                        routecode : rows[3],
                        delayreason: rows[4],
                        rejectreason : rows[5]
                     
                     }
                 console.log(JSON.stringify(data));
                    res.render('orders/orders_view',{data : data});
            }
        }
   });
   
   
   })
  

    router.post("/manualallocation",  function(req, res){ 
    var routecode = req.body.routecode;
    var orderid = req.body.orderid;
    var user = "Admin";
    var errors = validationResult(req);
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
  
    if(length>0){
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);
    return false;
    }


      var qry = "CALL sp_ordermanualallocation(?,?,?)";

      connection.query(qry,[orderid,routecode,user],function(err,rows){
          
        if(err){
           console.log(err);
           res.json(err);
        }else{
            console.log(rows[0][0].flag);
           
            // res.json(rows);
         var flag =  parseInt(rows[0][0].flag);
         if(flag == 0){
          
          console.log("Order Already Confirmed By Salesman Cannot Allocate");
          req.flash('error',"Order Already Confirmed / Delivered / Rejected");
          res.redirect(orderid);
         } else{
          req.flash('success',"Order Allocated to Route "+routecode);
          res.redirect(orderid);
          sendnotification(routecode,orderid);
         }
       
           }
    });
      });


      router.post("/reject",  function(req, res){ 
        //res.render("orders/orders");
      var rejectreason = req.body.rejectreason;
      var orderid = req.body.orderid;
      console.log(req.body.orderid);
      var user = "Admin";
      var errors = validationResult(req);
      var errors1 = errors.errors;
      var length = errors1.length;  
      var errorarry = [];
      if(length>0){
       for(i= 0 ;i<length;i++){
           errorarry.push(errors1[i].msg);
          }
        console.log(errorarry);
       //res.json(errorarry);
      // res.render('suppliers/suppliers_add',{errors:errorarry} );
      return false;
      }
        var qry = "CALL sp_rejectorder(?,?,?)";
  
        connection.query(qry,[orderid,rejectreason,user],function(err,rows){
            
          if(err){
             console.log(err);
             res.json(err);
             //req.flash('error',"Cannot load data");
           //  res.redirect('/orders');
          }else{
            var flag =  parseInt(rows[0][0].flag);
          
            if(flag == 0){
             
             console.log("Order Already Confirmed By Salesman Cannot Allocate");
             req.flash('error',"Order Already Confirmed / Delivered / Rejected");
             res.redirect(orderid);
            } else{
             req.flash('success',"Order Rejected !!");
             res.redirect(orderid);
   
            }
          
          
             }
      });
      //console.lof
      //res.send("Welcome Hoeny!!");
        });

 
        router.post("/delay",  function(req, res){ 
          //res.render("orders/orders");
        var reason = req.body.reason;
        var user = "Admin";
        var orderid = req.body.orderid;
        console.log(req.body.orderid);
     
        var errors = validationResult(req);
        var errors1 = errors.errors;
        var length = errors1.length;  
        var errorarry = [];
        if(length>0){
         for(i= 0 ;i<length;i++){
             errorarry.push(errors1[i].msg);
            }
          console.log(errorarry);
         //res.json(errorarry);
        // res.render('suppliers/suppliers_add',{errors:errorarry} );
        return false;
        }
     
       //return false;
          var qry = "CALL sp_orderdelay(?,?,?)";
     
          connection.query(qry,[orderid,reason,user],function(err,rows){
              
            if(err){
               console.log(err);
               res.json(err);
               
            }else{
                console.log(rows);
               
                var flag =  parseInt(rows[0][0].flag);
                if(flag == 0){
                 
                 console.log(" Order Already Confirmed / Delivered / Rejected");
                 req.flash('error',"Order Already Confirmed / Delivered / Rejected");
                 res.redirect(orderid);
                } else{
                 req.flash('success',"Order Delayed !!");
                 res.redirect(orderid);
       
                }
               
               }
        });
        //console.lof
        //res.send("Welcome Hoeny!!");
          });



router.get('/getlogdata/:orderid', function(req,res){
var orderid = req.params.orderid;
console.log(orderid);

var qry = "CALL sp_getlogdata(?)";
connection.query(qry,[orderid],function(err,rows){
  // SELECT oh.orderid,oh.cdate,oh.gradtot,IFNULL(oh.shipmentflag,0) AS shipmentflag,IFNULL(oh.statusflag,0) AS statusflag,IFNULL(oh.delayedflag,0) AS delayedflag FROM  orderheader oh;    
     if(err){
        console.log(err);
     }else{
        // console.log(rows[0][0]);
      console.log(rows[1]);
      var syatemallocationdetal = rows[1];
      var manualallocationdetail = rows[2];
      var delayallocationdetail = rows[3];
      var rejectallocationdetail = rows[4];
      var deliverydetails = rows[5];
      var statusflag = parseInt(rows[0][0].statusflag);
      var autoalloc = parseInt(rows[0][0].autoalloc);
      var manualalloc = parseInt(rows[0][0].manualalloc);
      console.log("autoalloc "+autoalloc);
      console.log("manualalloc "+manualalloc);
      console.log(deliverydetails);
     //--SYSTEM ALLOCATION
      var systemalloc = '';
      var systemallocationtop = "  <div class='col-xs-12 table-responsive'> <b> System Allocation</b>   <table class='table table-striped'>"  
      var systemallocationbottom = "</table></div>"
      var systemallocationtablehead = '';
      var systemallocationtablebottom = '';
      var systemallocationtabledata = '';
      if(autoalloc ==0){
        systemallocationtabledata =  '<br> <b class="aligin-center">No Salesman allocated</b>'; 
      }else {
        systemallocationtablehead = ' <thead><tr> <th>Route Code</th> <th>Send Date</th> <th>Send Time</th> <th>Status</th> <th>Received Date</th> <th>Received Time</th>  </tr> </thead> <tbody>';
        systemallocationtablebottom = ' </tbody>';
        console.log(syatemallocationdetal.length);
        syatemallocationdetal.forEach(function(row){
        console.log("INSIDE 4 EACH");
        console.log(row.receiveddate);
        var status;
          switch(row.status) {
            case 0:
              status= "SEND"; break;
            case 1:
              status= "ACCEPTED"; break;
            case 2:
                status= "REJECTED"; break;
            case 3:
                 status= "CANCELLED"; break;
          }
          
      //  var senddate = '2020/1/20';
        var receivedate = (row.receiveddate)? (row.receiveddate.getFullYear()+'/'+( row.receiveddate.getMonth()+1)+'/'+ row.receiveddate.getDate()) : '-- -- ----';
        var senddate = (row.senddate)? (row.senddate.getFullYear()+'/'+( row.senddate.getMonth()+1)+'/'+ row.senddate.getDate()) : '-- -- ----';
        
        var receivedtime = (row.receivetime)?(row.receivetime):'-- : --';
        var rowdata =   '<tr><th>'+row.routecode+'</th><th>'+senddate+'<th>'+row.sendtime+'</th> <th>'+status+'</th> <th>'+receivedate+'</th>  <th>'+receivedtime+'</th>  </tr>';
        systemallocationtabledata+=rowdata;
        });
      }
     systemalloc = systemallocationtop+systemallocationtablehead+systemallocationtabledata+systemallocationtablebottom+systemallocationbottom;
      console.log(systemalloc);
    //-------------------------
    
    //---SYSTEM MANUAL ----
    var manualallocation = '';
    var manualallocationtop = "  <div class='col-xs-12 table-responsive'> <b> Manual Allocation</b>   <table class='table table-striped'>"  
    var manualallocationbottom = "</table></div>"
    var manualallocationtablehead = '';
    var manualallocationtablebottom = '';
    var manualallocationtabledata = '';
    if(manualalloc ==0){
      manualallocationtabledata =  '<br> <b class="aligin-center">No Salesman manually allocated</b>'; 
    }else {
      manualallocationtablehead = ' <thead><tr> <th>Route Code</th> <th>Send Date</th> <th>Send Time</th> <th>Status</th> <th>Received Date</th> <th>Received Time</th>  </tr> </thead> <tbody>';
      manualallocationtablebottom = ' </tbody>';
      console.log(syatemallocationdetal.length);
      manualallocationdetail.forEach(function(row){
      console.log("INSIDE 4 EACH");
      console.log(row.receiveddate);
      var status;
        switch(row.status) {
          case 0:
            status= "SEND"; break;
          case 1:
            status= "ACCEPTED"; break;
          case 2:
              status= "REJECTED"; break;
          case 3:
               status= "CANCELLED"; break;
        }
        
      var senddate = '2020/1/20';
      var receivedate = (row.receiveddate)? (row.receiveddate.getFullYear()+'/'+( row.receiveddate.getMonth()+1)+'/'+ row.receiveddate.getDate()) : '-- -- ----';
      var receivedtime = (row.receivetime)?(row.receivetime):'-- : --';
      var rowdata =   '<tr><th>'+row.routecode+'</th><th>'+senddate+'<th>'+row.sendtime+'</th> <th>'+status+'</th> <th>'+receivedate+'</th>  <th>'+receivedtime+'</th>  </tr>';
      manualallocationtabledata+=rowdata;
      });
    }
    manualallocation = manualallocationtop+manualallocationtablehead+manualallocationtabledata+manualallocationtablebottom+manualallocationbottom;
    console.log(manualalloc);
    //----------------------

//--- DELAY -----------
   
var delayallocation = '';

if(statusflag == 2){
    var delayallocationtop = "  <div class='col-xs-12 table-responsive'> <b> Delay Status</b>   <table class='table table-striped'>"  
    var delayallocationbottom = "</table></div>"
    var delayallocationtablehead = '';
    var delayallocationtablebottom = '';
    var delayallocationtabledata = '';
      delayallocationtablehead = ' <thead><tr> <th>Reason</th> <th>Send Date</th> <th>Send Time</th> <th>Status</th> <th>Received Date</th> <th>Received Time</th>  </tr> </thead> <tbody>';
      delayallocationtablebottom = ' </tbody>';
      console.log(syatemallocationdetal.length);
      delayallocationdetail.forEach(function(row){
      console.log("INSIDE 4 EACH");
      console.log(row.receiveddate);
      var status;
        switch(row.status) {
          case 0:
            status= "CANCELLED"; break;
          case 1:
            status= "DELAYED"; break;
        }
        
      var senddate = (row.senddate)? (row.senddate.getFullYear()+'/'+( row.senddate.getMonth()+1)+'/'+ row.senddate.getDate()) : '-- -- ----';
      var sendtime = (row.sendtime)?(row.sendtime):'-- : --';
      var receivedate = (row.receiveddate)? (row.receiveddate.getFullYear()+'/'+( row.receiveddate.getMonth()+1)+'/'+ row.receiveddate.getDate()) : '-- -- ----';
      var receivedtime = (row.receivetime)?(row.receivetime):'-- : --';
      var rowdata =   '<tr><th>'+row.reasondescription+'</th><th>'+senddate+'<th>'+sendtime+'</th> <th>'+status+'</th> <th>'+receivedate+'</th>  <th>'+receivedtime+'</th>  </tr>';
      delayallocationtabledata+=rowdata;
      });
    
    delayallocation = delayallocationtop+delayallocationtablehead+delayallocationtabledata+delayallocationtablebottom+delayallocationbottom;
    console.log(delayallocation);
  
    }
      //----------------------
//==reject ====
      var rejectallocation = '';

      if(statusflag == 4){
          var rejectallocationtop = "  <div class='col-xs-12 table-responsive'> <b> Reject Status</b>   <table class='table table-striped'>"  
          var rejectallocationbottom = "</table></div>"
          var rejectallocationtablehead = '';
          var rejectallocationtablebottom = '';
          var rejectallocationtabledata = '';
            rejectallocationtablehead = ' <thead><tr> <th>Reason</th> <th>Send Date</th> <th>Send Time</th> <th>Status</th></tr> </thead> <tbody>';
            rejectallocationtablebottom = ' </tbody>';
            console.log(syatemallocationdetal.length);
            rejectallocationdetail.forEach(function(row){
            console.log("INSIDE 4 EACH");
            console.log(row.receiveddate);
            var status;
              switch(row.status) {
                case 0:
                  status= "CANCELLED"; break;
                case 1:
                  status= "REJECT"; break;
              }
              
            var senddate = (row.senddate)? (row.senddate.getFullYear()+'/'+( row.senddate.getMonth()+1)+'/'+ row.senddate.getDate()) : '-- -- ----';
            var sendtime = (row.sendtime)?(row.sendtime):'-- : --';
            var rowdata =   '<tr><th>'+row.reasondescription+'</th><th>'+senddate+'<th>'+sendtime+'</th> <th>'+status+'</th> </tr>';
            rejectallocationtabledata+=rowdata;
            });
          
          rejectallocation = rejectallocationtop+rejectallocationtablehead+rejectallocationtabledata+rejectallocationtablebottom+rejectallocationbottom;
          console.log(rejectallocation);
          //----------------------
          }
//==
var delivery ="";

if(statusflag == 3){
  var deliverytop = "  <div class='col-xs-12 table-responsive'> <b> Delivery Status</b>   <table class='table table-striped'>"  
  var deliverybottom = "</table></div>"
  var deliverytablehead = '';
  var deliverytablebottom = '';
  var deliverytabledata = '';
  deliverytablehead = ' <thead><tr> <th>Route Code</th> <th>Delivery Date</th> <th>Delivery Time</th> <th>Invoice Number</th></tr> </thead> <tbody>';
  deliverytablebottom = ' </tbody>';
    console.log(deliverydetails.length);
    deliverydetails.forEach(function(row){
    console.log("INSIDE 4 EACH");
   // console.log(row.receiveddate);

      
    var deliverydate = (row.deliverydate)? (row.deliverydate.getFullYear()+'/'+( row.deliverydate.getMonth()+1)+'/'+ row.deliverydate.getDate()) : '-- -- ----';
    var deliverytime = (row.deliverytime)?(row.deliverytime):'-- : --';
    var rowdata =   '<tr><th>'+row.routecode+'</th><th>'+deliverydate+'<th>'+deliverytime+'</th> <th>'+row.invoicenumber+'</th> </tr>';
    deliverytabledata+=rowdata;
    });
  
    delivery = deliverytop+deliverytablehead+deliverytabledata+deliverytablebottom+deliverybottom;
  console.log(delivery);
  //----------------------
  }
     var completedata = systemalloc+manualallocation+delayallocation+rejectallocation+delivery;
     
      res.send(completedata);
      
      
      }
 });

});




function sendnotification(routecode,orderid){
  console.log("Hello from send notification");
 connection.query("SELECT tokenkey FROM tbl_route_token trt INNER JOIN sfa_test.routemaster rm ON trt.deviceid = rm.device_assigned_id WHERE rm.routecode = ? ",[routecode],function(err,rows){                
   if(err){
          console.log(err);
       
           }else{
         
             console.log(rows[0]);
       // return;
 if(rows[0]){
  var tokenkey = rows[0].tokenkey
  var payload = {
  notification: {
  title: "Order Received !!",
  body: "You have a new order !!"
          },
          data: {
             orderid : String(orderid)
           }
        };
        var options = {
          priority: "high",
          timeToLive: 60 * 60 *24
        };
       
        admin.messaging().sendToDevice([tokenkey], payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
      
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
 }else{

  console.log("No token found");
  return;
 }
       
             
             }
 });
 }
module.exports = router;

