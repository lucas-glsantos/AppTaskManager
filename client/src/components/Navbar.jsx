import { Link } from "react-router";
import { MenuIcon, PlusIcon } from "lucide-react";


const Navbar = ({ sidebarOpen = false, onMenuClick }) => {
    return (
        <header className="bg-base-300 border-b border-base-content/10">
            <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        aria-label="Abrir menu" 
                        aria-controls="app-sidebar" 
                        aria-expanded={sidebarOpen} 
                        onClick={onMenuClick} 
                        className="btn btn-ghost btn-square"
                    >
                        <MenuIcon className="size-5" />
                    </button>

                    <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
                        Task Manager
                    </h1>
                </div>
                
                <Link 
                    to="/create" 
                    className="btn btn-primary outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500">
                    <PlusIcon className="size-5" />
                    <span>Nova Tarefa</span>
                </Link>
            </div>
        </header>
    )
};

export default Navbar;