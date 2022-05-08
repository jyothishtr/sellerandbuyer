var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');

router.get("/new",middleware.isLoggedIn,  function(req,res){

    res.render('feedback/feedbacknew');

})

router.get("/past",middleware.isLoggedIn,  function(req,res){

    res.render('feedback/feedbackpast');

})


router.post("/processtabledata",middleware.isLoggedIn,function(req,res){

var draw = req.body.draw;
var start = req.body.start;
var length =  req.body.length;
var orderby = req.body.order[0].column;
var type = req.body.order[0].dir;
var order;
var search =(req.body.search.value)?req.body.search.value:"";
// console.log(req.body);
// console.log(orderby);

switch(parseInt(orderby)) {
    case 0:
    order = "messageid"
    break;
    case 1:
    order = "userid"
    break;
    case 2:
    order = "cdate"
    break;
    default:
    order = "messageid"
}

console.log("orderby : "+order+"\n type :"+type);
// return;
var dataarray = [];
var totalrec,filteredrec;
//var sqlqry = "CALL sp_get_registeredusers(?,?,?,?,?)";
var sqlqry ="CALL sp_feedbackmessage(?,?,?,?,?,?)"
connection.query(sqlqry,[start,length,order,type,search,0],function(err,rows){       
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
  var button = "<form action= '/feedback/changestatus/"+e.messageid+"'  method='POST' >    <button type='submit' class='btn btn-danger'><i class='fas fa-hourglass-start'> </i> Read</button>  </form>";

 
var obj ={
messageid:e.messageid,
userid:e.userid,
date:e.cdate,
time:e.time,
message:e.message,
action:button
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




router.post("/processtabledata2",middleware.isLoggedIn,function(req,res){

    var draw = req.body.draw;
    var start = req.body.start;
    var length =  req.body.length;
    var orderby = req.body.order[0].column;
    var type = req.body.order[0].dir;
    var order;
    var search =(req.body.search.value)?req.body.search.value:"";
    // console.log(req.body);
    // console.log(orderby);
    
    switch(parseInt(orderby)) {
        case 0:
        order = "messageid"
        break;
        case 1:
        order = "userid"
        break;
        case 2:
        order = "cdate"
        break;
        case 5:
        order = "readuser"
        break;
        case 6:
        order = "readtime"
        break;
        default:
        order = "messageid"
    }
    
    console.log("orderby : "+order+"\n type :"+type);
    // return;
    var dataarray = [];
    var totalrec,filteredrec;
    //var sqlqry = "CALL sp_get_registeredusers(?,?,?,?,?)";
    var sqlqry ="CALL sp_feedbackmessage(?,?,?,?,?,?)"
    connection.query(sqlqry,[start,length,order,type,search,1],function(err,rows){       
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
    messageid:e.messageid,
    userid:e.userid,
    date:e.cdate,
    time:e.time,
    message:e.message,
    readby:e.readuser,
    readdate:e.readdate
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
    


router.post("/changestatus/:messageid",middleware.isLoggedIn,  function(req,res){
    var username = req.user.username;

    var Qry = "update messages set readstatus = 1,readdate =curdate(),readtime = curtime(),readuser = ? where messageid = ?"
connection.query(Qry,[username,parseInt(req.params.messageid)],function(err,rows){
    if(err){
        console.log(err);
        res.send("Something went Wrong"); return;
        }else{
        
        req.flash("success","The Message has been read")
        res.redirect('/feedback/new');
        
        }        
});



});


module.exports = router;