import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function CartPage() {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;
    const navigate = useNavigate();

    // eslint-disable-next-line
    useEffect(() => {
        api.get(`/user/me?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                setUser(response.data);
                return api.get(`/cart/myCart?userId=${response.data.id}`);
            })
            .then(response => setCart(response.data))
            .catch(err => console.log(err));
    }, []);

    const handleRemove = async (bookId) => {
        try {
            await api.delete("/cart/remove", { data: { userId: user.id, bookId: bookId } });
            const response = await api.get(`/cart/myCart?userId=${user.id}`);
            setCart(response.data);
        } catch (err) {
            alert("Could not remove: " + err.message);
        }
    };

    const handleIssueAll = async () => {
        try {
            await api.post(`/cart/issueAll?userId=${user.id}`);
            alert("All books issued successfully! Visit library within 4 days to collect.");
            setCart([]);
            navigate("/my-books");
        } catch (err) {
            alert("Could not issue all: " + err.message);
        }
    };

    return (
        <div className="page">
            <h1>My Cart 🛒</h1>
            {cart.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#6b4c35'}}>
                    <p style={{fontSize: '3rem'}}>🛒</p>
                    <p style={{fontSize: '1.3rem', fontWeight: 'bold'}}>Your reading cart is empty</p>
                    <p style={{fontStyle: 'italic', marginTop: '10px'}}>
                        Browse our collection and add books you wish to borrow.
                    </p>
                    <button onClick={() => navigate("/books")} style={{marginTop: '20px'}}>
                        Browse Books
                    </button>
                </div>
            ) : (
                <div>
                    {cart.map(item => (
                        <div className="card" key={item.id}>
                            <div style={{display: 'flex', gap: '15px'}}>
                                {item.cartBook.coverImageUrl && (
                                    <img src={item.cartBook.coverImageUrl} alt={item.cartBook.name}
                                         style={{width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0}} />
                                )}
                                <div style={{flex: 1}}>
                                    <h3>{item.cartBook.name}</h3>
                                    <p><strong>Author:</strong> {item.cartBook.author}</p>
                                    <p><strong>Genre:</strong> {item.cartBook.genre}</p>
                                    <p><strong>Available:</strong> {item.cartBook.availableCopies}</p>
                                </div>
                            </div>
                            <button onClick={() => handleRemove(item.cartBook.id)}
                                style={{backgroundColor: '#8b0000', marginTop: '10px'}}>
                                Remove from Cart
                            </button>
                        </div>
                    ))}
                    <div style={{marginTop: '20px'}}>
                        <p><strong>Total books in cart: {cart.length}/6</strong></p>
                        <button onClick={handleIssueAll} style={{padding: '12px 24px', fontSize: '1rem'}}>
                            Issue All Books
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;