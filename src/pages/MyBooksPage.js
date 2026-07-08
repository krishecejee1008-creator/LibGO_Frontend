import {useState, useEffect} from "react";
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
    

    return (
        <div>
            <h2>My Books</h2>
            <ul>
                {myBooks.map((book) => (
                    <li key={book.id}>
    <strong>{book.bookIssued.name}</strong>
    <p>Status: {book.currentStatus}</p>
    <p>Due Date: {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : "Not collected yet"}</p>
                     </li>
                    
                ))}
            </ul>
        </div>
    );
}

export default MyBooksPage;