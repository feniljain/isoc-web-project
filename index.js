const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
const knex=require('knex');
var jwt = require('jsonwebtoken');

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
                 "success": "true",
                 "email": decoded.email
             });
         }
        else {
            res.json({
                "success": "false"
            });
        }
      });
     //console.log(token);
 });//To be called upon by componentDidMount type of functions so that token is checked.

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
                        friendrequests: '{"name":""}',
                        messages: '{"name":"", "message":""}',
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

app.listen(8010, function(err)
 {
     if(!err)
      {
          console.log("Listening on port 8010");
      }
 });