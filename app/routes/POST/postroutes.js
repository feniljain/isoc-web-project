module.exports=function(app)
 {
    app.post('/signin',(req,resp)=>
    {
        const {email, password}=req.body;
        if(checkEmail(email))
         {
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
         }
        else
         {
             res.json({
                 "success": false
             });
         }
    });
   
   app.post('/register', (req,res)=>
    {
       const {name,email,password}=req.body;
       if(checkEmail(email))
        {
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
                                    var token=utils.generateToken(user[user.length-1]);
                                    //Cookies.set('token',token);
                                    //process.env.SENDGRID_API_KEY
                                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                                    const msg = {
                                    to: user[user.length-1].email,
                                    from: 'test@example.com',
                                    subject: 'Thank you for registering! Lets get started',
                                    text: 'Hi!',
                                    html: '<p>Welcome to our family!</p>',
                                    };
                                    sgMail.send(msg);
                                    //res.cookie("token",token);
                                    cookieParser.JSONCookie({
                                        'token' :token
                                    });
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
        }
      else {
          res.json({
              "success": false
          });
      }
    });
      
 }