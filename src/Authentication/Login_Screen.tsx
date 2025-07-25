import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { isValidSouthAfricanID } from './Utilities/validateID';
import logo from '../assets/images/logopng.png';

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
    if (!/^\d{13}$/.test(idNumber)) return 'ID must be 13 digits.';
    if (!isValidSouthAfricanID(idNumber)) return 'Invalid South African ID.';
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
      const fakeEmail = `${form.idNumber}@example.com`;
      await signInWithEmailAndPassword(auth, fakeEmail, form.password);
      navigate('/home');
    } catch {
      setError('Login failed. Check ID and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
      <div className="flex flex-col justify-center p-12 w-full md:w-1/2 bg-white">
        <div className="flex justify-between mb-8 items-start">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 mb-2 object-contain" />
          </Link>
          <div className="flex gap-6 text-blue-600 font-medium text-sm">
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="mb-6 text-gray-700">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        <input
          name="idNumber"
          placeholder="ID Number"
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
          className={`w-full py-3 rounded-2xl text-white font-semibold transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <div className="hidden md:block w-1/2 bg-blue-600"></div>
    </div>
  );
}

export default LoginScreen;
