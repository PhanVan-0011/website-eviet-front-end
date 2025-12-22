import { PERMISSIONS } from './permissions';

export const ROUTE_PERMISSIONS = {
  '/': PERMISSIONS.DASHBOARD_VIEW,

  // Khách hàng
  '/user': PERMISSIONS.USERS_VIEW,
  '/user/add': PERMISSIONS.USERS_CREATE,
  '/user/:id': PERMISSIONS.USERS_UPDATE,
  '/user/detail/:id': PERMISSIONS.USERS_VIEW,

  // Nhân viên/Admin
  '/admin': PERMISSIONS.ADMIN_USERS_VIEW,
  '/admin/add': PERMISSIONS.ADMIN_USERS_CREATE,
  '/admin/:id': PERMISSIONS.ADMIN_USERS_UPDATE,
  '/admin/detail/:id': PERMISSIONS.ADMIN_USERS_VIEW,

  // Danh mục
  '/category': PERMISSIONS.CATEGORIES_VIEW,
  '/category/add': PERMISSIONS.CATEGORIES_CREATE,
  '/category/:id': PERMISSIONS.CATEGORIES_UPDATE,
  '/category/detail/:id': PERMISSIONS.CATEGORIES_VIEW,

  // Chi nhánh
  '/branch': PERMISSIONS.BRANCHES_VIEW,
  '/branch/add': PERMISSIONS.BRANCHES_CREATE,
  '/branch/:id': PERMISSIONS.BRANCHES_UPDATE,
  '/branch/detail/:id': PERMISSIONS.BRANCHES_VIEW,

  // Sản phẩm
  '/product': PERMISSIONS.PRODUCTS_VIEW,
  '/product/add': PERMISSIONS.PRODUCTS_CREATE,
  '/product/:id': PERMISSIONS.PRODUCTS_UPDATE,
  '/product/detail/:id': PERMISSIONS.PRODUCTS_VIEW,

  // Bài viết
  '/post': PERMISSIONS.POSTS_VIEW,
  '/post/add': PERMISSIONS.POSTS_CREATE,
  '/post/:id': PERMISSIONS.POSTS_UPDATE,
  '/post/detail/:id': PERMISSIONS.POSTS_VIEW,

  // Đơn hàng
  '/order': PERMISSIONS.ORDERS_VIEW,
  '/order/add': PERMISSIONS.ORDERS_CREATE,
  '/order/detail/:id': PERMISSIONS.ORDERS_VIEW,

  // Slider
  '/slider': PERMISSIONS.SLIDERS_VIEW,
  '/slider/add': PERMISSIONS.SLIDERS_CREATE,
  '/slider/:id': PERMISSIONS.SLIDERS_UPDATE,
  '/slider/detail/:id': PERMISSIONS.SLIDERS_VIEW,

  // Combo
  '/combo': PERMISSIONS.COMBOS_VIEW,
  '/combo/detail/:id': PERMISSIONS.COMBOS_VIEW,
  '/combo/add': PERMISSIONS.COMBOS_CREATE,
  '/combo/:id': PERMISSIONS.COMBOS_UPDATE,

  // Khuyến mãi
  '/promotion': PERMISSIONS.PROMOTIONS_VIEW,
  '/promotion/detail/:id': PERMISSIONS.PROMOTIONS_VIEW,
  '/promotion/add': PERMISSIONS.PROMOTIONS_CREATE,
  '/promotion/:id': PERMISSIONS.PROMOTIONS_UPDATE,

  // Nhà cung cấp
  '/supplier': PERMISSIONS.SUPPLIERS_VIEW,
  '/supplier/add': PERMISSIONS.SUPPLIERS_CREATE,
  '/supplier/:id': PERMISSIONS.SUPPLIERS_UPDATE,
  '/supplier/detail/:id': PERMISSIONS.SUPPLIERS_VIEW,

  // Nhập hàng
  '/import': PERMISSIONS.PURCHASE_INVOICES_VIEW,
  '/import/add': PERMISSIONS.PURCHASE_INVOICES_CREATE,
  '/import/:id': PERMISSIONS.PURCHASE_INVOICES_UPDATE,
  '/import/detail/:id': PERMISSIONS.PURCHASE_INVOICES_VIEW,

  // Nhóm nhà cung cấp
  '/group-supplier': PERMISSIONS.GROUP_SUPPLIERS_VIEW,
  '/group-supplier/add': PERMISSIONS.GROUP_SUPPLIERS_CREATE,
  '/group-supplier/:id': PERMISSIONS.GROUP_SUPPLIERS_UPDATE,
  '/group-supplier/detail/:id': PERMISSIONS.GROUP_SUPPLIERS_VIEW,

  // Phân quyền
  '/rule': PERMISSIONS.ROLES_VIEW,
  '/rule/add': PERMISSIONS.ROLES_CREATE,
  '/rule/:id': PERMISSIONS.ROLES_UPDATE,
  '/rule/detail/:id': PERMISSIONS.ROLES_VIEW,
};
