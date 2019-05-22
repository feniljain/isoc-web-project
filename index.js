const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
const knex=require('knex');
var jwt = require('jsonwebtoken');
const Promise = require('bluebird');

/*const knexfile = require('{path-of-your}/knexfile.js');
const knex = require('knex')(knexfile);*/
// create a knex instance
/*const knex = require('knex')({
    dialect: 'postgres'
    // other params
  });
  const st = require('knex-postgis')(knex);
  const sql = knex.select('id', st.asText('geom')).from('points').toString();*/

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: }));

const db=knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1234',
      database : 'isoc'
    }
  });

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRocnV2QGdtYWlsLmNvbSIsImlhdCI6MTU1ODQ0ODY2NiwiZXhwIjoxNTU4NTM1MDY2fQ.izNTJbhhvlmVGgoHhWbq53bueppF-DYePsN_Y5Gs5L8

/*db.select('*').from('login').then(data=>{
    console.log(data)
});*/

const generateToken=(user)=>
 {
    //console.log(user);
    const email=user.email;
    const token=jwt.sign({email}, '+AsEcReT$!#PaTtErN-', { expiresIn: '24h' });
    //console.log(token);
    //localStorage.setItem("token", token);
    return(token);
    //console.log(JSON.parse($window.localStorage.getItem("token:")));
 }

/*const checkToken=(token)=>
 {
    jwt.verify(token, '+AsEcReT$!#PaTtErN-', function(err, decoded) {
        //console.log("Verified! "+decoded.foo) // bar
        if(!err)
         {
             return 1;
         }
        else {
            return 0;
        }
      });
 }*/

app.get('/',(req,res)=>
 {
     res.send(db.users);
 });

app.get('/checkToken',(req,res)=>
 {
     const {token}=req.body;
     jwt.verify(token, '+AsEcReT$!#PaTtErN-', function(err, decoded) {
        //console.log("Verified! "+decoded.foo) // bar
        if(!err)
         {
            res.json({
                "success": true,
                "email": decoded.email
            });
         }
        else {
            res.json({
                "success": false
            });
        }
      });
     //console.log(token);
 });//To be called upon by componentDidMount type of functions so that token is checked.

app.post('/signin',(req,resp)=>
 {
     const {email, password}=req.body;
    db.select('email','hash').from('login').where('email', '=', email).then(data=>{
        bcrypt.compare(password,data[0].hash, function(err, res) {
            // res === true
            //console.log(data+" "+password+" "+res);
            if(res===true)
             {
                 resp.json({
                     "success": true,
                     "email": data[0].email
                 });
             }
            else {
                resp.json({
                    "success": false
                })
                //resp.json(data);
            }
         });
     });
 });

app.post('/register', (req,res)=>
 {
    const {name,email,password}=req.body;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            db.transaction(trx=>{
                trx.insert({
                    email: email,
                    hash: hash
                }).into('login')
                .returning('email')
                .then(Email=>
                     {
                        return trx('users').returning('*').insert({
                        name: name,
                        email: Email[0],
                        friendrequests: "[]",
                        messages: '{"name": [], "message": []}',
                        joined: new Date()
                    }).then(user=>{
                            var token=generateToken(user[user.length-1]);
                            res.json({
                                token: token
                            });
                        })
                     })
                    .then(trx.commit)
                    .then(trx.rollback)
            }).catch(err=>
                 {
                     res.status(400).send('Unable to register');
                 });
        });
    });
 });

const update= async (email,arr) => {
    return new Promise((resolve, reject) => {
        db('users')
        .where('email', email)
        .update({
            //name: 'Dhruv'
            friendrequests: arr
        }).then(()=>{resolve("Done!")})
    })
 }

app.post('/friendrequests',async (req,res)=>{
    const {name,email}=req.body;
    var arr; 
    //console.log(name[1]);
    /*db('users').select 
    .where('email', '=', email)*/

    /*db.select('*').from('users')
    .where('email', '=', email)
    .then(data=>{
        //console.log(data);
        data[0].friendrequests.push(name);
        res.json("Friend Request from "+name[0]+" to "+name[1]);
    });*/

    const promise1 = new Promise((resolve, reject) => {

        db('users')
        .where('email', email)
        .then(function (user) {//Fetching correct user.
            user[0].friendrequests.push(name[0]);
            arr=user[0].friendrequests;
            console.log(user[0].friendrequests);
            resolve();
        });
    })
    
    console.log(arr);

    const result1 = await promise1;

    const updateResult = await update(email, arr);

    console.log(updateResult)

    //setTimeout(, 1000);
    // res.json("Done!");
    /*.then(user=>{
        if(user[0].friendrequests.name.length==0)
         {
            user[0].friendrequests.name=[];
            user[0].friendrequests.name.push(name);

         }
        else {
            user[0].friendrequestame.push(name);
        }
        a=user[0].friendrequests.name.push(name);
        return(user);
    })*/
    //res.json(user[0].friendrequests.name);
    //res.json("Done!");
});

app.listen(8010, function(err)
 {
     if(!err)
      {
          console.log("Listening on port 8010");
      }
 });        