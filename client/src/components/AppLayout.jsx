import { useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import { Sidebar } from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router";
import Footer from "./Footer";

const AppLayout = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const openSidebar = useCallback(() => setOpen(true), []);
    const closeSidebar = useCallback(() => setOpen(false), []);
    const handleLogout = useCallback(async () => {
        await logout();
        navigate("/login");
    }, [logout, navigate]);

    return (
        <div className="min-h-screen flex flex-col bg-base-100">
            <Navbar 
                sidebarOpen={open}
                onMenuClick={openSidebar}
            />
            <Sidebar
                open={open}
                onClose={closeSidebar}
                user={user}
                onLogout={handleLogout}
            />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;