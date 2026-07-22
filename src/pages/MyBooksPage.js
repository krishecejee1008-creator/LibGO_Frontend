import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function MyBooksPage() {
    const [myBooks, setMyBooks] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // eslint-disable-next-line
    useEffect(() => {
        api.get(`/user/me?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                setUser(response.data);
                return api.get(`/user/myBooks?userId=${response.data.id}`);
            })
            .then(response => setMyBooks(response.data))
            .catch(err => console.log(err));
    }, []);

    const handleExtend = async (bookId) => {
        try {
            await api.put("/issue/extend", { userId: user.id, bookId: bookId });
            alert("Book return date extended successfully!");
            const response = await api.get(`/user/myBooks?userId=${user.id}`);
            setMyBooks(response.data);
        } catch (err) {
            alert("Could not extend return date: " + err.message);
        }
    };

    const handleCancel = async (bookId) => {
        try {
            await api.put("/issue/cancel", { userId: user.id, bookId: bookId });
            alert("Issue cancelled successfully!");
            const response = await api.get(`/user/myBooks?userId=${user.id}`);
            setMyBooks(response.data);
        } catch (err) {
            alert("Could not cancel: " + err.message);
        }
    };

    return (
        <div className="page">
            <h2>My Books</h2>
            {myBooks.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#6b4c35'}}>
                    <p style={{fontSize: '3rem'}}>📖</p>
                    <p style={{fontSize: '1.3rem', fontWeight: 'bold'}}>Your reading shelf is empty</p>
                    <p style={{fontStyle: 'italic', marginTop: '10px'}}>
                        Visit our collection and issue your first book today!
                    </p>
                    <button onClick={() => navigate("/books")} style={{marginTop: '20px'}}>
                        Browse Books
                    </button>
                </div>
            ) : (
                <div>
                    {myBooks.map((book) => (
                        <div className="card" key={book.id}>
                            <strong>{book.bookIssued.name}</strong>
                            <p>Status: {book.currentStatus}</p>
                            <p>Due Date: {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : "Not collected yet"}</p>
                            {book.currentStatus === "PENDING" &&
                                <button onClick={() => handleCancel(book.bookIssued.id)}>Cancel Issue</button>
                            }
                            {book.currentStatus === "ACTIVE" && !book.extended &&
                                <button onClick={() => handleExtend(book.bookIssued.id)}>Extend Return Date</button>
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBooksPage;