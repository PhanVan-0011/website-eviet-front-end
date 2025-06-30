import { PERMISSIONS } from './permissions';

export const ROUTE_PERMISSIONS = {
  '/': PERMISSIONS.DASHBOARD_VIEW,

  // User/Admin
  '/user': PERMISSIONS.USERS_MANAGE,
  '/user/add': PERMISSIONS.USERS_MANAGE,
  '/user/:id': PERMISSIONS.USERS_MANAGE,
  '/admin': PERMISSIONS.USERS_MANAGE,
  '/admin/add': PERMISSIONS.USERS_MANAGE,
  '/admin/:id': PERMISSIONS.USERS_MANAGE,
  '/admin/detail/:id': PERMISSIONS.USERS_MANAGE,

  // Danh mục
  '/category': PERMISSIONS.CATEGORIES_MANAGE,
  '/category/add': PERMISSIONS.CATEGORIES_MANAGE,
  '/category/:id': PERMISSIONS.CATEGORIES_MANAGE,

  // Sản phẩm
  '/product': PERMISSIONS.PRODUCTS_VIEW,
  '/product/add': PERMISSIONS.PRODUCTS_CREATE,
  '/product/:id': PERMISSIONS.PRODUCTS_UPDATE,
  '/product/detail/:id': PERMISSIONS.PRODUCTS_VIEW,

  // Bài viết
  '/post': PERMISSIONS.POSTS_MANAGE,
  '/post/add': PERMISSIONS.POSTS_MANAGE,
  '/post/:id': PERMISSIONS.POSTS_MANAGE,
  '/post/detail/:id': PERMISSIONS.POSTS_MANAGE,

  // Đơn hàng
  '/order': PERMISSIONS.ORDERS_VIEW,
  '/order/add': PERMISSIONS.ORDERS_CREATE,
  '/order/detail/:id': PERMISSIONS.ORDERS_VIEW,

  // Slider
  '/slider': PERMISSIONS.SLIDERS_MANAGE,
  '/slider/add': PERMISSIONS.SLIDERS_MANAGE,
  '/slider/:id': PERMISSIONS.SLIDERS_MANAGE,

  // Combo
  '/combo': PERMISSIONS.COMBOS_MANAGE,
  '/combo/detail/:id': PERMISSIONS.COMBOS_MANAGE,
  '/combo/add': PERMISSIONS.COMBOS_MANAGE,
  '/combo/:id': PERMISSIONS.COMBOS_MANAGE,

  // Khuyến mãi
  '/promotion': PERMISSIONS.PROMOTIONS_VIEW,
  '/promotion/detail/:id': PERMISSIONS.PROMOTIONS_VIEW,
  '/promotion/add': PERMISSIONS.PROMOTIONS_CREATE,
  '/promotion/:id': PERMISSIONS.PROMOTIONS_UPDATE,

  // Phân quyền
  '/rule': PERMISSIONS.ROLES_MANAGE,
  '/rule/add': PERMISSIONS.ROLES_MANAGE,
  '/rule/:id': PERMISSIONS.ROLES_MANAGE,
  // ... thêm các route khác nếu cần
};
