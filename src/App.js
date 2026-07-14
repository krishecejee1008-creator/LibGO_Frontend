import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';
import MyBooksPage from './pages/MyBooksPage';
import MyDuesPage from './pages/MyDuesPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/my-books" element={<MyBooksPage />} />
        <Route path="/my-dues" element={<MyDuesPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;