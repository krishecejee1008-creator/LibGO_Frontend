import { useState, useEffect } from "react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("name");
    const [foundUser, setFoundUser] = useState(null);
    const [userIssues, setUserIssues] = useState([]);
    const [userDues, setUserDues] = useState([]);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: "", lastName: "", collageEmailID: "",
        enrollmentID: "", userType: "STUDENT", branch: "CSE"
    });
    const [showNewAdmissionForm, setShowNewAdmissionForm] = useState(false);
    const [newAdmission, setNewAdmission] = useState({
        firstName: "", lastName: "",
        jeeApplicationNumber: "", branch: "CSE"
    });
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [updateData, setUpdateData] = useState({
        jeeApplicationNumber: "",
        collageEmailID: "",
        enrollmentID: "",
        firstName: "",
        lastName: "",
        branch: "CSE",
        userType: "STUDENT"
    });


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


    const handleCollect = async (userId, bookId) => {
        try {
            await api.put("/issue/collect", { userId, bookId });
            alert("Book marked as collected!");
            const issuesResponse = await api.get(`/user/myBooks?userId=${userId}`);
            setUserIssues(issuesResponse.data);
        } catch (err) {
            alert("Could not mark as collected: " + err.message);
        }
    };

    const handleSearch = async () => {
        try {
            let response;
            if (searchType === "email") {
                response = await api.get(`/admin/searchUserByEmail?email=${searchQuery}`);
            } else if (searchType === "jee") {
                response = await api.get(`/admin/searchUserByJeeApplicationNumber?jeeApplicationNumber=${searchQuery}`);
            } else {
                response = await api.get(`/admin/searchUserByEnrollmentId?enrollmentId=${searchQuery}`);
            }
            setFoundUser(response.data);
            // fetch their books and dues
            const issuesResponse = await api.get(`/user/myBooks?userId=${response.data.id}`);
            setUserIssues(issuesResponse.data);
            const duesResponse = await api.get(`/user/myDues?userID=${response.data.id}`);
            setUserDues(duesResponse.data);
        } catch (err) {
            alert("User not found!");
        }
    };

    const handleRegister = async () => {
        try {
            await api.post("/admin/register", newUser);
            alert("User registered successfully!");
            setShowRegisterForm(false);
        } catch (err) {
            alert("Could not register: " + err.message);
        }
    };

    const handleRegisterNewAdmission = async () => {
        try {
            await api.post("/admin/registerNewAdmission", newAdmission);
            alert("New admission registered successfully!");
            setShowNewAdmissionForm(false);
        } catch (err) {
            alert("Could not register: " + err.message);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await api.put("/admin/updateUser", updateData);
            alert("User updated successfully!");
            setShowUpdateForm(false);
        } catch (err) {
            alert("Could not update: " + err.message);
        }
    };

    const handleEarlyReturn = async (userId, bookId) => {
        try {
            await api.put("/admin/return", { userId, bookId });
            alert("Book marked as returned!");
            const issuesResponse = await api.get(`/user/myBooks?userId=${userId}`);
            setUserIssues(issuesResponse.data);
        } catch (err) {
            alert("Could not mark as returned: " + err.message);
        }
    };

    return (
        <div className="page">
            <h1>Admin Dashboard</h1>

            <h2>Search User</h2>
            <div className="card">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="email">Search by Email</option>
                    <option value="enrollment">Search by Enrollment ID</option>
                    <option value="jee">Search by JEE Application Number</option>
                </select>
                <input
                    type="text"
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>

                {foundUser && (
                    <div>
                        <h3>{foundUser.firstName} {foundUser.lastName}</h3>
                        <p>Email: {foundUser.collageEmailID}</p>
                        <p>Status: {foundUser.active ? "Active" : "Blocked"}</p>
                        <h4>Their Books:</h4>
                        {userIssues.map(issue => (
                            <div key={issue.id}>
                                <p>{issue.bookIssued.name} — {issue.currentStatus}</p>
                                {issue.currentStatus === "PENDING" && (
                                    <button onClick={() => handleCollect(foundUser.id, issue.bookIssued.id)}>
                                        Mark Collected
                                    </button>
                                )}
                                {issue.currentStatus === "ACTIVE" && (
                                    <button onClick={() => handleEarlyReturn(foundUser.id, issue.bookIssued.id)}>
                                        Mark Returned
                                    </button>
                                )}
                            </div>
                        ))}
                        <h4>Their Dues:</h4>
                        {userDues.length === 0 ? <p>No dues</p> : userDues.map(due => (
                            <p key={due.id}>{due.overDue.bookIssued.name}</p>
                        ))}

                    </div>
                )}
            </div>{ }
            <h2>Register New User</h2>
            <div className="card">
                <button onClick={() => setShowRegisterForm(!showRegisterForm)}>
                    {showRegisterForm ? "Hide Form" : "Register New User"}
                </button>
                {showRegisterForm && (
                    <div>
                        <input placeholder="First Name" value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                        <input placeholder="Last Name" value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                        <input placeholder="College Email" value={newUser.collageEmailID}
                            onChange={(e) => setNewUser({ ...newUser, collageEmailID: e.target.value })} />
                        <input placeholder="Enrollment ID" value={newUser.enrollmentID}
                            onChange={(e) => setNewUser({ ...newUser, enrollmentID: e.target.value })} />
                        <select value={newUser.userType}
                            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}>
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <select value={newUser.branch}
                            onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EE">EE</option>
                            <option value="ME">ME</option>
                            <option value="CHE">CHE</option>
                            <option value="BPHARM">BPHARM</option>
                        </select>
                        <button onClick={handleRegister}>Register</button>
                    </div>
                )}
            </div>{ }
            <h2>Register New Admission</h2>
            <div className="card">
                <button onClick={() => setShowNewAdmissionForm(!showNewAdmissionForm)}>
                    {showNewAdmissionForm ? "Hide Form" : "Register New Admission"}
                </button>
                {showNewAdmissionForm && (
                    <div>
                        <input placeholder="First Name" value={newAdmission.firstName}
                            onChange={(e) => setNewAdmission({ ...newAdmission, firstName: e.target.value })} />
                        <input placeholder="Last Name" value={newAdmission.lastName}
                            onChange={(e) => setNewAdmission({ ...newAdmission, lastName: e.target.value })} />
                        <input placeholder="JEE/CUET Application Number" value={newAdmission.jeeApplicationNumber}
                            onChange={(e) => setNewAdmission({ ...newAdmission, jeeApplicationNumber: e.target.value })} />
                        <select value={newAdmission.branch}
                            onChange={(e) => setNewAdmission({ ...newAdmission, branch: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EE">EE</option>
                            <option value="ME">ME</option>
                            <option value="CHE">CHE</option>
                            <option value="BPHARM">BPHARM</option>
                        </select>
                        <button onClick={handleRegisterNewAdmission}>Register</button>
                    </div>
                )}
            </div>{ }
            <h2>Update New Admission</h2>
            <div className="card">
                <button onClick={() => setShowUpdateForm(!showUpdateForm)}>
                    {showUpdateForm ? "Hide Form" : "Update New Admission"}
                </button>
                {showUpdateForm && (
                    <div>
                        <input placeholder="JEE Application Number (to find user)"
                            value={updateData.jeeApplicationNumber}
                            onChange={(e) => setUpdateData({ ...updateData, jeeApplicationNumber: e.target.value })} />
                        <input placeholder="New College Email"
                            value={updateData.collageEmailID}
                            onChange={(e) => setUpdateData({ ...updateData, collageEmailID: e.target.value })} />
                        <input placeholder="New Enrollment ID"
                            value={updateData.enrollmentID}
                            onChange={(e) => setUpdateData({ ...updateData, enrollmentID: e.target.value })} />
                        <input placeholder="First Name"
                            value={updateData.firstName}
                            onChange={(e) => setUpdateData({ ...updateData, firstName: e.target.value })} />
                        <input placeholder="Last Name"
                            value={updateData.lastName}
                            onChange={(e) => setUpdateData({ ...updateData, lastName: e.target.value })} />
                        <select value={updateData.branch}
                            onChange={(e) => setUpdateData({ ...updateData, branch: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EE">EE</option>
                            <option value="ME">ME</option>
                            <option value="CHE">CHE</option>
                            <option value="BPHARM">BPHARM</option>
                        </select>
                        <button onClick={handleUpdateUser}>Update User</button>
                    </div>
                )}
            </div>
            <h2>Active Issues</h2>
            <div>
                {activeIssues.map(issue => (
                    <div className="card" key={issue.id}>
                        <strong>{issue.bookIssued.name}</strong>
                        <p>Issued to: {issue.issuer.firstName}</p>
                        <p>Due Date: {new Date(issue.dueDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
            <h2>Dues</h2>
            <div>
                {dues.map(due => (
                    <div className="card" key={due.id}>
                        <strong>{due.overDue.bookIssued.name}</strong>
                        <p>Overdue since: {new Date(due.overDueDate).toLocaleDateString()}</p>
                        <p>Status: {due.clearedByAdmin ? "Cleared" : "Pending return"}</p>
                        <button onClick={() => handleClearDue(due.id)}>Mark Returned</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;