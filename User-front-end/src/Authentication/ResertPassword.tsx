import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import './ForgotPass.css'; // reuse the login styles

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleResetPassword = async () => {
        setError("");
        setMessage("");

        if (!password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            setMessage("Password updated successfully!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="worker-login-container">
            <div className="worker-login-left">
                <h2 className="worker-login-title">Reset Password</h2>

                {error && <p className="worker-login-error">{error}</p>}
                {message && <p className="worker-login-success">{message}</p>}

                <input
                    type="password"
                    placeholder="New Password"
                    className="worker-login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="worker-login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    onClick={handleResetPassword}
                    className="worker-login-btn"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>

                <p className="worker-login-footer">
                    Remember your password? <a href="/login">Login</a>
                </p>
            </div>
            <div className="worker-login-right"></div>
        </div>
    );
}
