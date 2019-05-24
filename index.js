const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
const knex=require('knex');
var jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const sgMail = require('@sendgrid/mail')

app.use(bodyParser.json());

const db=knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1234',
      database : 'isoc'
    }
  });

const generateToken=(user)=>
 {
    const email=user.email;
    const token=jwt.sign({email}, '+AsEcReT$!#PaTtErN-', { expiresIn: '24h' });
    return(token);
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
 });//To be called upon by componentDidMount type of functions so that token is checked.

app.post('/signin',(req,resp)=>
 {
     const {email, password}=req.body;
    db.select('email','hash').from('login').where('email', '=', email).then(data=>{
        bcrypt.compare(password,data[0].hash, function(err, res) {
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
                            sgMail.setApiKey(process.env.sendGridApiKey);
                            const msg = {
                            to: user[user.length-1].email,
                            from: 'test@example.com',
                            subject: 'Thank you for registering! Lets get started',
                            text: 'Hi!',
                            html: '<p>Welcome to our family!</p>',
                            };
                            sgMail.send(msg);
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
            friendrequests: JSON.stringify(arr)
        }).then(()=>{resolve()})
    })
 }

app.put('/friendrequests',async (req,res)=>{
    const {name,email}=req.body;
    var arr;
    const promise1 = new Promise((resolve, reject) => {
        db('users')
        .where('email', email)
        .then(function (user) {//Fetching correct user.
            user[0].friendrequests.push(name[0]);
            arr=user[0].friendrequests;
            resolve();
        });
    })

    const result1 = await promise1;

    const updateResult = await update(email, arr);
    res.json("Done!");
});

const updatemessages= async (email,arr) => {
    return new Promise((resolve, reject) => {
        db('users')
        .where('email', email)
        .update({
            messages: JSON.stringify(arr)
        }).then(()=>{resolve()})
    })
 }

app.put('/messages',async (req,res)=>
{
    const {name,email,message}=req.body;
    var arr;
    const promise1 = new Promise((resolve, reject) => {
        db('users')
        .where('email', email)
        .then(function (user) {//Fetching correct user.
            user[0].messages.name.push(name[0]);
            user[0].messages.message.push(message);
            arr=user[0].messages;
            resolve();
        });
    })

    const result1 = await promise1;

    const updateResult = await updatemessages(email, arr);
    res.json("Done!");
});

app.get('/profile',(req,res)=>
 {
     const {email} = req.body;
     db('users')
     .select('*')
     .where('email',email)
     .then(user=>{
         res.json(user[0]);
        }).catch(err=>{
            res.json("No such user exists!");
        });
 });

app.listen(8010, function(err)
 {
     if(!err)
      {
          console.log("Listening on port 8010");
      }
 });        
