const express = require('express');
const app = express();
const port = 3000;
const pool=require('./dbconfig')
const cors = require("cors");
const session = require('express-session');
const rateLimit=require('express-rate-limit')
const {rows} = require("pg/lib/defaults");
const path = require("path");

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

    console.log(req.body)
    try{
        if(secure){
            const data=await pool.query('select email,firstname,lastname,address,number from EmailPerson where email=$1 and securityword=$2',[email,securityCode])
            res.json(data.rows)
            console.log("tu")
        }
        else{
            var query = `SELECT email,firstname,lastname,address,number FROM EmailPerson where email='${email}' and securityword='${securityCode}'`;
            const data=await pool.query(query)
            res.json(data.rows)
        }
    }
    catch (err){
        console.log(err)
        res.status(500).json({
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
        if(data.length ===1 && data[0].securityword===req.body.securityCode){
            let session=req.session
            session.email=req.body.email
            session.secure=req.body.secure
            console.log(req.session)
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


})
app.post('/api/login/notsecure',async(req, res) => {
    if(req.session?.email){
        res.send({
            message:"already logged in"
        })
        res.send()
    }
    else{

        const data = (await pool.query("select email,securityword from EmailPerson where email=$1",[req.body.email])).rows
        if(data.length ===0 ) {
            res.status(200).send({message:"ne postoji korisnik sa navedenim mailom",error:true})
        }
        else if (data.length===1 && data[0].securityword!==req.body.securityCode ){
            res.status(200).send({message:"pogrešna lozinka za navedenog korisnika",error:true})
        }
        else if(data.length===1 && data[0].securityword===req.body.securityCode){
            let session=req.session
            session.email=req.body.email
            session.secure=req.body.secure
            session.cookie.httpOnly=false

            console.log(req.session)
            res.send({message:"logged in",
                email:req.body.email,
                secure:req.body.secure
            })
        }
    }


})
app.get('/api/checkLogged', (req, res) => {
    console.log("check")
    console.log(req.sessionID)
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
