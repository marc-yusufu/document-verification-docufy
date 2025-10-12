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
    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 text-[16px]">
      <label htmlFor={settingKey} className="cursor-pointer font-medium text-gray-800">
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
        width={46}
      />
    </div>
  );

  return (
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
            </button>
          </nav>
        </aside>

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
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-3xl">+</span>
                )}
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              {/* User Info */}
              <div className="flex-1 space-y-5">
                {/* Name (readonly) */}
                <div>
                  <label className="block text-gray-700 font-medium">Name</label>
                  <input
                    type="text"
                    value={user?.user_metadata?.full_name || "Loading..."}
                    disabled
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-gray-700 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                      {time} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section ref={section3}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <NotificationSwitch label="Enable Notifications" settingKey="notifications" />
              <NotificationSwitch label="Email Notifications" settingKey="emailNotification" />
              <NotificationSwitch label="Push Notifications" settingKey="pushNotification" />
              <NotificationSwitch label="SMS Alerts" settingKey="smsAlert" />
              <NotificationSwitch label="Security Alerts" settingKey="securityAlert" />
            </div>
          </section>

          {/* Support & Feedback */}
          <section ref={section4}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Support & Feedback</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 max-w-2xl">
              <div>
                <h3 className="font-medium text-gray-800">Help Center</h3>
                <p className="text-sm text-gray-600">Browse FAQs and support articles.</p>
                <a href="#" className="text-blue-600 hover:underline text-sm">
                  Go to Help Center →
                </a>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Contact Support</h3>
                <p className="text-sm text-gray-600">Tel: +27 65 456 7890</p>
                <p className="text-sm text-gray-600">Email: support@mm.com</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Submit Feedback</h3>
                <textarea
                  maxLength={200}
                  placeholder="Write your feedback here..."
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <div className="mt-3 text-right">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
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
