import logo from './logo.svg';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Main from './layouts/Main';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { Routes, Route } from 'react-router-dom';
import PrivateRoutes from './layouts/PrivateRoutes';
import PublicRoutes from './layouts/PublicRoutes';
import Layout from './layouts/Layout';
import UserList from './components/user/UserList';
import UserAdd from './components/user/UserAdd';
import UserUpdate from './components/user/UserUpdate';
import "./css/styles.css";
import PageNotFound from './components/PageNotFound';
import CategoriesList from './components/category/CategoriesList';
import CategoryAdd from './components/category/CategoryAdd';
import CategoryUpdate from './components/category/CategoryUpdate';
import ProductList from './components/product/ProductList';
import ProductAdd from './components/product/ProductAdd';
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Main />}>
          <Route element={<PrivateRoutes />}>
            <Route index element={<Dashboard />} />
            <Route path="/user" element={<UserList />} />
            <Route path="/user/add" element={<UserAdd />} />
            <Route path="/user/:id" element={<UserUpdate />} />
            <Route path="/category" element={<CategoriesList />} />
            <Route path="/category/add" element={<CategoryAdd />} />
            <Route path="/category/:id" element={<CategoryUpdate />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/product/add" element={<ProductAdd />} />
            {/* <Route path="/category/add" element={<CategoryAdd />} />
            <Route path="/category/:id" element={<CategoryUpdate />} /> */}
          </Route>
        </Route>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
