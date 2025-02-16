// src/components/Login.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { TextField, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LottieAnimation from './LottieAnimation';
import './styles.css'; // Import your CSS file

const Login = ({ onLoginSuccess }) => {
    const [blastAnimation, setBlastAnimation] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setIsAdmin, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogout = () => {
        setIsAdmin(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        setMessage('Logged out successfully.');
        navigate('/'); // Redirect to home or login page
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setIsAdmin(data.isAdmin);
                setUser(data.email);
                localStorage.setItem('isLoggedIn', 'true');
                setMessage('Login successful!');
                setBlastAnimation(true); // Trigger animation on successful login
                onLoginSuccess();
            } else {
                setMessage(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            setMessage('Error logging in. Please try again later.');
            console.error(error);
        }
    };

    return (
        <>
            <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, height: '100vh' }}>
                <AppBar position="static" style={{ marginBottom: '20px' }}>
                    <Toolbar>
                        <img
                            src="https://th.bing.com/th/id/OIP.1VsevbVhxjiXu5IHXFIkSgAAAA?rs=1&pid=ImgDetMain"
                            alt="Logo"
                            style={{ marginRight: '10px', borderRadius: '50%' }}
                            width="50"
                            height="50"
                        />
                        <Typography variant="h6" style={{ flexGrow: 1, color: 'white', fontWeight: 'bolder' }}>
                            Vishnu Institute of Technology
                        </Typography>
                        <div style={{ padding: '10px', textAlign: 'center' }}>
                            <motion.button
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: '#9B0F4A',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 0 10px #9B0F4A, 0 0 20px #9B0F4A, 0 0 30px #9B0F4A',
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Logout
                            </motion.button>
                        </div>
                    </Toolbar>
                </AppBar>
                <div className={`container ${blastAnimation ? 'blast-animation' : ''}`} style={{ marginTop: "-20px", flex: 1, position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                        overflow: "hidden",
                        perspective: "1000px",
                    }}>
                        <div style={{
                            transform: "rotateY(10deg)",
                            transition: "transform 0.5s ease-in-out",
                        }}>
                            <LottieAnimation
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    </div>

                    <div
                        className="incontainer"
                        style={{
                            height: '8%',
                            width: '40%',
                            position: "relative",
                            zIndex: 1,
                            padding: "5% 3% 16% 5%",
                            textAlign: "center",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                            borderRadius: "10px",
                            background: "rgba(255, 255, 255, 0.8)",
                            transition: "transform 0.3s ease",
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Typography variant="h4" style={{ marginBottom: '20px' }}>Login</Typography>
                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            <TextField
                                label="Email"
                                type="email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ marginBottom: '15px', width: '100%' }}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ marginBottom: '15px', width: '100%' }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                style={{ width: '100%', padding: '10px', backgroundColor: '#9B0F4A' }}
                            >
                                Login
                            </Button>
                        </form>
                        {message && (
                            <Typography
                                style={{
                                    marginTop: '20px',
                                    color: message.includes('successful') ? 'green' : 'red',
                                }}
                            >
                                {message}
                            </Typography>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;