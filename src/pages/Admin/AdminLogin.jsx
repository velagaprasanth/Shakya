import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './admin.scss';

/**
 * AdminLogin Component
 * Handles admin authentication with email/password
 * Only allows shakyafurnitures@gmail.com to access the admin panel
 * Uses Supabase Auth service for secure login
 */
const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);

            // Only allow specific admin email
            if (email !== 'shakyafurnitures@gmail.com') {
                setError('Unauthorized email. Only shakyafurnitures@gmail.com can access admin panel.');
                return;
            }

            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (loginError) throw loginError;

            if (data.user.email !== 'shakyafurnitures@gmail.com') {
                await supabase.auth.signOut();
                setError('Unauthorized email. Only shakyafurnitures@gmail.com can access admin panel.');
                return;
            }

            onLoginSuccess();
        } catch (error) {
            console.error('Login error:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <h1>Admin Panel</h1>
                <p className="login-subtitle">Restricted Access - Authorized Users Only</p>
                
                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter admin email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-login"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
