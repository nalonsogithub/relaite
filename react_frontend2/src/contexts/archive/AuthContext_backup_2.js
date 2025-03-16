import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);  // Add state for admin

    useEffect(() => {
        // Check login status when the app loads
        fetch('api/check-login', {
            credentials: 'include' // Important for sessions/Cookies
        })
        .then(res => res.json())
        .then(data => {
            setIsLoggedIn(data.isLoggedIn);
            setIsAdmin(data.isAdmin);  // Set the admin state
        })
        .catch(err => console.error("Error checking login status:", err));
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Necessary for sessions/Cookies
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setIsAdmin(data.admin);  // Set the admin state
                return { success: true }; // Indicate success
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);  // Ensure admin state is reset
                return { success: false, message: data.message || 'Login failed' }; // Provide failure message
            }
        } catch (error) {
            console.error('Login request failed', error);
            setIsLoggedIn(false);
            setIsAdmin(false);  // Ensure admin state is reset
            return { success: false, message: error.message || 'An error occurred during login' }; // Provide error message
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);  // Ensure admin state is reset
        fetch('api/logout', {
            method: 'POST',
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setIsLoggedIn(false);
                setIsAdmin(false);  // Ensure admin state is reset
                console.log('DEBUG: Clearing Session');
                sessionStorage.clear();
                console.log('Successfully Logged Out');
            }
        })
        .catch(err => console.error("Logout failed:", err));
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
