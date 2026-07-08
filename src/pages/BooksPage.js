import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function BooksPage() {
    const [books, setBooks] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;
    const navigate = useNavigate();


    const [user, setUser] = useState(null);

    const handleIssue = async (bookId) => {
        if (!user) {
        alert("Please wait, loading user data...");
        return;
        }
    try {
        await api.post("/issue/issueHere", {
            userId: user.id,
            bookId: bookId
        });
        alert("Book issued successfully! Visit library within 4 days to collect.");
    } catch (err) {
        alert("Could not issue book: " + err.response.data);
    }
};

    useEffect(() => {
    api.get("/books")
       .then(response => setBooks(response.data))
       .catch(err => console.log(err));
    
   api.get(`/user/me?email=${encodeURIComponent(userEmail)}`)
       .then(response => setUser(response.data))
       .catch(err => console.log(err));
}, []);

   return (
    <div>
        <h1>Library Books</h1>
        <button onClick={() => navigate('/my-books')}>My Books</button>
        <button onClick={() => navigate('/my-dues')}>My Dues</button>
        {books.map(book => (
            <div key={book.id}>
                <h3>{book.name}</h3>
                <p>Author: {book.author}</p>
                <p>Available: {book.availableCopies}</p>
                <button onClick={() => handleIssue(book.id)}>Issue</button>
            </div>
        ))}
             </div>
    );
}

export default BooksPage;