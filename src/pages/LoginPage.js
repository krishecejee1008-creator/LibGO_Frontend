import { useState } from "react";
import api from '../api';
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/LibGO_homePage_bg.jpeg";

function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("regular");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [applicationNumber, setApplicationNumber] = useState("");
    const [error, setError] = useState("");
    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const handleLogin = async () => {
        try {
            if (mode === "regular") {
                const response = await api.post("/user/login", {
                    collageEmailId: email,
                    password: password
                });
                localStorage.setItem("token", response.data);
                navigate("/books");
            }
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    const handleForgotPassword = async () => {
        try {
            await api.post("/password/forgot", { email: forgotEmail });
            setOtpSent(true);
            alert("OTP sent to your email!");
        } catch (err) {
            setError("Email not found!");
        }
    };

    const handleResetPassword = async () => {
        try {
            await api.post("/password/reset", {
                email: forgotEmail,
                otp: otp,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });
            alert("Password reset successfully! Please login.");
            setMode("regular");
            setOtpSent(false);
        } catch (err) {
            setError("Invalid OTP or passwords don't match!");
        }
    };

    return (
        <div className="login-page-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="login-container">
                <h1>Login</h1>

                <div className="mode-buttons">
                    <button onClick={() => setMode("regular")}>Regular Login</button>
                    <button onClick={() => setMode("newAdmission")}>New Admission</button>
                </div>

                {mode === "regular" && (
                    <div>
                        <input type="email" placeholder="College Email"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Password"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button className="submit-btn" onClick={handleLogin}>Login</button>
                        <p style={{ marginTop: "10px", cursor: "pointer", color: "#6b4c35" }}
                            onClick={() => setMode("forgotPassword")}>
                            Forgot Password?
                        </p>
                    </div>
                )}

                {mode === "newAdmission" && (
                    <div>
                        <input type="number" placeholder="JEE Application Number"
                            value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} />
                        <input type="password" placeholder="Password"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button className="submit-btn" onClick={handleLogin}>Login</button>
                    </div>
                )}

                {mode === "forgotPassword" && !otpSent && (
                    <div>
                        <input type="email" placeholder="Enter your college email"
                            value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                        <button className="submit-btn" onClick={handleForgotPassword}>Send OTP</button>
                        <p style={{ marginTop: "10px", cursor: "pointer", color: "#6b4c35" }}
                            onClick={() => setMode("regular")}>
                            Back to Login
                        </p>
                    </div>
                )}

                {mode === "forgotPassword" && otpSent && (
                    <div>
                        <input type="text" placeholder="Enter OTP"
                            value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <input type="password" placeholder="New Password"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <input type="password" placeholder="Confirm Password"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button className="submit-btn" onClick={handleResetPassword}>Reset Password</button>
                    </div>
                )}

                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            </div>
        </div>
    );
}

export default LoginPage;