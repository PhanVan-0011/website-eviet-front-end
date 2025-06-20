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
import ProductUpdate from './components/product/ProductUpdate';
import CustomEditor from './components/common/CustomEditor';
import ProductDetail from './components/product/ProductDetail';
import PostList from './components/post/PostList';
import PostAdd from './components/post/PostAdd';
import PostUpdate from './components/post/PostUpdate';
import PostDetail from './components/post/PostDetail';
import OrderList from './components/order/OrderList';
import OrderDetail from './components/order/OrderDetail';
import SliderList from './components/slider/SliderList';
import SliderAdd from './components/slider/SliderAdd';
import ComboList from './components/combo/ComboList';
import ComboDetail from './components/combo/ComboDetail';
import ComboAdd from './components/combo/ComboAdd';
import ComboUpdate from './components/combo/ComboUpdate';
import SliderUpdate from './components/slider/SliderUpdate';
import PromotionList from './components/promotion/PromotionList';
import PromotionDetail from './components/promotion/PromotionDetail';
import PromotionAdd from './components/promotion/PromotionAdd';
import PromotionUpdate from './components/promotion/PromotionUpdate';
import OrderAdd from './components/order/OrderAdd';
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Main />}>
          <Route element={<PrivateRoutes />}>
            <Route index element={<Dashboard />} />
            {/* <Route path="/test" element={<CustomEditor />} /> */}
            <Route path="/user" element={<UserList />} />
            <Route path="/user/add" element={<UserAdd />} />
            <Route path="/user/:id" element={<UserUpdate />} />
            <Route path="/category" element={<CategoriesList />} />
            <Route path="/category/add" element={<CategoryAdd />} />
            <Route path="/category/:id" element={<CategoryUpdate />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/product/add" element={<ProductAdd />} />
            <Route path="/product/:id" element={<ProductUpdate />} />
            <Route path="/product/detail/:id" element={<ProductDetail />} />
            <Route path="/post" element={<PostList />} />
            <Route path="/post/add" element={<PostAdd />} />
            <Route path="/post/:id" element={<PostUpdate />} />
            <Route path="/post/detail/:id" element={<PostDetail />} />

            <Route path="/order" element={<OrderList />} />
            <Route path="/order/add" element={<OrderAdd />} />
            <Route path="/order/detail/:id" element={<OrderDetail />} />
            <Route path="/slider" element={<SliderList />} />
            <Route path="/slider/add" element={<SliderAdd />} />
            <Route path="/slider/:id" element={<SliderUpdate />} />
            <Route path="/combo" element={<ComboList />} />
            <Route path="/combo/detail/:id" element={<ComboDetail />} />
            <Route path="/combo/add" element={<ComboAdd />} />  
            <Route path="/combo/:id" element={<ComboUpdate />} />

            <Route path="/promotion" element={<PromotionList />} />
            <Route path="/promotion/detail/:id" element={<PromotionDetail />} />
            <Route path="/promotion/add" element={<PromotionAdd />} />  
            <Route path="/promotion/:id" element={<PromotionUpdate />} />

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
