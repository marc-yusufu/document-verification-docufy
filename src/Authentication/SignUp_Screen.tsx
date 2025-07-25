import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthenticationModal from './AuthenticationModal';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseconfig';
import { isValidSouthAfricanID } from './Utilities/validateID';
import logo from '../assets/images/logopng.png';

interface FormData {
  name: string;
  surname: string;
  idNumber: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function SignUpScreen() {
  const [form, setForm] = useState<FormData>({
    name: '',
    surname: '',
    idNumber: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCredentialRef, setUserCredentialRef] = useState<any>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const { name, surname, idNumber, phone, password, confirmPassword } = form;
    if (!name || !surname || !idNumber || !phone || !password || !confirmPassword)
      return 'Please fill in all fields.';
    if (!/^\d{13}$/.test(idNumber)) return 'ID Number must be 13 digits.';
    if (!isValidSouthAfricanID(idNumber)) return 'Invalid South African ID Number.';
    if (!/^\+?\d{10,15}$/.test(phone)) return 'Invalid phone number.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const fakeEmail = `${form.idNumber}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, form.password);
      setUserCredentialRef(userCredential);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!userCredentialRef) {
      setError('User not found.');
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, 1000));
      if (code === '123456') {
        const user = userCredentialRef.user;
        const { name, surname, idNumber, phone } = form;
        await setDoc(doc(db, 'profiles', user.uid), {
          name,
          surname,
          id_number: idNumber,
          phone_number: phone,
          createdAt: new Date(),
        });
        setIsModalOpen(false);
        navigate('/login');
      } else {
        setError('Incorrect code.');
      }
    } catch {
      setError('Verification error.');
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
      <div className="flex flex-col justify-center p-12 w-full md:w-1/2 bg-white">
        <div className="flex justify-between mb-8 items-start">
          <div>
            <Link to="/">
              <img src={logo} alt="Logo" className="h-10 mb-2 object-contain" />
            </Link>
            
          </div>
          <div className="flex gap-6 text-blue-600 font-medium text-sm">
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Create new account.</h2>
        <p className="mb-6 text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        <div className="flex gap-4 mb-4">
          <input
            name="name"
            placeholder="Name"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="surname"
            placeholder="Surname"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            value={form.surname}
            onChange={handleChange}
          />
        </div>
        <input
          name="idNumber"
          placeholder="ID Number"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          value={form.idNumber}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone (+27...)"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          value={form.phone}
          onChange={handleChange}
        />
        <div className="flex gap-4 mb-4">
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            value={form.password}
            onChange={handleChange}
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 rounded-2xl text-white font-semibold transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      <div className="hidden md:block w-1/2 bg-blue-600"></div>

      <AuthenticationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerifyCode}
        onResend={() => console.log('Resend code')}
      />
    </div>
  );
}

export default SignUpScreen;
