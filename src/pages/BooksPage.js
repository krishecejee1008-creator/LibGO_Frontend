import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function BooksPage() {
    const [books, setBooks] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleIssue = async (bookId) => {
        if (!user) { alert("Please wait, loading user data..."); return; }
        try {
            await api.post("/issue/issueHere", { userId: user.id, bookId: bookId });
            alert("Book issued successfully! Visit library within 4 days to collect.");
            setSelectedBook(null);
        } catch (err) {
            alert("Could not issue book: " + (err.response?.data || err.message));
        }
    };

    const handleAddToCart = async (bookId) => {
        if (!user) { alert("Please wait, loading user data..."); return; }
        try {
            await api.post("/cart/add", { userId: user.id, bookId: bookId });
            alert("Book added to cart! 🛒");
        } catch (err) {
            alert("Could not add to cart: " + (err.response?.data || err.message));
        }
    };

    const filteredBooks = books.filter(book =>
        book.name.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.genre.toLowerCase().includes(search.toLowerCase())
    );

    // eslint-disable-next-line
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
            <input type="text" placeholder="Search by name, author or genre..."
                value={search} onChange={(e) => setSearch(e.target.value)} />

            {filteredBooks.length === 0 && (
                <div style={{textAlign: 'center', padding: '40px', color: '#6b4c35'}}>
                    <p style={{fontSize: '2rem'}}>📚</p>
                    <p style={{fontSize: '1.1rem', fontWeight: 'bold'}}>No books found in our collection</p>
                    <p style={{fontStyle: 'italic', fontSize: '0.9rem'}}>
                        Try searching by a different name, author or genre.
                    </p>
                </div>
            )}

            {filteredBooks.map(book => (
                <div className="card" key={book.id}>
                    <div style={{display: 'flex', gap: '15px'}}>
                        {book.coverImageUrl && (
                            <img src={book.coverImageUrl} alt={book.name}
                                 style={{width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0}} />
                        )}
                        <div style={{flex: 1}}>
                            <h3 style={{margin: '0 0 5px 0'}}>{book.name}</h3>
                            <p style={{margin: '2px 0'}}><strong>Author:</strong> {book.author}</p>
                            <p style={{margin: '2px 0'}}><strong>Genre:</strong> {book.genre}</p>
                            <p style={{margin: '2px 0'}}><strong>Available:</strong> {book.availableCopies}</p>
                            {book.description && (
                                <p style={{margin: '5px 0', color: '#6b4c35', fontStyle: 'italic', fontSize: '0.9rem'}}>
                                    {book.description.substring(0, 80)}...
                                </p>
                            )}
                            {book.authorBio && (
                                <p style={{margin: '2px 0', fontSize: '0.85rem', color: '#8b6555'}}>
                                    <strong>About Author:</strong> {book.authorBio.substring(0, 60)}...
                                </p>
                            )}
                            {book.authorImageUrl && (
                                <img src={book.authorImageUrl} alt={book.author}
                                     style={{width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px'}} />
                            )}
                        </div>
                    </div>
                    {book.availableCopies === 0 ? (
                        <p style={{color: '#8b0000', fontStyle: 'italic', marginTop: '10px', fontSize: '0.9rem'}}>
                            📖 All copies are currently checked out. Check back soon!
                        </p>
                    ) : (
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <button onClick={() => setSelectedBook(book)}>See More</button>
                            <button onClick={() => handleAddToCart(book.id)}>🛒 Add to Cart</button>
                            <button onClick={() => handleIssue(book.id)}>Issue</button>
                        </div>
                    )}
                </div>
            ))}

            {selectedBook && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff9f0', padding: '40px', borderRadius: '8px',
                        maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        {selectedBook.coverImageUrl && (
                            <img src={selectedBook.coverImageUrl} alt={selectedBook.name}
                                 style={{width: '100%', height: '250px', objectFit: 'cover', borderRadius: '4px'}} />
                        )}
                        <h2>{selectedBook.name}</h2>
                        <p><strong>Author:</strong> {selectedBook.author}</p>
                        <p><strong>Genre:</strong> {selectedBook.genre}</p>
                        <p><strong>Available Copies:</strong> {selectedBook.availableCopies}</p>
                        {selectedBook.description && (
                            <div>
                                <h4>About the Book</h4>
                                <p>{selectedBook.description}</p>
                            </div>
                        )}
                        {selectedBook.authorBio && (
                            <div>
                                <h4>About the Author</h4>
                                {selectedBook.authorImageUrl && (
                                    <img src={selectedBook.authorImageUrl} alt={selectedBook.author}
                                         style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}} />
                                )}
                                <p>{selectedBook.authorBio}</p>
                            </div>
                        )}
                        {selectedBook.availableCopies === 0 ? (
                            <p style={{color: '#8b0000', fontStyle: 'italic', marginTop: '20px'}}>
                                📖 All copies are currently checked out. Check back soon!
                            </p>
                        ) : (
                            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                                <button onClick={() => handleAddToCart(selectedBook.id)}>🛒 Add to Cart</button>
                                <button onClick={() => handleIssue(selectedBook.id)}>Issue Book</button>
                            </div>
                        )}
                        <button onClick={() => setSelectedBook(null)} style={{marginTop: '10px'}}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BooksPage;