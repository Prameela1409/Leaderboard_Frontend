import React, { createContext, useState, useEffect } from 'react';

// Create a context for authentication state
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false); // to track if user is admin
    const [user, setUser] = useState(null); // to store user info (email, etc.)

    // On page load, we can try to load the user state from local storage
    useEffect(() => {
        const storedIsAdmin = localStorage.getItem('isAdmin');
        const storedUser = localStorage.getItem('user');
        
        if (storedIsAdmin && storedUser) {
            setIsAdmin(JSON.parse(storedIsAdmin));
            setUser(storedUser);
        }
    }, []);

    // Function to log in the user
    const login = (userInfo, isAdminStatus) => {
        setUser(userInfo);
        setIsAdmin(isAdminStatus);
        localStorage.setItem('user', userInfo);
        localStorage.setItem('isAdmin', JSON.stringify(isAdminStatus));
    };

    // Function to log out the user
    const logout = () => {
        setIsAdmin(false);
        setUser(null);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
    };

    // Provide the auth state and functions to children
    return (
        <AuthContext.Provider value={{ isAdmin, setIsAdmin, user, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
