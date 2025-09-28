// WorkerLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';
import './WorkerLogin.css';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

function WorkerLogin() {
    const [form, setForm] = useState({ workerId: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const workerId = localStorage.getItem('workerId');
        if (workerId) navigate('/dashboard');
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async () => {
        if (!form.workerId || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Find worker by Worker ID
            const { data: worker, error: workerError } = await supabase
                .from('workers')
                .select('email, worker_id_2, role')
                .eq('worker_id_2', form.workerId)
                .maybeSingle();

            if (workerError) throw workerError;
            if (!worker) {
                setError('Worker ID not found.');
                setLoading(false);
                return;
            }

            // Step 2: Log in via Supabase Auth using worker's email
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: worker.email,
                password: form.password,
            });

            if (signInError) {
                setError('Invalid Worker ID or Password.');
                setLoading(false);
                return;
            }

            // Step 3: Save session + redirect
            localStorage.setItem('workerId', worker.worker_id_2);
            localStorage.setItem('role', worker.role);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="worker-login-container">
            <div className="worker-login-left">
                <div className="worker-login-header">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="worker-login-logo" />
                    </Link>
                    <div className="worker-login-links">

                        <Link to="/forgot-password" className="worker-login-link">
                            Forgot Password
                        </Link>
                    </div>
                </div>

                <h2 className="worker-login-title">Worker Login</h2>
                {error && <p className="worker-login-error">{error}</p>}

                <input
                    name="workerId"
                    placeholder="Worker ID (e.g., 0122234-8934)"
                    className="worker-login-input"
                    value={form.workerId}
                    onChange={handleChange}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="worker-login-input"
                    value={form.password}
                    onChange={handleChange}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="worker-login-btn"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
            <div className="worker-login-right">
                <div className='flex justify-center items-center h-full w-full flex-col'>
                    <p className='text-white font-bold text-[28px]'>Don't have an account?</p>
                    <p className='text-white text-[16px] p-5'>Register as a worker</p>
                    <Link to="/register">
                        <button className="p-2 w-[100px] transition bg-blue-600 rounded-2xl border-2 border-white text-white font-bold hover:bg-blue-800">
                            Register
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default WorkerLogin;
