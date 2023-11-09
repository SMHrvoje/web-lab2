import {Container, Navbar} from "react-bootstrap";


const Header =()=>{

    return(
        <Navbar className="bg-success-subtle">
            <Container className="justify-content-center">
                <Navbar.Brand><h2>lab2 security</h2></Navbar.Brand>
            </Container>
        </Navbar>
    )
}
export default Header