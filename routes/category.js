var express = require("express");
var router  = express.Router();
var middleware = require('../middleware');
const { check, validationResult } = require('express-validator');
var connection  = require('../lib/db');

//==========================================   /categories get  ================================
router.get("/",middleware.isLoggedIn, function(req, res){
   
   var qry = "CALL sp_getcategories()";
    connection.query(qry,function(err,rows){
          
        if(err){
           console.log(err);
           req.flash('error',"Cannot load data");
           res.redirect("/dashboard");
        }else{
            
            let data = {
                categories:rows[0],
                user : "Admin"
             }

        //    console.log(rows);
           // req.flash('success',"Category created successfully");
            res.render("category/categories",{data:data });
           }
    });
});
//================================================================================================


//======================================category/categories_add get==========================================
router.get("/add",middleware.isLoggedIn, function(req, res){
   // req.flash('error',"Flash Message");
    var errors = [];
    res.render("category/categories_add",{errors:errors});
   
 });

//====================================================================================================



//====================================POST ADD CATEGORY ==============================================
 router.post("/add",middleware.isLoggedIn,[
    check('categoryname').not().isEmpty().withMessage('Company Name cannot be empty'),
    check('categoryarbname','Address cannot be empty').not().isEmpty(),
    check('active','Enter Boolean Value').not().isBoolean(),
    
  ],function(req,res){
  
//check(req.body.companyName,'Invalid Name').isNumeric();
  //console.log(req.body.active);
 // console.log(typeof(req.body.active));
 // break;
  
    var categoryname = req.body.categoryname;
    var categoryarbname = req.body.categoryarbname;
    var active = (req.body.active =='on')?1:0;
    var user = "admin";
    var updateflag = 0;
    var errors = validationResult(req);
   // console.log(errors)
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    if(length>0){  
     for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
      console.log(errorarry);
    res.render('category/categories_add',{errors:errorarry} );
    return false;
    }
   
    var category = [0,categoryname,categoryarbname,active,user,updateflag];

    var Qry = "CALL sp_createcategory(?,?,?,?,?,?)"
    connection.query(Qry,category,function(err,rows){
          
        if(err){
           console.log(err);
            res.send("Error Something Went Wrong");
        }else{
          
            var lastid = parseInt(rows[0][0].lastid);
//console.log(lastid);        
            if(lastid == 0){
                req.flash('error',"Category name already Exists");
                res.redirect('/categories/add');
            }else{
                req.flash('success',"Category created successfully");
                res.redirect('/categories');

            }
           }
    });
  
 })
//=======================================================================================================



//===========================GET EDIT  REQUEST PAGE ==================================
router.get("/:id",middleware.isLoggedIn, function(req,res){
 var id = parseInt(req.params.id);
 //console.log("id = "+id+"\n"+typeof(id));
if(!Number.isInteger(id)){
    req.flash('error',"Invalid Category ID");
    res.redirect('/categories');    
    return false;
}
 connection.query("select * from  categorymaster where categoryid = ?",[id],function(err,rows){
    
    if(err){
       console.log(err);
       req.flash('error',"Cannot Find category");
       res.redirect('/categories'); return;
    }else{  
       
        console.log(rows[0]);
        if(rows[0] == undefined){
            req.flash('error',"Cannot Find category");
            res.redirect('/categories'); return;
        }
        let data = {
            categories:rows[0],
            user : "Admin"
         }
        res.render('category/categories_edit',{data:data});
       }
});


})
//==================================================================


//================================================POST EDIT REQ==================================================

 router.post("/edit/:id",middleware.isLoggedIn,[
    check('categoryname').not().isEmpty().withMessage('Category Name cannot be empty'),
    check('categoryarbname','Arab Category Name cannot be empty').not().isEmpty(),
    check('active','Enter Boolean Value').not().isBoolean(),
    
  ],function(req,res){
  
    //console.log(req.params.id);
    var id =  parseInt(req.params.id);
    if(!(Number.isInteger(id))){
    req.flash('error',"Invalid Order id");
    res.redirect('/categories');
    return;
    }
   // console.log(req.body.active);
   // console.log(typeof(req.body.active));
 // break;
  
    var categoryname = req.body.categoryname;
   // console.log(req.body.categoryname);
    var categoryarbname = req.body.categoryarbname;
    var cdate = req.body.cdate;
    var active = (req.body.active =='on')?1:0;
    var user = "admin";
    var errors = validationResult(req);
    //console.log(errors)
    var errors1 = errors.errors;
    var length = errors1.length;  
    var errorarry = [];
    let data = {
            categories:{
                categoryid : id,
                categoryname: categoryname,
                arb_categoryname:categoryarbname,
                activestatus:active,
                cdate:cdate
            },
            user : "Admin"
         }
    
    if(length>0){  
     
        //console.log("ERROR SOMETHING IS WRONG");
        for(i= 0 ;i<length;i++){
         errorarry.push(errors1[i].msg);
        }
       
        //console.log(errorarry);
    res.render('category/categories_edit',{error:errorarry,data:data} );
    return false;
    }
    
    var updateflag = 1;
    var category = [id,categoryname,categoryarbname,active,user,updateflag];
   // console.log(category);
//return;
///console.log(category);
    var Qry = "CALL sp_createcategory(?,?,?,?,?,?)"
    connection.query(Qry,category,function(err,rows){
        if(err){
           console.log(err);
            res.send("Error Something Went Wrong");
        }else{
             //console.log(parseInt(rows[0][0].lastid));
            var lastid = parseInt(rows[0][0].lastid);
           // console.log("lastid "+lastid);        
            if(lastid == 0){
                req.flash('error',"Category name already Exists");
                res.redirect('/categories/'+id);
            
            }else{
                req.flash('success',"Category Edited Successfully");
                res.redirect('/categories');

            }   
           }
    });

 });
//=========================================================================================================


//====================================================DELETE REQ ================================================
router.post("/delete",middleware.isLoggedIn,function(req, res){
  //console.log("Hello form delete");
   // console.log(JSON.stringify(req.body.id));
  
  //console.log(req.body.idselect);
 //  return;
 var id =[];
 var  idarrry = req.body.idselect;
 console.log(idarrry);

 //return;
 if(Array.isArray(idarrry)){
    idarrry.forEach(function(element,index){
        id.push(Number(element));
    });
    }else { 
        id.push(parseInt(idarrry));
    }
    console.log(id);
    var Qry = "DELETE FROM categorymaster WHERE categoryid in ("+id.join(',')+")";
    console.log(Qry);
   // return;  
    connection.query(Qry,function(err,rows){
          
        if(err){
           console.log(err);
           req.flash('error',"Cannot Delete Record, Something Went Wrong");
           res.redirect('/categories');
        }else{
            //console.log(rows);
            req.flash('success',"Record Deleted Successfully");
            res.redirect('/categories');
           }
    });
  

});
//==================================================================================================================


module.exports = router;

