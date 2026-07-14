import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";

function MyBooksPage() {
    const [myBooks, setMyBooks] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;

    const [user, setUser] = useState(null);

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
            await api.put("/issue/extend", {
                userId: user.id,
                bookId: bookId
            });
            alert("Book return date extended successfully!");
            // refresh books
            const response = await api.get(`/user/myBooks?userId=${user.id}`);
            setMyBooks(response.data);
        } catch (err) {
            alert("Could not extend return date: " + err.message);
        }
    };

    const handleCancel = async (bookId) => {
        try {
            await api.put("/issue/cancel", {
                userId: user.id,
                bookId: bookId
            });
            alert("Issue cancelled successfully!");
            // refresh books
            const response = await api.get(`/user/myBooks?userId=${user.id}`);
            setMyBooks(response.data);
        } catch (err) {
            alert("Could not cancel: " + err.message);
        }
    };

    return (
        <div className="page">
            <h2>My Books</h2>
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
    );
}

export default MyBooksPage;