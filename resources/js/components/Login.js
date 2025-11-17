import React, { useState } from "react";
import axios from "axios";

export default function Login() {
    const [form, setForm] = useState({ username: "admin@urios.com", password: "admin" });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        try {
            await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
            const uname = (form.username || '').trim();
            const payload = { username: uname, email: uname.includes('@') ? uname : undefined, password: form.password };
            const res = await axios.post("/login", payload, { baseURL: '' });
            if (res.status === 200) {
                window.location.href = "/";
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setErrors(err.response.data.message || "Login failed");
            } else {
                setErrors("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <div className="login-header__inner" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center'}}>
                    <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:48,height:48,borderRadius:9999,background:'#111',color:'#fff'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block'}}>
                            <path d="M16 11V7a4 4 0 00-8 0v4" />
                            <path d="M5 20h14a1 1 0 001-1v-6a4 4 0 00-4-4H8a4 4 0 00-4 4v6a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <a href="#" className="login-title">Student & Faculty Profile</a>
                    <p className="login-subtitle">Management System</p>
                </div>
            </header>

            <main className="login-main">
                <div className="login-card">
                    <div className="login-card__body">
                        <h2 className="login-card__title">Welcome Back</h2>
                        <p className="login-card__subtitle">Login to access your dashboard</p>

                        {errors && <div className="login-error">{errors}</div>}

                        <form onSubmit={submit} className="login-form">
                            <div className="login-field">
                                <label className="login-label">Username</label>
                                <div className="login-input__wrapper">
                                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',display:'flex',alignItems:'center'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a4 4 0 100 8 4 4 0 000-8z" />
                                        <path fillRule="evenodd" d="M.458 16.042A8 8 0 0110 12a8 8 0 019.542 4.042A1 1 0 0118.558 18H1.442a1 1 0 01-.984-1.958z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="admin@urios.com"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="login-input"
                                    required
                                />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Password</label>
                                <div className="login-input__wrapper">
                                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',display:'flex',alignItems:'center'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3z" />
                                        <path d="M5 11v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="login-input"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'#6B7280',background:'transparent',border:'none',cursor:'pointer',fontSize:12}}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                                </div>
                            </div>

                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? "Logging in..." : "LOGIN"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
