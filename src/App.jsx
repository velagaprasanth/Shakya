import './App.scss';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Cart/Cart";
import NotFound from "./pages/NotFound/NotFound";
import 'bootstrap/dist/css/bootstrap.css';
import Product from './pages/Product/Product';
import Connect from './components/Connect/Connect';
import Contact from './components/Contact/Contact';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp/FloatingWhatsApp';
import SubcategoryProducts from './pages/SubcategoryProducts/SubcategoryProducts';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<Product />} />
          <Route path="/subcategory/:subcategoryName" element={<SubcategoryProducts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <FloatingWhatsApp />
      {!isHomePage && (
        <>
          <Connect />
          <Contact />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;
