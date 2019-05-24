module.exports=function(app)
 {
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
    
        const updateResult = await utils.update(email, arr);
        res.json("Done!");
    });
    
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
    
        const updateResult = await utils.updatemessages(email, arr);
        res.json("Done!");
    });
         
 }