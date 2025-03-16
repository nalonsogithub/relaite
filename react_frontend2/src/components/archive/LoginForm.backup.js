import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import '../styles/login_styles.css'; // Adjust the path based on your project structure
import styles from '../styles/login_styles.module.css';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, logout } = useAuth(); // logout seems unused, consider removing if not needed
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const check_status = await login(email, password);
        if (check_status.success) {
            navigate('/co-pilot');
        } else {
            navigate('/failed-login');
        }
    };

    const handleReturnHome = () => {
        navigate('/welcome');
    };

    const containerStyle = {
        backgroundColor: 'white'
    };

    if (isLoading) {
        return <LoadingOverlay />;
    }

    return (
    <div className={styles.rootContainer}>
        <div className={styles.loginContainer}>
            <h1>Login - HBB</h1> {/* Ensure this is centered as well */}
            <form id="loginForm" onSubmit={handleSubmit}>
                <div className={styles.centeredContainerLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className={styles.submitButton}>Submit</button>
                </div>
            </form>
        </div>
    </div>		
    );
}

export default LoginForm;
