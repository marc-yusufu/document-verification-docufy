import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import './WorkerLogin.css'; // reuse the same styles

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ForgotPassword() {
    const [workerId, setWorkerId] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        setError("");
        setMessage("");

        if (!workerId || !email) {
            setError("Please fill in both fields.");
            return;
        }

        setLoading(true);
        try {
            const { data: worker, error: workerError } = await supabase
                .from("workers")
                .select("*")
                .eq("worker_id_2", workerId)
                .eq("email", email)
                .maybeSingle();

            if (workerError) throw workerError;
            if (!worker) {
                setError("Worker ID and email combination not found.");
                setLoading(false);
                return;
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (resetError) throw resetError;

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
                    name="workerId"
                    placeholder="Worker ID"
                    className="worker-login-input"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="worker-login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
