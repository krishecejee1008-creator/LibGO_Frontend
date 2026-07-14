import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/LibGO.png"; 

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = token ? jwtDecode(token).roles : null;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <nav>
            <div className="nav-brand" onClick={() => navigate("/books")}>
                <img src={logo} alt="LibGO Logo" className="nav-logo" />
            </div>

            {token && <button onClick={() => navigate("/books")}>Books</button>}
            {token && <button onClick={() => navigate("/my-books")}>My Books</button>}
            {token && <button onClick={() => navigate("/my-dues")}>My Dues</button>}
            {role === "ADMIN" && <button onClick={() => navigate("/admin")}>Admin</button>}
            {token && <button onClick={handleLogout}>Logout</button>}
        </nav>
    );
}

export default Navbar;