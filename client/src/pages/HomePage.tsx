import {Button, Container, Form, Stack} from "react-bootstrap";
import React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import BrokenLogin from "../components/BrokenLogin.tsx";

export type PersonData={
    email:string,
    firstname:string,
    lastname:string,
    address:string,
    number:string
}
export type SendRequest={
    email:string,
    securityCode:string,
    secure:boolean
}


const HomePage=()=>{
    const{register,handleSubmit

    }=useForm<SendRequest>(
        {
            defaultValues:{
                email:'',
                securityCode: '',
                secure:false
            }
        }
    );
    const [personData,setPersonData]=React.useState<PersonData[]>()

    const getData:SubmitHandler<SendRequest>=async (data:SendRequest)=>{
        try{
            fetch('/api',{
                method:'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials:"include",
                body:JSON.stringify(data)
            }).then(res=>res.json()).then(res=> {
                console.log(res)
                setPersonData(res)
            })
        }
        catch (err){
            console.log("greska")
        }

    }
    return (
        <>
            <Container className="text-center mt-4 justify-content-center">
                <h3>Vulnerabilities</h3>
            </Container>
            <Container className="mt-5 justify-content-center">
                <h4 >SQL injection</h4>
                <p>Ranjivost se može upaliti ili ugasiti. Pretraga vraća podatke za korisnika čiji podaci se unesu.
                Primjer korisnika jest <b>john.doe@gmail.com , Fer21</b> . Ako je omogućen SQL injection, može se iskoristiti tautologija i upisati
                    <b>' or 1=1;--</b> . Odavde vidimo koliko stupaca se nalazi u upitu. To će vratiti podatke za sve korisnike. Mogu se raditi i union upiti, no prvo je potrebno saznati kako
                    izgleda tablica iz koje se pretražuju podaci. Prvo unosimo <b>' UNION SELECT schema_name, null,null,null,null FROM information_schema.schemata;--</b> kako bismo pronašli koje sheme imamo.
                    Zatim unosimo <b>' UNION SELECT table_name, null, null,null,null FROM information_schema.tables WHERE table_schema = 'public';--</b> kako bismo
                    saznali koje tablice se nalaze u našoj shemi. Zatim se može upisati <b>' UNION SELECT column_name, null, null, null, null FROM information_schema.columns WHERE table_name = 'emailperson';--</b>
                    kako bi pronašli koje stupce sadrži tablica. U bazi se nalazi samo jedna tablica. Ako je uključena sigurnost, radi se
                    sanitizacija ulaza kako se više ne bi dopuštali takvi upiti. Za ovu aplikaciju postoji zasebni user kojem su ograničene ovlasti samo na čitanje iz tablica.
                </p>
                    <Form onSubmit={handleSubmit(getData)}>
                        <Stack direction="horizontal" gap={5} className="justify-content-center">
                        <Form.Group>
                            <Form.Control  placeholder="email" {...register('email')}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Control type="password" placeholder="sigurnosni kod" {...register('securityCode')}/>
                        </Form.Group>
                            <Form.Group>
                                <Form.Switch
                                label="sigurno"
                            {...register('secure')}
                                />
                            </Form.Group>
                            <Button type="submit">traži</Button>
                        </Stack>
                    </Form>
                {Array.isArray(personData) && personData.map((person,index)=>(
                    <Stack direction="horizontal" className="justify-content-center mt-3" gap={4} key={index}>
                        <span>
                            {person.email}
                        </span>
                        <span>
                            {person.firstname}
                        </span>
                        <span>
                            {person.lastname}
                        </span>
                        <span>
                            {person.address}
                        </span>
                        <span>
                            {person.number}
                        </span>
                    </Stack>
                ))}
            </Container>
            <BrokenLogin/>

        </>
    )
}

export default HomePage
