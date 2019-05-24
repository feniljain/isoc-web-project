module.exports=function(app)
 {
    app.get('/',(req,res)=>
    {
        res.send(db.users);
    });
   
   app.get('/checkToken',(req,res)=>
    {
        const {token}=req.body;
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
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
    
    app.get('/profile',(req,res)=>
     {
        const {email} = req.body;
        if(checkEmail(email))
         {
            db('users')
            .select('*')
            .where('email',email)
            .then(user=>{
                res.json(user[0]);
                }).catch(err=>{
                    res.json("No such user exists!");
                });
         }
        else {
            res.json({
                "success": false
            });
        }
     });
 }