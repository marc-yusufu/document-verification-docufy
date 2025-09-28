import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';
import './WorkerSignUp.css';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface WorkerFormData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    gender: string;
    password: string;
    confirmPassword: string;
    role: string;
    department: string;
    branch_id: string;
}

function WorkerSignUpScreen() {
    const [form, setForm] = useState<WorkerFormData>({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        gender: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: '',
        branch_id: '',
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch branches
    useEffect(() => {
        const fetchBranches = async () => {
            const { data, error } = await supabase
                .from('branches')
                .select('branch_id, name');

            if (error) {
                console.error(error);
            } else {
                setBranches(data || []);
            }
        };
        fetchBranches();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const validateForm = () => {
        const {
            first_name,
            last_name,
            username,
            email,
            gender,
            password,
            confirmPassword,
            role,
            department,
            branch_id,
        } = form;

        if (
            !first_name ||
            !last_name ||
            !username ||
            !email ||
            !gender ||
            !password ||
            !confirmPassword ||
            !role ||
            !department ||
            !branch_id
        ) {
            return 'Please fill in all fields.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Invalid email format.';
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters.';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match.';
        }

        return null;
    };

    // Generate WorkerID
    const generateWorkerId = () => {
        let deptCode = form.department === 'Police' ? '01' : '02';
        let genderCode = form.gender === 'Male' ? '22' : '44';
        let roleCode =
            form.role === 'Officer'
                ? '234'
                : form.role === 'Supervisor'
                    ? '235'
                    : '236';
        let randomDigits = Math.floor(1000 + Math.random() * 9000);

        return `${deptCode}${genderCode}${roleCode}-${randomDigits}`;
    };

    const handleRegister = async () => {
        setError('');
        const formError = validateForm();
        if (formError) {
            setError(formError);
            return;
        }

        setLoading(true);

        try {
            // Step 1: Register in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;

            const userId = authData.user?.id;
            if (!userId) throw new Error('User ID not returned from Supabase Auth.');

            // Step 2: Generate custom Worker ID
            const workerId2 = generateWorkerId();

            // Step 3: Store metadata in workers table
            const { error: insertError } = await supabase.from('workers').insert([
                {
                    user_id: userId, // 🔗 link to Supabase Auth
                    first_name: form.first_name,
                    last_name: form.last_name,
                    username: form.username,
                    email: form.email,
                    gender: form.gender,
                    role: form.role,
                    department: form.department,
                    branch_id: form.branch_id,
                    worker_id_2: workerId2,
                },
            ]);

            if (insertError) throw insertError;

            alert(`Worker registered successfully! Worker ID: ${workerId2}`);
            navigate('/workers');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="worker-signup-container">
            <div className="worker-signup-left">
                <div className="worker-signup-header">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="worker-signup-logo" />
                    </Link>
                </div>

                <h2 className="worker-signup-title">Register Worker</h2>
                {error && <p className="worker-signup-error">{error}</p>}

                <div className="worker-signup-row">
                    <input
                        name="first_name"
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="worker-signup-input"
                    />
                    <input
                        name="last_name"
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="worker-signup-input"
                    />
                </div>

                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="worker-signup-input"
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="worker-signup-input"
                />

                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="worker-signup-input"
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <div className="worker-signup-row">
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="worker-signup-input"
                    />
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="worker-signup-input"
                    />
                </div>

                <div className="worker-signup-row">
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="worker-signup-input"
                    >
                        <option value="">Select Role</option>
                        <option value="Officer">Officer</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Clerk">Clerk</option>
                    </select>

                    <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="worker-signup-input"
                    >
                        <option value="">Select Department</option>
                        <option value="Police">Police</option>
                        <option value="Civic">Civic</option>
                    </select>
                </div>

                <select
                    name="branch_id"
                    value={form.branch_id}
                    onChange={handleChange}
                    className="worker-signup-input"
                >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                        <option key={b.branch_id} value={b.branch_id}>
                            {b.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="worker-signup-btn"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </div>
            <div className="worker-signup-right">
                <div className='flex justify-center items-center h-full w-full flex-col'>
                    <p className='text-white font-bold text-[28px]'>Already have an account?</p>
                    <p className='text-white text-[16px] p-5'>Proceed to login</p>
                    <Link to="/login">
                        <button className="p-2 w-[100px] transition bg-blue-600 rounded-2xl border-2 border-white text-white font-bold hover:bg-blue-800">
                            Login
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default WorkerSignUpScreen;
