import { useState, useEffect } from "react";
import api from '../api';
import { Route } from "react-router-dom";

function BooksPage() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        api.get("/books")
           .then(response => setBooks(response.data))
           .catch(err => console.log(err));
    }, []);

    return (
        <div>
            <h1>Library Books</h1>
            {books.map(book => (
                <div key={book.id}>
                    <h3>{book.name}</h3>
                    <p>Author: {book.author}</p>
                    <p>Available: {book.availableCopies}</p>
                </div>
            ))}
        </div>
    );
}

export default BooksPage;