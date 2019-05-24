require('dotenv').config()
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

module.exports={

    generateToken: function(user)
    //const generateToken=(user)=>
     {
        const email=user.email;
        const token=jwt.sign({email}, process.env.SECRET, { expiresIn: '24h' });
        return(token);
     },
    
    update: async function(email,arr){
    //const update= async (email,arr) => {
        return new Promise((resolve, reject) => {
            db('users')
            .where('email', email)
            .update({
                friendrequests: JSON.stringify(arr)
            }).then(()=>{resolve()})
        })
     },
    
    updatemessages: async function(email,arr){
     //const updatemessages= async (email,arr) => {
        return new Promise((resolve, reject) => {
            db('users')
            .where('email', email)
            .update({
                messages: JSON.stringify(arr)
            }).then(()=>{resolve()})
        })
     },
    
    checkToken: function(token)
    //const checkToken=(token)=>
        {
            jwt.verify(token, '+AsEcReT$!#PaTtErN-', function(err, decoded) {
                //console.log("Verified! "+decoded.foo) // bar
                if(!err)
                 {
                     return decoded.email;
                 }
                else {
                    return "";
                }
            });
        },
    
    checkEmail: function(email)
     {
         var re=/[[A-Za-z0-9]+[@]{1}[A-Za-z]+[.]{1}[A-Za-z]]/;
         if(re.test(email))
          {
              return(true);
          }
         else {
             return(false);
         }
     }
}
