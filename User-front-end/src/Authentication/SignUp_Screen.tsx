import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/images/logopng.png';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

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
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const { name, surname, idNumber, phone, password, confirmPassword } = form;

    if (!name || !surname || !idNumber || !phone || !password || !confirmPassword)
      return 'Please fill in all fields.';

    // Check ID number or passport
    const isID = /^\d{13}$/.test(idNumber);
    const isPassport = /^A\d{7}$/.test(idNumber);

    if (!isID && !isPassport)
      return 'Please enter a valid SA ID (13 digits) or Passport (A followed by 7 digits).';

    if (!/^\+?\d{10,15}$/.test(phone))
      return 'Invalid phone number.';

    if (password.length < 8)
      return 'Password must be at least 8 characters.';

    if (password !== confirmPassword)
      return 'Passwords do not match.';

    return null;
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
      const email = `user${form.idNumber}@gmail.com`;
      const isID = /^\d{13}$/.test(form.idNumber);
      const columnToCheck = isID ? 'national_id_no' : 'passport_no';

      // 1️⃣ Check in citizens table
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq(columnToCheck, form.idNumber.trim())
        .ilike('last_name', form.surname.trim())
        .maybeSingle();

      if (citizenError) {
        setError('Failed to verify ID/Passport. Please try again.');
        setLoading(false);
        return;
      }

      if (!citizen) {
        setError('ID/Passport not found or surname does not match.');
        setLoading(false);
        return;
      }

      // 2️⃣ Create user in auth.users
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            surname: form.surname,
            idNumber: isID ? form.idNumber : null,
            passportNo: !isID ? form.idNumber : null,
            phone: form.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 3️⃣ Insert into public.users
      if (signUpData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            user_id: signUpData.user.id,
            national_id_no: isID ? form.idNumber : null,
            passport_no: !isID ? form.idNumber : null,
            phone: form.phone,
          }]);

        if (insertError) {
          setError(`User created but failed to link: ${insertError.message}`);
          setLoading(false);
          return;
        }
      }

      alert('Registration successful! Please check your email to confirm.');
      navigate('/login');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex h-screen w-screen font-sans ">
      <div className="flex  mx-auto my-auto w-[80%] h-[80%]">
          <div className="flex flex-col justify-center p-12 w-full md:w-1/2 bg-white rounded-s-[25px] shadow-2xl ">
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

          <h2 className="text-3xl font-bold mb-7">Create new account.</h2>

          {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

          <div className="flex gap-4 mb-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <input
              name="surname"
              placeholder="Surname"
              value={form.surname}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <input
            name="idNumber"
            placeholder="ID Number"
            value={form.idNumber}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />

          <input
            name="phone"
            placeholder="Phone (+27...)"
            value={form.phone}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />

          <div className="flex gap-4 mb-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-2xl text-white font-semibold transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        <div className="hidden  md:block w-1/2 bg-blue-600 rounded-e-[25px] shadow-2xl">
        <div className='flex justify-center items-center h-full w-full flex-col'>
            <p className='text-white font-bold text-[28px]'>Already have an account?</p>
            <p className='text-white text-[16px] p-5'>Login to your account.</p>
            <Link to="/login">
                <button className="p-2 w-[100px] transition bg-blue-600 rounded-2xl border-2 border-white text-white font-bold hover:bg-blue-800">
                  Login
              </button>
            </Link>

        </div>

        </div>
      </div>

    </div>
  );
}

export default SignUpScreen;
