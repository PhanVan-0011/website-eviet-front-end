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
import RuleList from './components/rule/RuleList';
import RuleAdd from './components/rule/RuleAdd';
import RuleUpdate from './components/rule/RuleUpdate';
import AdminList from './components/admin/AdminList';
import AdminAdd from './components/admin/AdminAdd';
import AdminUpdate from './components/admin/AdminUpdate';
import AdminDetail from './components/admin/AdminDetail';
import BranchList from './components/branch/BranchList';
import BranchAdd from './components/branch/BranchAdd';
import BranchUpdate from './components/branch/BranchUpdate';
import GroupSupplierList from './components/group-supplier/GroupSupplierList';
import GroupSupplierAdd from './components/group-supplier/GroupSupplierAdd';
import GroupSupplierUpdate from './components/group-supplier/GroupSupplierUpdate';
import GroupSupplierDetail from './components/group-supplier/GroupSupplierDetail';
import SupplierList from './components/supplier/SupplierList';
import SupplierAdd from './components/supplier/SupplierAdd';
import SupplierUpdate from './components/supplier/SupplierUpdate';
import SupplierDetail from './components/supplier/SupplierDetail';
import Import from './components/import/Import';
import ImportEdit from './components/import/ImportEdit';
import ImportList from './components/import/ImportList';
import ImportDetail from './components/import/ImportDetail';
import PickupLocationList from './components/pickup-location/PickupLocationList';
import PickupLocationAdd from './components/pickup-location/PickupLocationAdd';
import PickupLocationUpdate from './components/pickup-location/PickupLocationUpdate';
import PickupLocationDetail from './components/pickup-location/PickupLocationDetail';
import TimeSlotList from './components/time-slot/TimeSlotList';
import TimeSlotAdd from './components/time-slot/TimeSlotAdd';
import TimeSlotUpdate from './components/time-slot/TimeSlotUpdate';
import TimeSlotDetail from './components/time-slot/TimeSlotDetail';
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
            <Route path="/admin" element={<AdminList />} />
            <Route path="/admin/add" element={<AdminAdd />} />
            <Route path="/admin/:id" element={<AdminUpdate />} />
            <Route path="/admin/detail/:id" element={<AdminDetail />} />
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
            <Route path="/rule" element={<RuleList />} />
            <Route path="/rule/add" element={<RuleAdd />} />
            <Route path="/rule/:id" element={<RuleUpdate />} />
            <Route path="/branch" element={<BranchList />} />
            <Route path="/branch/add" element={<BranchAdd />} />
            <Route path="/branch/:id" element={<BranchUpdate />} />
            <Route path="/group-supplier" element={<GroupSupplierList />} />
            <Route path="/group-supplier/add" element={<GroupSupplierAdd />} />
            <Route path="/group-supplier/:id" element={<GroupSupplierDetail />} />
            <Route path="/group-supplier/:id/edit" element={<GroupSupplierUpdate />} />
            <Route path="/supplier" element={<SupplierList />} />
            <Route path="/supplier/add" element={<SupplierAdd />} />
            <Route path="/supplier/:id" element={<SupplierUpdate />} />
            <Route path="/supplier/detail/:id" element={<SupplierDetail />} />
            <Route path="/import" element={<ImportList />} />
            <Route path="/import/add" element={<Import />} />
            <Route path="/import/edit/:id" element={<ImportEdit />} />
            <Route path="/import/detail/:id" element={<ImportDetail />} />
            <Route path="/pickup-location" element={<PickupLocationList />} />
            <Route path="/pickup-location/add" element={<PickupLocationAdd />} />
            <Route path="/pickup-location/:id/edit" element={<PickupLocationUpdate />} />
            <Route path="/pickup-location/detail/:id" element={<PickupLocationDetail />} />
            <Route path="/time-slot" element={<TimeSlotList />} />
            <Route path="/time-slot/add" element={<TimeSlotAdd />} />
            <Route path="/time-slot/:id/edit" element={<TimeSlotUpdate />} />
            <Route path="/time-slot/detail/:id" element={<TimeSlotDetail />} />
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
