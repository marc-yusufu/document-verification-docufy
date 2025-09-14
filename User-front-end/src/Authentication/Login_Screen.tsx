import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

function LoginScreen() {
  const [form, setForm] = useState({ idNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const { idNumber, password } = form;
    if (!idNumber || !password) return 'Please fill in all fields.';

    const isID = /^\d{13}$/.test(idNumber);
    const isPassport = /^A\d{7}$/.test(idNumber);

    if (!isID && !isPassport) {
      return 'Enter a valid SA ID (13 digits) or Passport (A followed by 7 digits).';
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
      // Same email pattern as signup
      const email = `user${form.idNumber}@gmail.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (error) throw error;

      // Save session token if needed
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
      }

      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your ID/Passport and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <div className="flex  mx-auto my-auto w-[80%] h-[80%]">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-12 py-10 bg-white z-10 rounded-s-[25px] shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-10 object-contain" />
            </Link>
            <div className="flex gap-6 text-blue-600 font-medium text-sm">
              <Link to="/services" className="hover:underline">Services</Link>
              <Link to="/about" className="hover:underline">About</Link>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-7">Welcome back</h2>

          {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

          <input
            name="idNumber"
            placeholder="ID Number or Passport"
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            value={form.idNumber}
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

        <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-e-[25px] shadow-2xl">
            <div className='flex justify-center items-center h-full w-full flex-col'>
              <p className='text-white font-bold text-[28px]'>Don't have an account?</p>
              <p className='text-white text-[16px] p-5'>Sign up to get started!</p>
              <Link to="/signup">
                  <button className="p-2 w-[100px] transition bg-blue-600 rounded-2xl border-2 border-white text-white font-bold hover:bg-blue-800">
                    Sign up
                </button>
              </Link>

          </div>
        </div>
      </div>

    </div>
  );
}

export default LoginScreen;
