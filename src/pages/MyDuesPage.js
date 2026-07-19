import {useState, useEffect} from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";

function MyDuesPage() {
    const [myDues, setMyDues] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);    
    const userEmail = decoded.sub;

    // eslint-disable-next-line
    useEffect(() => {
    api.get(`/user/me?email=${encodeURIComponent(userEmail)}`)
       .then(response => {
           setUser(response.data);
        return api.get(`/user/myDues?userID=${response.data.id}`);       })
       .then(response => setMyDues(response.data))
       .catch(err => console.log(err));
     }, []);

    return (
    <div className="page">
        <h2>My Dues</h2>
        {myDues.length === 0 ? (
            <p>No dues! You're all clear. ✅</p>
        ) : (
            <div>
                {myDues.map((due) => (
                    <div className="card" key={due.id}>
                        <strong>{due.overDue.bookIssued.name}</strong>
                        <p>Overdue since: {new Date(due.overDueDate).toLocaleDateString()}</p>
                        <p>Status: {due.clearedByAdmin ? "Cleared" : "Pending return"}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);
}

export default MyDuesPage;
