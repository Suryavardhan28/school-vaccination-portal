import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const ProtectedLayout = () => {
    return (
        <>
            <Navbar />
            <Container maxWidth="xl">
                <Outlet />
            </Container>
        </>
    );
};

export default ProtectedLayout;
