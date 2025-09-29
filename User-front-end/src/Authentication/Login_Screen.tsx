import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/logopng.png';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

function LoginScreen() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!form.identifier || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      let email = form.identifier.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isID = /^\d{13}$/.test(email);
      const isPassport = /^A\d{7}$/.test(email);
      const isPhone = /^\+?\d{10,15}$/.test(email);

      if (isID || isPassport) {
        email = `user${email}@gmail.com`;
      } else if (isPhone) {
        const { data: userRow, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('phone', email)
          .maybeSingle();

        if (lookupError || !userRow) {
          throw new Error('No account found with this phone number.');
        }

        email = userRow.email;
      } else if (!isEmail) {
        throw new Error('Enter a valid Email, Phone, ID or Passport.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (error) throw error;

      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
      }

      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-12 py-10 bg-white z-10">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
        {/* Top bar with logo + links */}
>>>>>>> Stashed changes
=======
        {/* Top bar with logo + links */}
>>>>>>> Stashed changes
        <div className="flex justify-between items-start mb-10">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 object-contain" />
          </Link>
          <div className="flex gap-6 text-blue-600 font-medium text-sm">
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        </div>

=======
        </div>

        {/* Heading */}
>>>>>>> Stashed changes
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="mb-6 text-gray-700">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>

<<<<<<< Updated upstream
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
=======
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="mb-6 text-gray-700">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        {/* Error message */}
        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

=======
        {/* Error message */}
        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

>>>>>>> Stashed changes
        {/* Identifier */}
        <input
          name="identifier"
          placeholder="Email, Phone, ID or Passport"
          className={`w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 text-gray-900 ${error && !form.identifier
            ? 'border-2 border-red-500'
            : 'focus:ring-blue-500'
            }`}
          value={form.identifier}
          onChange={handleChange}
        />

        {/* Password with toggle */}
        <div className="relative w-full mb-4">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 text-gray-900 pr-10 ${error && !form.password
              ? 'border-2 border-red-500'
              : 'focus:ring-blue-500'
              }`}
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

<<<<<<< Updated upstream
        {/* Forgot password */}
        <div className="flex justify-end mb-6">
          <Link
            to="/forgot-password"
            className="text-blue-600 text-sm hover:underline"
          >
            Forgot Password?
          </Link>
=======
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
>>>>>>> Stashed changes
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-2xl text-white font-semibold transition ${loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
      {/* Right half gradient */}
>>>>>>> Stashed changes
=======
      {/* Right half gradient */}
>>>>>>> Stashed changes
      <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700"></div>
    </div>
  );
}

export default LoginScreen;
