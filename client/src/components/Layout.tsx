import Header from "./Header.tsx";
import React from "react";
import {Container} from "react-bootstrap";


interface IAuthContext{
    email:string,
    saveUser:(mail:string)=>void,
    logOut:()=>void,
    setSecured:(value:boolean)=>void,
    secured:boolean
}
export const AuthContext=React.createContext<IAuthContext | undefined>(
    undefined
)



const Layout= ({children}:{children:React.ReactNode})=>{
    const [email,setEmail]=React.useState("")
    const [secure,setSecure]=React.useState(true)


    const saveUser=React.useCallback((mail:string)=>{
            setEmail(mail);
            },[])
    const logOut=React.useCallback(()=>{
        setEmail("");
    },[])
    const setSecured=React.useCallback((value:boolean)=>{
        setSecure(value);
    },[])

    const contextValues=React.useMemo(()=>(
        {
            email,
            saveUser,
            logOut,
            setSecured,
            secured:secure
        }
    ),[email,saveUser,secure,setSecure])
    React.useEffect(()=>{
         fetch('/api/checkLogged',{
             method:"GET",
             credentials:"include",
             headers: {
                 "Content-Type": "application/json",
                 "Accept": "application/json"
             },
        }).then(res=>res.json()).then(res=>{
             console.log(res)
             if(res.message=="logged in"){
                 setEmail(res.email)
                 setSecure(res.secure)
         }
         })
    },[])

    return(
        <>
        <Header/>
            <AuthContext.Provider value={contextValues}>
                {children}
                <Container className="my-4"></Container>
            </AuthContext.Provider>
        </>
    )
}

export default Layout