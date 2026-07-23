import { useState, useEffect } from "react";
import api from '../api';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// Import badges
import badge1 from '../assets/badges/badge_1_page_turner.png';
import badge2 from '../assets/badges/badge_2_bookworm.png';
import badge3 from '../assets/badges/badge_3_avid_reader.png';
import badge4 from '../assets/badges/badge_4_scholar.png';
import badge5 from '../assets/badges/badge_5_bibliophile.png';
import badge6 from '../assets/badges/badge_6_archivist.png';
import badge7 from '../assets/badges/badge_7_sage.png';
import badge8 from '../assets/badges/badge_8_luminary.png';
import badge9 from '../assets/badges/badge_9_grand_scholar.png';
import badge10 from '../assets/badges/badge_10_librarian_supreme.png';

const badges = {
    PAGE_TURNER: badge1,
    BOOKWORM: badge2,
    AVID_READER: badge3,
    SCHOLAR: badge4,
    BIBLIOPHILE: badge5,
    ARCHIVIST: badge6,
    SAGE: badge7,
    LUMINARY: badge8,
    GRAND_SCHOLAR: badge9,
    LIBRARIAN_SUPREME: badge10
};

const levelNames = {
    PAGE_TURNER: "Page Turner",
    BOOKWORM: "Bookworm",
    AVID_READER: "Avid Reader",
    SCHOLAR: "Scholar",
    BIBLIOPHILE: "Bibliophile",
    ARCHIVIST: "Archivist",
    SAGE: "Sage",
    LUMINARY: "Luminary",
    GRAND_SCHOLAR: "Grand Scholar",
    LIBRARIAN_SUPREME: "Librarian Supreme"
};

const levelThresholds = [0, 500, 1500, 3000, 5000, 7500, 11000, 15000, 20000, 27500];
const levelKeys = Object.keys(levelNames);

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [myBooks, setMyBooks] = useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userEmail = decoded.sub;
    const navigate = useNavigate();

    // eslint-disable-next-line
    useEffect(() => {
        api.get(`/user/profile?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                setUser(response.data);
                return api.get(`/user/myBooks?userId=${response.data.id}`);
            })
            .then(response => setMyBooks(response.data))
            .catch(err => console.log(err));
    }, []);

    if (!user) return <div className="page"><p>Loading profile...</p></div>;

    const currentLevelIndex = levelKeys.indexOf(user.level);
    const currentXP = user.expPoints || 0;
    const currentThreshold = levelThresholds[currentLevelIndex];
    const nextThreshold = levelThresholds[currentLevelIndex + 1] || 27500;
    const progress = currentLevelIndex === 9 ? 100 :
        Math.round(((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

    const activeBooks = myBooks.filter(b =>
        b.currentStatus === "ACTIVE" || b.currentStatus === "PENDING");
    const pastBooks = myBooks.filter(b =>
        b.currentStatus === "RETURNED" || b.currentStatus === "EXPIRED");

    return (
        <div className="page">
            <h1>My Profile</h1>

            {/* User Info Card */}
            <div className="card" style={{display: 'flex', gap: '30px', alignItems: 'center'}}>
                <img src={badges[user.level]} alt={levelNames[user.level]}
                     style={{width: '120px', height: '120px', objectFit: 'contain'}} />
                <div>
                    <h2>{user.firstName} {user.lastName}</h2>
                    <p><strong>Email:</strong> {user.collageEmailID}</p>
                    <p><strong>Branch:</strong> {user.branch}</p>
                    <p><strong>Role:</strong> {user.userType}</p>
                    <p><strong>Member since:</strong> {new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Level & XP Card */}
            <div className="card">
                <h2>📊 Reading Level</h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px'}}>
                    <img src={badges[user.level]} alt={levelNames[user.level]}
                         style={{width: '60px', height: '60px', objectFit: 'contain'}} />
                    <div>
                        <h3 style={{margin: 0}}>{levelNames[user.level]}</h3>
                        <p style={{margin: '4px 0', color: '#6b4c35'}}>Level {currentLevelIndex + 1} of 10</p>
                    </div>
                </div>
                <p><strong>XP Points: {currentXP}</strong></p>
                {currentLevelIndex < 9 && (
                    <p style={{fontSize: '0.9rem', color: '#6b4c35'}}>
                        {nextThreshold - currentXP} XP needed to reach {levelNames[levelKeys[currentLevelIndex + 1]]}
                    </p>
                )}
                {currentLevelIndex === 9 && (
                    <p style={{color: '#4a3728', fontWeight: 'bold'}}>
                        🎉 You have reached the highest level!
                    </p>
                )}
                {/* Progress Bar */}
                <div style={{
                    background: '#d4b896', borderRadius: '10px',
                    height: '20px', marginTop: '10px', overflow: 'hidden'
                }}>
                    <div style={{
                        background: '#4a3728', height: '100%',
                        width: `${progress}%`, borderRadius: '10px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <p style={{fontSize: '0.85rem', color: '#6b4c35', marginTop: '5px'}}>
                    {progress}% to next level
                </p>

                {/* All Badges */}
                <h4 style={{marginTop: '20px'}}>All Badges</h4>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {levelKeys.map((key, index) => (
                        <div key={key} style={{textAlign: 'center', opacity: index <= currentLevelIndex ? 1 : 0.3}}>
                            <img src={badges[key]} alt={levelNames[key]}
                                 style={{width: '50px', height: '50px', objectFit: 'contain'}} />
                            <p style={{fontSize: '0.7rem', margin: '2px 0'}}>{levelNames[key]}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Books */}
            <div className="card">
                <h2>📚 Currently Reading</h2>
                {activeBooks.length === 0 ? (
                    <p style={{fontStyle: 'italic', color: '#6b4c35'}}>No books currently issued.</p>
                ) : (
                    activeBooks.map(book => (
                        <div key={book.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '10px 0', borderBottom: '1px solid #d4b896'
                        }}>
                            <div>
                                <strong>{book.bookIssued.name}</strong>
                                <p style={{margin: '2px 0', fontSize: '0.9rem'}}>{book.bookIssued.author}</p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <p style={{margin: '2px 0', fontSize: '0.85rem'}}>{book.currentStatus}</p>
                                <p style={{margin: '2px 0', fontSize: '0.85rem', color: '#6b4c35'}}>
                                    {book.dueDate ? `Due: ${new Date(book.dueDate).toLocaleDateString()}` : "Not collected yet"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Past Books */}
            <div className="card">
                <h2>📖 Reading History</h2>
                {pastBooks.length === 0 ? (
                    <p style={{fontStyle: 'italic', color: '#6b4c35'}}>No past books yet.</p>
                ) : (
                    pastBooks.map(book => (
                        <div key={book.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '10px 0', borderBottom: '1px solid #d4b896'
                        }}>
                            <div>
                                <strong>{book.bookIssued.name}</strong>
                                <p style={{margin: '2px 0', fontSize: '0.9rem'}}>{book.bookIssued.author}</p>
                            </div>
                            <p style={{
                                margin: '2px 0', fontSize: '0.85rem',
                                color: book.currentStatus === "RETURNED" ? '#2d6a2d' : '#8b0000'
                            }}>
                                {book.currentStatus}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProfilePage;