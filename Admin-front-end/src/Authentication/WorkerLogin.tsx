import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';
import './WorkerLogin.css';
import TwoFAModal from './TwoFAModal';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
    console.log(`Send OTP ${otp} to email: ${email}`);
    // integrate actual email sending logic here
};

function WorkerLogin() {
    const [form, setForm] = useState({ workerId: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);
    const [currentWorker, setCurrentWorker] = useState<any>(null);

    const navigate = useNavigate();

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

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: worker.email,
                password: form.password,
            });

            if (signInError) {
                setError('Invalid Worker ID or Password.');
                setLoading(false);
                return;
            }

            // Open 2FA modal
            setCurrentWorker(worker);
            set2FAModalOpen(true);

            const otp = generateOTP();
            await supabase.from('worker_otps').insert({
                worker_id: worker.worker_id_2,
                otp,
                expires_at: new Date(new Date().getTime() + 5 * 60000),
            });

            await sendOtpEmail(worker.email, otp);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (code: string) => {
        if (!currentWorker) return;

        const { data } = await supabase
            .from('worker_otps')
            .select('*')
            .eq('worker_id', currentWorker.worker_id_2)
            .eq('otp', code)
            .maybeSingle();

        if (!data || new Date(data.expires_at) < new Date()) {
            alert('Invalid or expired OTP');
            return;
        }

        localStorage.setItem('workerId', currentWorker.worker_id_2);
        localStorage.setItem('role', currentWorker.role);
        set2FAModalOpen(false);
        navigate('/dashboard');
    };

    const handleResend2FA = async () => {
        if (!currentWorker) return;
        const otp = generateOTP();
        await supabase.from('worker_otps').insert({
            worker_id: currentWorker.worker_id_2,
            otp,
            expires_at: new Date(new Date().getTime() + 5 * 60000),
        });
        await sendOtpEmail(currentWorker.email, otp);
        alert('OTP resent!');
    };

    return (
        <div className="worker-login-container">
            <div className="worker-login-left">
                <div className="worker-login-header">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="worker-login-logo" />
                    </Link>
                    <div className="worker-login-links">
                        <Link to="/register" className="worker-login-link">
                            Register Worker
                        </Link>
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
            <div className="worker-login-right"></div>

            <TwoFAModal
                isOpen={is2FAModalOpen}
                onClose={() => set2FAModalOpen(false)}
                onVerify={handleVerify2FA}
                onResend={handleResend2FA}
            />
        </div>
    );
}

export default WorkerLogin;
