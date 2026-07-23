import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function AdminPage() {
    const [activeIssues, setActiveIssues] = useState([]);
    const [dues, setDues] = useState([]);
    const [navigate] = [useNavigate()];
    const token = localStorage.getItem("token");
    const roles = token ? jwtDecode(token).roles : null;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("email");
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
        firstName: "", lastName: "", collageEmailID: "",
        jeeApplicationNumber: "", branch: "CSE"
    });

    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [updateData, setUpdateData] = useState({
        jeeApplicationNumber: "", collageEmailID: "",
        enrollmentID: "", firstName: "", lastName: "",
        branch: "CSE", userType: "STUDENT"
    });

    const [books, setBooks] = useState([]);
    const [showAddBookForm, setShowAddBookForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [newBook, setNewBook] = useState({
        name: "", author: "", callNumber: "", genre: "CSE",
        totalCopies: "", availableCopies: "",
        description: "", authorBio: "", authorImageUrl: "", coverImageUrl: ""
    });

    // eslint-disable-next-line
    useEffect(() => {
        if (roles !== "ADMIN") {
            navigate("/books");
        }
        api.get("/admin/issues/active")
            .then(response => setActiveIssues(response.data))
            .catch(err => console.log(err));

        api.get("/admin/issues/dues")
            .then(response => setDues(response.data))
            .catch(err => console.log(err));

        api.get("/books")
            .then(response => setBooks(response.data))
            .catch(err => console.log(err));
    }, []);

    const handleSearch = async () => {
        try {
            let response;
            if (searchType === "email") {
                response = await api.get(`/admin/searchUserByEmail?email=${encodeURIComponent(searchQuery)}`);
            } else if (searchType === "enrollment") {
                response = await api.get(`/admin/searchUserByEnrollmentId?enrollmentId=${searchQuery}`);
            } else if (searchType === "jee") {
                response = await api.get(`/admin/searchUserByJeeApplicationNumber?jeeApplicationNumber=${searchQuery}`);
            }
            setFoundUser(response.data);
            const issuesResponse = await api.get(`/user/myBooks?userId=${response.data.id}`);
            setUserIssues(issuesResponse.data);
            const duesResponse = await api.get(`/user/myDues?userID=${response.data.id}`);
            setUserDues(duesResponse.data);
        } catch (err) {
            alert("User not found!");
        }
    };

    const handleCollect = async (userId, bookId) => {
        try {
           await api.put("/admin/issues/collect", { userId, bookId });
            alert("Book marked as collected!");
            const issuesResponse = await api.get(`/user/myBooks?userId=${userId}`);
            setUserIssues(issuesResponse.data);
        } catch (err) {
            alert("Could not mark as collected: " + err.message);
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

    const handleClearDue = async (dueId) => {
        try {
            await api.put(`/admin/issues/due/${dueId}/clear`);
            alert("Due cleared successfully!");
            api.get("/admin/issues/dues")
                .then(response => setDues(response.data));
        } catch (err) {
            alert("Could not clear due: " + err.response?.data);
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

    const handleAddBook = async () => {
        try {
            await api.post("/admin/addBooks", newBook);
            alert("Book added successfully!");
            setShowAddBookForm(false);
            const response = await api.get("/books");
            setBooks(response.data);
        } catch (err) {
            alert("Could not add book: " + err.message);
        }
    };

    const handleEditBook = async () => {
        try {
            await api.put(`/admin/books/${editingBook.id}`, editingBook);
            alert("Book updated successfully!");
            setEditingBook(null);
            const response = await api.get("/books");
            setBooks(response.data);
        } catch (err) {
            alert("Could not update book: " + err.message);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.delete(`/admin/books/${bookId}`);
            alert("Book deleted successfully!");
            const response = await api.get("/books");
            setBooks(response.data);
        } catch (err) {
            alert("Could not delete: " + err.message);
        }
    };

    return (
        <div className="page">
            <h1>Admin Dashboard</h1>

            {/* Search User */}
            <h2>Search User</h2>
            <div className="card">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="email">Search by Email</option>
                    <option value="enrollment">Search by Enrollment ID</option>
                    <option value="jee">Search by JEE Application Number</option>
                </select>
                <input type="text" placeholder="Enter search query..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
            </div>

            {/* Register New User */}
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
            </div>

            {/* Register New Admission */}
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
                        <input placeholder="College Email" value={newAdmission.collageEmailID}
                            onChange={(e) => setNewAdmission({ ...newAdmission, collageEmailID: e.target.value })} />
                        <input placeholder="JEE Application Number" value={newAdmission.jeeApplicationNumber}
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
            </div>

            {/* Update New Admission */}
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
                        <input placeholder="New College Email" value={updateData.collageEmailID}
                            onChange={(e) => setUpdateData({ ...updateData, collageEmailID: e.target.value })} />
                        <input placeholder="New Enrollment ID" value={updateData.enrollmentID}
                            onChange={(e) => setUpdateData({ ...updateData, enrollmentID: e.target.value })} />
                        <input placeholder="First Name" value={updateData.firstName}
                            onChange={(e) => setUpdateData({ ...updateData, firstName: e.target.value })} />
                        <input placeholder="Last Name" value={updateData.lastName}
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

            {/* Manage Books */}
            <h2>Manage Books</h2>
            <div className="card">
                <button onClick={() => setShowAddBookForm(!showAddBookForm)}>
                    {showAddBookForm ? "Hide Form" : "Add New Book"}
                </button>
                {showAddBookForm && (
                    <div>
                        <input placeholder="Book Name" value={newBook.name}
                            onChange={(e) => setNewBook({ ...newBook, name: e.target.value })} />
                        <input placeholder="Author" value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
                        <input placeholder="Call Number" value={newBook.callNumber}
                            onChange={(e) => setNewBook({ ...newBook, callNumber: e.target.value })} />
                        <select value={newBook.genre}
                            onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EE">EE</option>
                            <option value="ME">ME</option>
                            <option value="CHE">CHE</option>
                            <option value="BPHARM">BPHARM</option>
                            <option value="GENERAL">GENERAL</option>
                        </select>
                        <input placeholder="Total Copies" type="number" value={newBook.totalCopies}
                            onChange={(e) => setNewBook({ ...newBook, totalCopies: e.target.value })} />
                        <input placeholder="Available Copies" type="number" value={newBook.availableCopies}
                            onChange={(e) => setNewBook({ ...newBook, availableCopies: e.target.value })} />
                        <textarea placeholder="Description" value={newBook.description}
                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                            style={{ width: '100%', height: '100px', padding: '10px', fontFamily: 'Georgia' }} />
                        <textarea placeholder="Author Bio" value={newBook.authorBio}
                            onChange={(e) => setNewBook({ ...newBook, authorBio: e.target.value })}
                            style={{ width: '100%', height: '80px', padding: '10px', fontFamily: 'Georgia' }} />
                        <input placeholder="Cover Image URL" value={newBook.coverImageUrl}
                            onChange={(e) => setNewBook({ ...newBook, coverImageUrl: e.target.value })} />
                        <input placeholder="Author Image URL" value={newBook.authorImageUrl}
                            onChange={(e) => setNewBook({ ...newBook, authorImageUrl: e.target.value })} />
                        <button onClick={handleAddBook}>Add Book</button>
                    </div>
                )}
            </div>

            <div>
                {books.map(book => (
                    <div className="card" key={book.id}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {book.coverImageUrl && (
                                <img src={book.coverImageUrl} alt={book.name}
                                    style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0' }}>{book.name}</h3>
                                <p style={{ margin: '2px 0' }}><strong>Author:</strong> {book.author}</p>
                                <p style={{ margin: '2px 0' }}><strong>Genre:</strong> {book.genre}</p>
                                <p style={{ margin: '2px 0' }}><strong>Copies:</strong> {book.availableCopies}/{book.totalCopies}</p>
                                {book.description && (
                                    <p style={{ margin: '5px 0', color: '#6b4c35', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        {book.description.substring(0, 80)}...
                                    </p>
                                )}
                                {book.authorBio && (
                                    <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#8b6555' }}>
                                        <strong>About Author:</strong> {book.authorBio.substring(0, 60)}...
                                    </p>
                                )}
                                {book.authorImageUrl && (
                                    <img src={book.authorImageUrl} alt={book.author}
                                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }} />
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setEditingBook({ ...book })}>Edit</button>
                            <button onClick={() => handleDeleteBook(book.id)}
                                style={{ backgroundColor: '#8b0000' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Issues */}
            <h2>Active Issues</h2>
            <div>
                {activeIssues.map(issue => (
                    <div className="card" key={issue.id}>
                        <strong>{issue.bookIssued.name}</strong>
                       <p>Issued to: {issue.issuer.firstName || issue.issuer.collageEmailID}</p>
                        <p>Due Date: {new Date(issue.dueDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

            {/* Dues */}
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

            {/* Edit Book Modal */}
            {editingBook && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff9f0', padding: '40px', borderRadius: '8px',
                        maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <h2>Edit Book</h2>
                        <input placeholder="Book Name" value={editingBook.name}
                            onChange={(e) => setEditingBook({ ...editingBook, name: e.target.value })} />
                        <input placeholder="Author" value={editingBook.author}
                            onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })} />
                        <input placeholder="Call Number" value={editingBook.callNumber}
                            onChange={(e) => setEditingBook({ ...editingBook, callNumber: e.target.value })} />
                        <select value={editingBook.genre}
                            onChange={(e) => setEditingBook({ ...editingBook, genre: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EE">EE</option>
                            <option value="ME">ME</option>
                            <option value="CHE">CHE</option>
                            <option value="BPHARM">BPHARM</option>
                            <option value="GENERAL">GENERAL</option>
                        </select>
                        <input placeholder="Total Copies" type="number" value={editingBook.totalCopies}
                            onChange={(e) => setEditingBook({ ...editingBook, totalCopies: e.target.value })} />
                        <textarea placeholder="Description" value={editingBook.description || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                            style={{ width: '100%', height: '100px', padding: '10px', fontFamily: 'Georgia' }} />
                        <textarea placeholder="Author Bio" value={editingBook.authorBio || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, authorBio: e.target.value })}
                            style={{ width: '100%', height: '80px', padding: '10px', fontFamily: 'Georgia' }} />
                        <input placeholder="Cover Image URL" value={editingBook.coverImageUrl || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, coverImageUrl: e.target.value })} />
                        <input placeholder="Author Image URL" value={editingBook.authorImageUrl || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, authorImageUrl: e.target.value })} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={handleEditBook}>Save Changes</button>
                            <button onClick={() => setEditingBook(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;