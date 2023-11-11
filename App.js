const express = require('express');
const app = express();
const port = 3000;
const pool=require('./dbconfig')
const cors = require("cors");
const session = require('express-session');
const rateLimit=require('express-rate-limit')
const {rows} = require("pg/lib/defaults");
const path = require("path");
const bcrypt = require("bcrypt")
const saltRounds = 10

app.use(cors());
app.use(express.json())
app.use(
    session({
        secret: 'ygreg5g98hegp9bherb938ho9rhjv', // Change this to a strong, random secret key
        resave: false,
        saveUninitialized: true,
        cookie:{
            maxAge:1000*60*60*2
        }
    })
);
app.use(express.static(path.join(__dirname, '/client/dist')));


const rateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Prešli ste limit pokušaja prijave u određenom vremenu.",
    headers: true,
});



app.post("/api",async (req,res)=>{
    const email=req.body.email;
    const securityCode=req.body.securityCode;
    const secure=req.body.secure;

    try{
        if(secure){
            const data=await pool.query('select email,firstname,lastname,address,number from EmailPerson where email=$1 and passcode=$2',[email,securityCode])
            console.log(data.rows);
            if(data.length>0){
                res.send(data.rows)
            }
            else{
                res.end()
            }
        }
        else{
            var query = `SELECT email,firstname,lastname,address,number FROM EmailPerson where email='${email}' and passcode='${securityCode}'`;
            const data=await pool.query(query)
            console.log(data.rows)
           if(data.length>0){
               res.send(data.rows)
           }
           else{
               res.end()
           }
        }
    }
    catch (err){
        res.status(500).send({
            message: "Greška pri pristupanju"
        })
    }
})

app.post('/api/login',rateLimitMiddleware,async (req, res) => {
    if(req.session?.email){
        res.json({
            message:"already logged in"
        })
    }
    else{

        const data = (await pool.query("select email,securityword from EmailPerson where email=$1",[req.body.email])).rows
        if(data.length ===1){
            const hash=data[0].securityword
            const rez=await bcrypt.compare(req.body.securityCode,hash);
            if(rez===true){
                let session=req.session
                session.email=req.body.email
                session.secure=req.body.secure
                res.send({message:"logged in",
                    email:req.body.email,
                    secure:req.body.secure,
                    error:false
                })
            }
            else{
                res.status(200).json({message:"unešeni podaci nisu ispravni",error:true})
            }
        }
        else{
            res.status(200).json({message:"unešeni podaci nisu ispravni",error:true})
        }
    }


})
app.post('/api/login/notsecure',async(req, res) => {
    if(req.session?.email){
        res.send({
            message:"already logged in"
        })
    }
    else{

        const data = (await pool.query("select email,securityword from EmailPerson where email=$1",[req.body.email])).rows
        if(data.length ===0 ) {
            res.status(200).send({message:"ne postoji korisnik sa navedenim mailom",error:true})
        }
        else if (data.length===1){
            const hash=data[0].securityword
            const rez=await bcrypt.compare(req.body.securityCode,hash);
            if(rez===true){

            let session=req.session
            session.email=req.body.email
            session.secure=req.body.secure
            session.cookie.httpOnly=false

            res.send({message:"logged in",
                email:req.body.email,
                secure:req.body.secure
            })
        }
            else{
                res.status(200).send({message:"pogrešna lozinka za navedenog korisnika",error:true})

            }
        }
    }


})
app.get('/api/checkLogged', (req, res) => {
    if(req.session.email){
        res.json(
            {
                message:"logged in",
                email:req.session.email,
                secure:req.session.secure
            }
        )
    }
    else{
        res.json(
            {
                message:"not logged in"
            }
        )
    }
})
app.get('/api/logout', (req, res) => {
    req.session.destroy()
    res.json({
        message:"logged out"
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
