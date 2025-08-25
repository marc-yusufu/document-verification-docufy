import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';

const supabase = createClient(
    import.meta.env.REACT_APP_SUPABASE_URL,
    import.meta.env.REACT_APP_SUPABASE_ANON_KEY
);

function WorkerLogin() {
    const [form, setForm] = useState({ workerId: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const validateForm = () => {
        const { workerId, password } = form;
        if (!workerId || !password) return 'Please fill in all fields.';

        // Example: ABC12341  (ABC = branch code, 1234 = random numbers, 1 = police flag)
        const workerPattern = /^[A-Z]{3}\d{4}[12]$/;
        if (!workerPattern.test(workerId)) {
            return 'Worker ID must be 3 letters (branch code), 4 digits, and end with 1 or 2.';
        }

        return null;
    };

    const handleLogin = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            // Create worker email in same pattern as signup
            const email = `worker${form.workerId}@gov.za`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: form.password,
            });

            if (error) throw error;

            // Store token/session if needed
            if (data.session?.access_token) {
                localStorage.setItem('token', data.session.access_token);
            }

            // Redirect based on role flag (last char of workerId)
            const roleFlag = form.workerId.slice(-1);
            if (roleFlag === '1') {
                navigate('/police-dashboard');
            } else {
                navigate('/home-affairs-dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Check your Worker ID and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full font-sans overflow-hidden">
            <div className="w-full md:w-1/2 flex flex-col justify-center px-12 py-10 bg-white z-10">
                <div className="flex justify-between items-start mb-10">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-10 object-contain" />
                    </Link>
                    <div className="flex gap-6 text-blue-600 font-medium text-sm">
                        <Link to="/services" className="hover:underline">Services</Link>
                        <Link to="/about" className="hover:underline">About</Link>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">Worker / Admin Login</h2>
                <p className="mb-6 text-gray-700">
                    Not a worker?{' '}
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">
                        Citizen Login
                    </Link>
                </p>

                {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

                <input
                    name="workerId"
                    placeholder="Worker ID (e.g., ABC12341)"
                    className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={form.workerId}
                    onChange={handleChange}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={form.password}
                    onChange={handleChange}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full py-3 rounded-2xl text-white font-semibold transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>

            <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-green-500 to-green-700"></div>
        </div>
    );
}

export default WorkerLogin;
