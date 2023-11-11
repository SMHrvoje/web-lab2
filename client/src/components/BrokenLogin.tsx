import {Button, Container, Form, Stack} from "react-bootstrap";
import {SubmitHandler, useForm} from "react-hook-form";
import React, {useContext} from "react";
import { SendRequest} from "../pages/HomePage.tsx";
import {AuthContext} from "./Layout.tsx";


const BrokenLogin =()=>{

    const{email,saveUser,logOut,secured}=useContext(AuthContext)!
    const[greska,setGreska]=React.useState("")
    const{register,resetField,getValues,setValue,handleSubmit,formState:{
        errors
    }}=useForm<SendRequest>(
        {
            defaultValues:{
                email:'',
                securityCode: '',
                secure:true
            }
        }
    );

    React.useEffect(()=>{
        setValue('secure',secured)
    },[secured])
    const getData:SubmitHandler<SendRequest>=async (data:SendRequest)=>{
        if(data.secure===true){
                fetch('/api/login',{
                    method:'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    credentials:"include",
                    body:JSON.stringify(data)
                }).then(res=> {
                    if(res.status===429){

                        setGreska("Previše zahtjeva u zadanom vremenu")
                        return Promise.reject("error")
                    }
                   else return res.json()
                }).then(res=>{
                    if(res.error){
                        setGreska(res.message)
                    }
                    else{
                        setGreska("")
                        saveUser(res.email)
                        resetField("email")
                        resetField("securityCode")

                    }

                }).catch(()=>{})

        }
        else{
                fetch('/api/login/notsecure',{
                    method:'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    credentials:"include",
                    body:JSON.stringify(data)
                }).then(res=>res.json()
                ).then(res=>{
                    if(res.error){
                        setGreska(res.message)
                    }
                    else{
                        setGreska("")
                        saveUser(res.email)
                        resetField("email")
                        resetField("securityCode")

                    }
                }).catch(err=>{console.log(err)})

        }

    }

    const logOut2=async ()=>{
        if(getValues("secure")===false){
          logOut()
        }
        else{
            fetch('/api/logout',{
                method:"GET",
                credentials:"include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }).then(()=>logOut())
        }
    }
    const forceLogout=()=>{

            fetch('/api/logout',{
                method:"GET",
                credentials:"include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }).then(()=>logOut())

    }
    return(
        <>

            <Container className="mt-5 justify-content-center">
                <h4 >Broken authentication</h4>
                <p>
                    Podaci za ulaz su <b>john.doe@gmail.com , Fer21 </b>
                   Jedna od ranjivosti loše autentifikacije su loše poruke sustava. Sustav ispisuje pogreške poput "korisnik ne postoji"
                    ili "pogrešna lozinka" što daje informaciju napadaču. Sustav je ranjiv na brute force napade. Preglednik ima
                    pristup kolačiću sesije nakon što se korisnik prijavi. Kolačić se može ukrasti i napadač se može predstavljati kao
                    taj korisnik zbog kolačića. Nakon prijave, pritisnite <b>tipku za prikaz kolačića</b>, kada je sustav ranjiv tamo će pisati
                    connection.sid vrijednost. Također još jedna ranjivost jest loša invalidacija sesije. Korisnik će nakon odjave biti
                    prividno odjavljen, ali će sesija i dalje postojati. U sučelju će se činiti da više nije prijavljen. Refreshanjem
                    stranice možemo potvrditi da je ostao prijavljen. Tipka force log out je tu da se možemo prisilno odjaviti
                    iz takvog slučaja jer nebi više mogli drugo isprobavati. Kada je sigurnost upaljena sustav drugačije reagira na sve navedene
                    situacije. Sustav ispisuje grešku "unešeni podaci nisu ispravni" koja ne daje napadaču informacije. Ograničen
                    je broj pokušaja prijava sa svake ip adrese u vremenskom intervalu i tako onemogućen brute force napad. Za demonstraciju
                    unesite pogrešne podatke i pritisnite login zaredom <b>barem 6 puta</b> i stavit će vas se na odbijanje na neko vrijeme.
                    Na sigurnom načinu ne može se pristupiti connection.sid informaciji iz skripte. Klikom na tipku za prikaz kolačića vidjet
                    će se da nedostaje connection.sid. Odjava u sigurnom načinu na ispravan način završava sesiju. Postoji još puno
                    stvari koje spadaju pod slabu autentifikaciju, ali nije navedeno koliko ih treba implementirati.
                </p>
                <Form onSubmit={handleSubmit(getData)}>
                    <Stack direction="horizontal" gap={5} className="justify-content-center">
                        <Form.Group>
                            <Form.Control className={errors.email && "border-warning"} disabled={email!==""} placeholder="email" {...register('email',{required:true})}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Control type="password" className={errors.securityCode && "border-warning"} disabled={email!==""} placeholder="sigurnosni kod" {...register('securityCode',{required:true})}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Switch
                                label="sigurno"
                                {...register('secure')}
                                disabled={email!==""}
                            />
                        </Form.Group>
                        <Button disabled={email!==""} type="submit">login</Button>
                    </Stack>
                </Form>
                <Container className="text-center mt-2 mb-3">
                    {greska!=="" && greska}
                </Container>
                {email &&  <>
                    <h4 className="text-center mt-4">Logged in as {email}</h4>
                    <Container className="justify-content-center text-center">
                        <Button onClick={logOut2}>log out</Button>
                        {!secured && <Button className="mx-2" onClick={forceLogout}>force log out</Button>}
                    </Container>
                    {email!=="" && <>
                    <Container className="text-center">
                        <Button className="mt-3" onClick={()=>{
                            alert(document.cookie)
                        }}>
                        pokaži kolačiće
                    </Button>
                    </Container>
                    </>}
                </>

                }

            </Container>

        </>
    )
}

export default BrokenLogin