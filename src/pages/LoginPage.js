import { useState } from "react";
import api from '../api';
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("regular");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [applicationNumber, setApplicationNumber] = useState("");
    const [error, setError] = useState("");

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

    return (
        <div>
            <h1>LibGO Login</h1>

<button onClick={() => setMode("regular")}>Regular Login</button>
<button onClick={() => setMode("newAdmission")}>New Admission</button>
{mode === "regular" && (
    <div>
        <input 
            type="email" 
            placeholder="College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
    </div>
)}

{mode === "newAdmission" && (
    <div>
        <input 
            type="number" 
            placeholder="JEE Application Number"
            value={applicationNumber}
            onChange={(e) => setApplicationNumber(e.target.value)}
        />
    </div>
)}

<input 
    type="password" 
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
/>

<button onClick={handleLogin}>Login</button>
{error && <p style={{color: "red"}}>{error}</p>}
    
        </div>
    );
}

export default LoginPage;