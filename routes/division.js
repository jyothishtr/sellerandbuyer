var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');

//==========================================   /categories get  ================================
router.get("/",middleware.isLoggedIn, function(req, res){
   //console.log("Hello World : ");
  // res.send("Hello World.........!");
   var qry = "Select divisionid,divisionname,activestatus from divisionheader";
    connection.query(qry,function(err,rows){
          
        if(err){
           console.log(err);
           req.flash('error',"Cannot load data");
           res.redirect("/dashboard");
        }else{
            
            let data = {
                division:rows,
                user : "Admin"
             }
            res.render("division/division",{data:data });
           }
    });
});
//================================================================================================


//======================================category/categories_add get==========================================
router.get("/add",middleware.isLoggedIn, function(req, res){
   // req.flash('error',"Flash Message");
    var errors = [];
    res.render("division/division_add",{errors:errors});
   
 });

//====================================================================================================



//====================================POST ADD CATEGORY ==============================================
 router.post("/add",middleware.isLoggedIn,[
    check('divisionname').not().isEmpty().withMessage('division Name cannot be empty'),
    check('active','Enter Boolean Value').not().isBoolean(),
    
  ],function(req,res){
  

    var divisionname = req.body.divisionname;
    var divisionarbname = req.body.divisionarbname;
    var active = (req.body.active =='on')?1:0;
    var user = "admin";
    var updateflag = 0;
    var errors = validationResult(req);
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);
    res.render('division/division_add',{errors:errorarry} );
    return false;
    }
   
    var division = [0,updateflag,divisionname,divisionarbname,active,user];

    var Qry = "CALL sp_createdivisionheader(?,?,?,?,?,?)"
    connection.query(Qry,division,function(err,rows){
          
        if(err){
           console.log(err);
            res.send("Error Something Went Wrong");
        }else{
          
            var lastid = parseInt(rows[0][0].lastid);
   console.log(lastid);        
            if(lastid == 0){
                req.flash('error',"division name already Exists");
                res.redirect('/division/add');
            }else{
                req.flash('success',"division created successfully");
                res.redirect('/division/'+lastid);

            }
           }
    });
  
 })
//=======================================================================================================

router.post("/additem/:divisionid",middleware.isLoggedIn,function(req,res){

console.log("hello post add products");
var divisionid = parseInt(req.params.divisionid);
var itemcode =  req.body.itemcode;
var promovalue = req.body.promovalue;
var promoprice = req.body.promoprice;
console.log(divisionid);
if(!Number.isInteger(divisionid)){
  req.flash('error',"Invalid Division ID");
  res.redirect('/division');    
  return false;
}

var arr = [0,divisionid,itemcode,promovalue,promoprice];
var Qry = "CALL sp_createdivisiondetail(?,?,?,?,?)";
connection.query(Qry,arr,function(err,rows){
      
    if(err){
       console.log(err);
       req.flash('error',"Something went wrong")
       res.redirect('/division/'+divisionid);
    }else{

      console.log("lastid "+rows[0][0].lastid);

    if(parseInt(rows[0][0].lastid) == 0){
         //  console.log("Invalid ID ");
           req.flash('error',"Item Already Added");
           res.redirect('/division/'+divisionid); return;
       }else{

        req.flash("success","Item Added Successfully");
        res.redirect('/division/'+divisionid);
        return;
       }

}
});

});

//===========================GET EDIT  REQUEST PAGE ==================================
router.get("/:id",middleware.isLoggedIn, function(req,res){
 var id = parseInt(req.params.id);
  //console.log("Hello World from ID");
   //console.log(id);

if(!Number.isInteger(id)){
    req.flash('error',"Invalid Division ID");
    res.redirect('/division');    
    return false;
}

var Qry = "CALL sp_getdivisiondetails(?)";

 connection.query(Qry,id,function(err,rows){
    
    if(err){
       console.log(err);
       req.flash('error',"Something Went Wrong");
       res.redirect('/division'); return;
    }else{  

       console.log(JSON.stringify(rows));
        console.log(rows[0][0]);
       if(parseInt(rows[0][0].lastid) == 0){
         //  console.log("Invalid ID ");
           req.flash('error',"Something Went Wrong");
           res.redirect('/division'); return;
       }else{

        var data ={
            header  : rows[1][0],
            detail  : rows[2],
            categories : rows[3]
            }
            res.render('division/division_edit',{data:data});
            return false;
       }
    }
});


})
//========================POST Update Divison Header ==================

//=====================================================================
// //==================================================================
router.get("/getitems/:categoryid",middleware.isLoggedIn, function(req, res){
  
  console.log("hello world");
    var categoryid = parseInt(req.params.categoryid);
   var Qry = "Select itemkey,itemcode from itemmaster where activestatus =  1 and categorycode = ?";
    connection.query(Qry,categoryid,function(err,rows){
          
        if(err){
           console.log(err);
            res.send("Error Something Went Wrong");
        }else{
          
 console.log(rows)
        
res.send(rows);

}
    });
    
    
  });


  router.get("/getdetails/:itemcode",middleware.isLoggedIn, function(req, res){
  
    console.log("hello world");
      var itemcode = parseInt(req.params.itemcode);
     var Qry = "Select itemdescription,salesprice,upc from itemmaster where activestatus =  1 and itemcode = ?";
      connection.query(Qry,itemcode,function(err,rows){
            
          if(err){
             console.log(err);
              res.send("Error Something Went Wrong");
          }else{
            
   console.log(rows)
          
  res.send(rows);
  
  }
      });
      
      
    });


    router.post("/editdetails",middleware.isLoggedIn, function(req, res){
  
        console.log("hello world 123");
         var itemcode = parseInt(req.body.itemcode);
         var promovalue = parseFloat(req.body.promovalue);
         var promoprice = parseFloat(req.body.promoprice);
          var divisionid = parseInt(req.body.divisionid);
         console.log(" divisionid "+divisionid+" promovalue "+promovalue+"promoprice "+promoprice);
      //  var Qry = "Select itemdescription,salesprice,upc from itemmaster where activestatus =  1 and itemcode = ?";
      var arr = [1,divisionid,itemcode,promovalue,promoprice];
      var Qry = "CALL sp_createdivisiondetail(?,?,?,?,?)";
      connection.query(Qry,arr,function(err,rows){
            
          if(err){
             console.log(err);
             req.flash('error',"Something went wrong")
             res.redirect('/division/'+divisionid);
          }else{
      
            console.log("lastid "+rows[0][0].lastid);
      
          if(parseInt(rows[0][0].lastid) == 2){
              res.send({status :"success",msg:"Record Updated Successfully"}); 

             }else{
              res.send({status :"error",msg:"Record Not Updated"}); 
      
             }
      
      }
      });
         
         
       });


       router.post("/deletedetails",middleware.isLoggedIn, function(req, res){
  
        console.log("Delete Details");
         var itemcode = parseInt(req.body.itemcode);
         var divisionid = parseInt(req.body.divisionid);
       
      var arr = [itemcode,divisionid];
      var Qry = "Delete from divisiondetail where itemcode = ? and divisionid = ?";
      connection.query(Qry,arr,function(err,rows){
            
          if(err){
             console.log(err);
             res.send({status :"error",msg:"Record Not Deleted"});
          }else{
      
              res.send({status :"success",msg:"Record Deleted"}); 
      }
      });

       });
// //================================================POST EDIT REQ==================================================

//  router.post("/edit/:id",[
//     check('categoryname').not().isEmpty().withMessage('Category Name cannot be empty'),
//     check('categoryarbname','Arab Category Name cannot be empty').not().isEmpty(),
//     check('active','Enter Boolean Value').not().isBoolean(),
    
//   ],function(req,res){
  
//     //console.log(req.params.id);
//     var id =  parseInt(req.params.id);
//     if(!(Number.isInteger(id))){
//     req.flash('error',"Invalid Order id");
//     res.redirect('/categories');
//     return;
//     }
//    // console.log(req.body.active);
//    // console.log(typeof(req.body.active));
//  // break;
  
//     var categoryname = req.body.categoryname;
//    // console.log(req.body.categoryname);
//     var categoryarbname = req.body.categoryarbname;
//     var cdate = req.body.cdate;
//     var active = (req.body.active =='on')?1:0;
//     var user = "admin";
//     var errors = validationResult(req);
//     //console.log(errors)
//     var errors1 = errors.errors;
//     var length = errors1.length;  
//     var errorarry = [];
//     let data = {
//             categories:{
//                 categoryid : id,
//                 categoryname: categoryname,
//                 arb_categoryname:categoryarbname,
//                 activestatus:active,
//                 cdate:cdate
//             },
//             user : "Admin"
//          }
    
//     if(length>0){  
     
//         //console.log("ERROR SOMETHING IS WRONG");
//         for(i= 0 ;i<length;i++){
//          errorarry.push(errors1[i].msg);
//         }
       
//         //console.log(errorarry);
//     res.render('category/categories_edit',{error:errorarry,data:data} );
//     return false;
//     }
    
//     var updateflag = 1;
//     var category = [id,categoryname,categoryarbname,active,user,updateflag];
//    // console.log(category);
// //return;
// ///console.log(category);
//     var Qry = "CALL sp_createcategory(?,?,?,?,?,?)"
//     connection.query(Qry,category,function(err,rows){
//         if(err){
//            console.log(err);
//             res.send("Error Something Went Wrong");
//         }else{
//              //console.log(parseInt(rows[0][0].lastid));
//             var lastid = parseInt(rows[0][0].lastid);
//            // console.log("lastid "+lastid);        
//             if(lastid == 0){
//                 req.flash('error',"Category name already Exists");
//                 res.redirect('/categories/'+id);
            
//             }else{
//                 req.flash('success',"Category Edited Successfully");
//                 res.redirect('/categories');

//             }   
//            }
//     });

//  });
// //=========================================================================================================


// //====================================================DELETE REQ ================================================
router.post("/edit/delete",middleware.isLoggedIn,function(req, res){
console.log("Here from delete route");
 var id =[];
 var  idarrry = req.body.idselect;
 console.log(idarrry);

 if(Array.isArray(idarrry)){
    idarrry.forEach(function(element,index){
        id.push(Number(element));
    });
    }else { 
        id.push(parseInt(idarrry));
    }
    console.log(id);
    var Qry1 = "DELETE FROM divisionheader WHERE divisionid in ("+id.join(',')+")";
    var Qry2 = "DELETE FROM divisiondetail WHERE divisionid in ("+id.join(',')+")";
  
    connection.query(Qry1,function(err,rows){
          
        if(err){
           console.log(err);
        }else{
          
          connection.query(Qry2,function(err,rows){
          
            if(err){
               console.log(err);
            }else{
              req.flash("success","Record(s) successfully deleted");
              res.redirect("/division");
            
            }
        });

           }
    });
  

});
//==================================================================================================================
router.post("/:id",middleware.isLoggedIn, function(req,res){
  var divisionid = parseInt(req.params.id);
   console.log("Division Header Update POST Route");
    //console.log(id);
 
 if(!Number.isInteger(divisionid)){
     req.flash('error',"Invalid Division ID");
     res.redirect('/division');    
     return false;
 }
    var divisionname = req.body.divisionname;
    var divisionarbname = req.body.divisionarbname;
    var active = (req.body.active =='on')?1:0;
    var user = "admin";
    var updateflag = 1;
    var errors = validationResult(req);
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);
      res.redirect('division/'+divisionid );
    return false;
    }
   
    var division = [divisionid,updateflag,divisionname,divisionarbname,active,user];

    var Qry = "CALL sp_createdivisionheader(?,?,?,?,?,?)"
    connection.query(Qry,division,function(err,rows){
          
        if(err){
           console.log(err);
            res.send("Error Something Went Wrong");
        }else{
          
            var lastid = parseInt(rows[0][0].lastid);
            //console.log(lastid);        
            if(lastid == 1){             
              req.flash('success',"Division Updated successfully");
              res.redirect('/division/'+divisionid);
            }else{           
              req.flash('error',"Something Went Wrong");
              res.redirect('/division/'+divisionid);
            }
           }
    }); 
 
 })

module.exports = router;

