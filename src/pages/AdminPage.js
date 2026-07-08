import {useState, useEffect} from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function AdminPage() {
    const [activeIssues, setActiveIssues] = useState([]);
    const [pendingIssues, setPendingIssues] = useState([]);
    const [dues, setDues] = useState([]);
    const navigate = useNavigate();
const token = localStorage.getItem("token");
const roles = token ? jwtDecode(token).roles : null;
const userEmail = token ? jwtDecode(token).sub : null;

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (roles !== "ADMIN") {
    navigate("/books");
    }
    api.get("/admin/issues/active")
       .then(response => setActiveIssues(response.data))
       .catch(err => console.log(err));

    api.get("/admin/issues/pending")
       .then(response => setPendingIssues(response.data))
       .catch(err => console.log(err));

    api.get("/admin/issues/dues")
       .then(response => setDues(response.data))
       .catch(err => console.log(err));
}, []);

const handleClearDue = async (dueId) => {
    try {
        await api.put(`/admin/issues/due/${dueId}/clear`);
        alert("Due cleared successfully!");
        // Refresh the dues list
        api.get("/admin/issues/dues")
           .then(response => setDues(response.data))
    } catch (err) {
        alert("Could not clear due: " + err.response.data);
    }
};

return (
    <div>
        <h1>Admin Dashboard</h1>
        <h2>Active Issues</h2>
        <ul>
            {activeIssues.map(issue => (
                <li key={issue.id}>
                    <strong>{issue.bookIssued.name}</strong>
                    <p>Issued to: {issue.issuer.firstName}</p>                   
                    <p>Due Date: {new Date(issue.dueDate).toLocaleDateString()}</p>
                </li>
            ))}
        </ul>
        <h2>Pending Issues</h2>
        <ul>
            {pendingIssues.map(issue => (
                <li key={issue.id}>
                    <strong>{issue.bookIssued.name}</strong>
                    <p>Requested by: {issue.issuer.firstName}</p>
                    <p>Request Date: {new Date(issue.issueDateTime).toLocaleDateString()}</p>
                </li>
            ))}
        </ul>
        <h2>Dues</h2>
        <ul>
            {dues.map(due => (
                <li key={due.id}>
                    <strong>{due.overDue.bookIssued.name}</strong>
                    <p>Overdue since: {new Date(due.overDueDate).toLocaleDateString()}</p>
                    <p>Status: {due.clearedByAdmin ? "Cleared" : "Pending return"}</p>
                    <button onClick={() => handleClearDue(due.id)}>Mark Returned</button>
                </li>
            ))}
        </ul>
    </div>
);
}

export default AdminPage;