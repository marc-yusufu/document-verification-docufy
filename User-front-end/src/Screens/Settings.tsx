import { useState, useRef, useEffect, type RefObject } from "react";
import MainHeader from "../components/mainHeader";
import Footer from "../components/Footer";
import Switch from "react-switch";
import { supabase } from "../Authentication/supabaseconfig";

export default function SettingPage() {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isOn, setIsOn] = useState({
    notifications: true,
    emailNotification: false,
    pushNotification: true,
    smsAlert: false,
    securityAlert: true,
  });

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const section1 = useRef<HTMLDivElement | null>(null);
  const section2 = useRef<HTMLDivElement | null>(null);
  const section3 = useRef<HTMLDivElement | null>(null);
  const section4 = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
        setEmail(data.user.email || "");
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
    }
  };

  const handleSwitch = (key: keyof typeof isOn, nextIsOn: boolean) => {
    setIsOn((prev) => ({
      ...prev,
      [key]: nextIsOn,
    }));
  };

  const handleScroll = (ref: RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    // Update email
    if (email !== user?.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    // Update password
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Profile updated successfully ✅");
    setLoading(false);
  };

  const NotificationSwitch = ({
    label,
    settingKey,
  }: {
    label: string;
    settingKey: keyof typeof isOn;
  }) => (
<<<<<<< Updated upstream
    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 text-[16px]">
      <label htmlFor={settingKey} className="cursor-pointer select-none text-gray-700 font-medium">
=======
    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 text-[16px]">
      <label htmlFor={settingKey} className="cursor-pointer font-medium text-gray-800">
>>>>>>> Stashed changes
        {label}
      </label>
      <Switch
        id={settingKey}
        onChange={(checked: boolean) => handleSwitch(settingKey, checked)}
        checked={isOn[settingKey]}
        aria-label={label}
        offColor="#d1d5db"
        onColor="#2563eb"
        uncheckedIcon={false}
        checkedIcon={false}
        height={22}
<<<<<<< Updated upstream
        width={44}
=======
        width={46}
>>>>>>> Stashed changes
      />
    </div>
  );

  return (
<<<<<<< Updated upstream
    <div className="bg-gray-100 min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <MainHeader />
      </header>

      <div className="pt-[80px] max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-[240px] bg-white rounded-xl shadow p-4 h-fit sticky top-[90px]">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 mb-6 border border-gray-200">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.2-5.2M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <nav className="space-y-2 text-gray-700 text-sm">
            <button onClick={() => handleScroll(section1)} className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition">
              Account Settings
            </button>
            <button onClick={() => handleScroll(section2)} className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition">
              Security Settings
            </button>
            <button onClick={() => handleScroll(section3)} className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition">
              Notification Preferences
            </button>
            <button onClick={() => handleScroll(section4)} className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition">
              Support & Feedback
=======
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <MainHeader />
      </header>

      <div className="flex flex-1 pt-[64px]">
        {/* Sidebar */}
        <aside className="w-[240px] bg-white border-r border-gray-200 p-5 hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Settings</h2>
          <nav className="space-y-2 text-gray-600">
            <button
              onClick={() => handleScroll(section1)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition font-medium"
            >
              👤 Account
            </button>
            <button
              onClick={() => handleScroll(section2)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition font-medium"
            >
              🔒 Security
            </button>
            <button
              onClick={() => handleScroll(section3)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition font-medium"
            >
              🔔 Notifications
            </button>
            <button
              onClick={() => handleScroll(section4)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition font-medium"
            >
              💬 Support
>>>>>>> Stashed changes
            </button>
          </nav>
        </aside>

<<<<<<< Updated upstream
        {/* Main Settings */}
        <main className="flex-1 bg-white rounded-xl shadow p-6">
          {/* Account Settings */}
          <section ref={section1}>
            <h2 className="text-xl font-bold mb-6 text-gray-900">Account Settings</h2>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <label
                htmlFor="profilePicture"
                className="relative cursor-pointer w-[140px] h-[140px] rounded-full overflow-hidden border border-gray-200 flex justify-center items-center hover:ring-2 hover:ring-blue-400 transition"
=======
        {/* Main Content */}
        <main className="flex-1 p-8 space-y-16">
          {/* Account Settings */}
          <section ref={section1}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Account Settings</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 flex gap-8">
              {/* Avatar */}
              <label
                htmlFor="profilePicture"
                className="relative cursor-pointer w-[140px] h-[140px] rounded-full overflow-hidden border border-gray-300 flex justify-center items-center hover:ring-2 hover:ring-blue-400 transition"
>>>>>>> Stashed changes
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="object-cover w-full h-full" />
                ) : (
<<<<<<< Updated upstream
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
=======
                  <span className="text-gray-400 text-3xl">+</span>
>>>>>>> Stashed changes
                )}
                <input id="profilePicture" type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>

              {/* User Info */}
              <div className="flex-1 space-y-5">
                {/* Name (readonly) */}
                <div>
                  <label className="block text-gray-700 font-medium">Name</label>
<<<<<<< Updated upstream
                  <input type="text" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" />
=======
                  <input
                    type="text"
                    value={user?.user_metadata?.full_name || "Loading..."}
                    disabled
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
>>>>>>> Stashed changes
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium">Email</label>
<<<<<<< Updated upstream
                  <input type="email" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" />
=======
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
>>>>>>> Stashed changes
                </div>

                {/* New Password */}
                <div>
<<<<<<< Updated upstream
                  <label className="block text-gray-700 font-medium">Password</label>
                  <input type="password" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" />
=======
                  <label className="block text-gray-700 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
>>>>>>> Stashed changes
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {loading ? "Updating..." : "Submit"}
                  </button>
                  {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Security Settings */}
<<<<<<< Updated upstream
          <section ref={section2} className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Security Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Login Activity</h3>
                <div className="w-full max-w-xl h-24 flex items-center justify-center border border-dashed rounded-lg text-gray-500 mt-2 select-none">
                  No activity
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Session Timeout</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["5", "10", "15", "30", "60"].map((time) => (
                    <button key={time} className="px-4 py-1 border border-gray-300 rounded-full text-gray-700 hover:bg-blue-50">
=======
          <section ref={section2}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Security Settings</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-800">Login Activity</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Last login: Sep 25, 2025, Chrome on Mac
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Session Timeout</h3>
                <div className="flex flex-wrap gap-2">
                  {["5", "10", "15", "30", "60"].map((time) => (
                    <button
                      key={time}
                      className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-blue-50 transition"
                    >
>>>>>>> Stashed changes
                      {time} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

<<<<<<< Updated upstream
          {/* Notification Preferences */}
          <section ref={section3} className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Notification Preferences</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-2xl">
              <NotificationSwitch label="Notifications" settingKey="notifications" />
              <NotificationSwitch label="Email Notification" settingKey="emailNotification" />
              <NotificationSwitch label="Push Notification" settingKey="pushNotification" />
              <NotificationSwitch label="SMS Alert" settingKey="smsAlert" />
              <NotificationSwitch label="Security Alert" settingKey="securityAlert" />
=======
          {/* Notifications */}
          <section ref={section3}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <NotificationSwitch label="Enable Notifications" settingKey="notifications" />
              <NotificationSwitch label="Email Notifications" settingKey="emailNotification" />
              <NotificationSwitch label="Push Notifications" settingKey="pushNotification" />
              <NotificationSwitch label="SMS Alerts" settingKey="smsAlert" />
              <NotificationSwitch label="Security Alerts" settingKey="securityAlert" />
>>>>>>> Stashed changes
            </div>
          </section>

          {/* Support & Feedback */}
<<<<<<< Updated upstream
          <section ref={section4} className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Support & Feedback</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="flex justify-between items-center">
                <p className="text-gray-700">Help Center: Access FAQs and support articles</p>
                <a href="#" aria-label="Open Help Center" className="text-blue-600 hover:underline text-sm">
                  Open
=======
          <section ref={section4}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Support & Feedback</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 max-w-2xl">
              <div>
                <h3 className="font-medium text-gray-800">Help Center</h3>
                <p className="text-sm text-gray-600">Browse FAQs and support articles.</p>
                <a href="#" className="text-blue-600 hover:underline text-sm">
                  Go to Help Center →
>>>>>>> Stashed changes
                </a>
              </div>
              <div>
<<<<<<< Updated upstream
                <h3 className="text-lg font-medium text-gray-700">Contact Support</h3>
=======
                <h3 className="font-medium text-gray-800">Contact Support</h3>
>>>>>>> Stashed changes
                <p className="text-sm text-gray-600">Tel: +27 65 456 7890</p>
                <p className="text-sm text-gray-600">Email: support@mm.com</p>
              </div>
              <div>
<<<<<<< Updated upstream
                <h3 className="text-lg font-medium text-gray-700">Submit Feedback</h3>
                <textarea
                  maxLength={120}
                  placeholder="Max 120 Characters"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 h-28 resize-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="mt-3 text-right">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
=======
                <h3 className="font-medium text-gray-800">Submit Feedback</h3>
                <textarea
                  maxLength={200}
                  placeholder="Write your feedback here..."
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <div className="mt-3 text-right">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
>>>>>>> Stashed changes
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer always visible */}
      <Footer />
    </div>
  );
}
