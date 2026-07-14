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

const [search, setSearch] = useState("");

const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    book.genre.toLowerCase().includes(search.toLowerCase())
);

    useEffect(() => {
    api.get("/books")
       .then(response => setBooks(response.data))
       .catch(err => console.log(err));
    
   api.get(`/user/me?email=${encodeURIComponent(userEmail)}`)
       .then(response => setUser(response.data))
       .catch(err => console.log(err));
}, []);

   return (
    <div className="page">
        <h1>Library Books</h1>
        <input
    type="text"
    placeholder="Search by name, author or genre..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
/>
        {filteredBooks.map(book => (
            
            <div className="card" key={book.id}>
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