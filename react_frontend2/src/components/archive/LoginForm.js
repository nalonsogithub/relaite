// LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login_styles.module.css';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
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

    if (isLoading) {
        return <LoadingOverlay />;
    }

    return (
        <div className={styles.rootContainer}>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>Login - HBB</h1>
                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input 
                            type="text" 
                            id="email" 
                            name="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className={styles.inputField}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
