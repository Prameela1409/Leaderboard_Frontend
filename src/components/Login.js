import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setIsAdmin, setUser } = useContext(AuthContext);
    const navigate = useNavigate(); // For navigation

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/login', { // Adjust the URL as necessary
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setIsAdmin(data.isAdmin); // Set the admin flag
                setUser(data.email); // Set user info
                setMessage('Login successful!');
                navigate('/'); // Redirect to dashboard or another page
            } else {
                setMessage(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            setMessage('Error logging in.');
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '10px', width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', width: '100%' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: '10px',
                        width: '100%',
                        background: '#007BFF',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Login
                </button>
            </form>
            {message && (
                <p
                    style={{
                        marginTop: '20px',
                        color: message.includes('successful') ? 'green' : 'red',
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default Login;
