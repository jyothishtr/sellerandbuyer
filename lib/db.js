var mysql=require('mysql');
var chalk = require('chalk');
var config = require('../config');

var connection=mysql.createConnection(config.database);
connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log(chalk.blue('Database Connected!!'));
  }
});  


module.exports = connection;