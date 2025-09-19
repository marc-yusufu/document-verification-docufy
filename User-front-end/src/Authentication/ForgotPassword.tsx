import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import "./ForgotPass.css "; // reuse the same styles

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        setError("");
        setMessage("");

        if (!identifier) {
            setError("Please enter your Email, ID, or Passport.");
            return;
        }

        setLoading(true);

        try {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
            const isID = /^\d{13}$/.test(identifier);
            const isPassport = /^A\d{7}$/.test(identifier);

            let emailToUse: string | null = null;

            if (isEmail) {
                // Directly use email
                emailToUse = identifier.trim();
            } else if (isID || isPassport) {
                // Lookup in workers table
                const { data: worker, error: workerError } = await supabase
                    .from("workers")
                    .select("email")
                    .or(`id_number.eq.${identifier},passport.eq.${identifier}`)
                    .maybeSingle();

                if (workerError) throw workerError;

                if (worker?.email) {
                    emailToUse = worker.email;
                } else {
                    setError(
                        "You must contact support to reset your password since no recovery email is linked to your account."
                    );
                    setLoading(false);
                    return;
                }
            } else {
                setError("Enter a valid Email, SA ID (13 digits), or Passport (A + 7 digits).");
                setLoading(false);
                return;
            }

            // Trigger Supabase password reset
            if (emailToUse) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                    emailToUse,
                    { redirectTo: `${window.location.origin}/reset-password` }
                );

                if (resetError) {
                    console.error("Password reset error:", resetError.message);
                }
            } else {
                console.error("No valid email found to send reset link.");
            }

            setMessage("Check your email for password reset instructions.");
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="worker-login-container">
            <div className="worker-login-left">
                <h2 className="worker-login-title">Forgot Password</h2>
                {error && <p className="worker-login-error">{error}</p>}
                {message && <p className="worker-login-success">{message}</p>}

                <input
                    type="text"
                    placeholder="Enter Email, ID, or Passport"
                    className="worker-login-input"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />

                <button
                    onClick={handleForgotPassword}
                    className="worker-login-btn"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="worker-login-footer">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
            <div className="worker-login-right"></div>
        </div>
    );
}
