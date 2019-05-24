require('dotenv').config()
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
const knex=require('knex');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const sgMail = require('@sendgrid/mail');
const utils=require('./app/utils/utils.js');
require('./app/routes/GET/getroutes.js')(app);
require('./app/routes/POST/postroutes.js')(app);
require('./app/routes/PUT/putroutes.js')(app);
var jsdom = require('jsdom');
const {JSDOM} = jsdom;
//var window = jsdom.jsdom().parentWindow;
var window=JSDOM.parentWindow;
  
const {document} = (new JSDOM('<!doctype html><html><body></body></html>')).window;  
global.document = document;     
global.window = document.defaultView;

app.use(bodyParser.json());
app.use(cookieParser()); 
app.use((req,res,next)=>
 {
     //console.log(req);
     //console.log(document.cookie);
     //const token="1";
     //const token=Cookies.get('token');
     //const token=document.cookie.split('=')[1];
     const token=req.cookies.token;
     const result=utils.checkToken(token);
     if(result)
      {
        console.log('if');
        res.json({
            "success": true,
            "email": result
        });
        next();
      }
     else {
         console.log('else');
         next();
     }
    //console.log("Done!");
 });

const db=knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1234',
      database : 'isoc'
    }
  });

app.listen(8010, function(err)
 {
     if(!err)
      {
          console.log("Listening on port 8010");
      }
 });        