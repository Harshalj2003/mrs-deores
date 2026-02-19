import React from "react";
import { Link } from "react-router-dom";
import type { User } from "../types/auth.types";

interface NavbarProps {
    currentUser?: User;
    logOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, logOut }) => {
    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 text-text shadow-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to={"/"} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white font-serif text-primary">MRS.DEORE's</span>
                </Link>

                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        {currentUser ? (
                            <>
                                <li>
                                    <Link to={"/profile"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
                                        {currentUser.username}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={"/orders"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
                                        My Orders
                                    </Link>
                                </li>
                                <li>
                                    <a href="/login" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0" onClick={logOut}>
                                        LogOut
                                    </a>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to={"/login"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to={"/register"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
