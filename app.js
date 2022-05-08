var express = require('express');
var  fs = require("fs");
var bodyParser = require('body-parser');
const https = require('https');
var pem = require('pem')
var expressValidator = require('express-validator');
var methodOverride = require('method-override');
var passport = require('passport');
var flash = require("connect-flash");
var fileupload = require('express-fileupload');
require('./lib/passport')(passport);
var app = express();
app.disable('etag');



app.use(fileupload());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json({
   inflate: true,
   limit: '100kb',
   reviver: null,
   strict: true,
   type: 'application/json',
   verify: undefined
 }));

 
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static("images"));
app.use(methodOverride('_method'));

app.use(require("express-session")({
   secret: "Once again Rusty wins cutest dog!",
   resave: false,
   saveUninitialized: false
}));
app.use(flash());
app.use(function(req, res, next){
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   //res.locals.user = req.user.username || null;
   next();
});



//console.log(process.env.PORT);
app.use(passport.initialize());
app.use(passport.session()); 
var login = require('./routes/login');
var dashboard = require('./routes/dashboard');
var orders = require('./routes/orders');
var categories = require ('./routes/category');
var registeredusers = require('./routes/registeredusers');
var division = require("./routes/division");
var pushnotifications = require('./routes/pushnotifications');
var settings = require('./routes/settings');
var feedback = require("./routes/feedback");
app.use('/',login);




app.get('*', function (req, res, next) {
 if(req.user){
  res.locals.user = req.user.username || null;
 }
  else{
    res.locals.user =  null;
  }
  next();
});



app.use('/dashboard',dashboard);
app.use('/orders',orders);    
app.use('/registeredusers',registeredusers);
app.use('/categories',categories);
app.use('/products',products);
app.use('/division',division);
app.use('/pushnotification',pushnotifications);
app.use('/images', express.static('images'));
app.use('/reason',reason);
app.use('/settings',settings);
app.use('/pushnotofication',pushnotifications);
app.use('/feedback',feedback);
app.use('/reports',reports);

app.listen(8090, () => {
  //console.log(`Example app listening at http://localhost:${port}`)
  consoel.log("Application Created");
})

https.createServer(options, app).listen(8090,console.log("The Server Has started !!!!"));
