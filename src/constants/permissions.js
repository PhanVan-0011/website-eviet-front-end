// src/constants/permissions.js
export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard.view',
  
    // Đơn hàng
    ORDERS_VIEW: 'orders.view',
    ORDERS_CREATE: 'orders.create',
    ORDERS_UPDATE: 'orders.update',
    ORDERS_UPDATE_STATUS: 'orders.update_status',
    ORDERS_CANCEL: 'orders.cancel',
    ORDERS_UPDATE_PAYMENT: 'orders.update_payment',
  
    // Sản phẩm
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_UPDATE: 'products.update',
    PRODUCTS_DELETE: 'products.delete',
    PRODUCT_ATTRIBUTES_MANAGE: 'product-attributes.manage',
  
    // Danh mục
    CATEGORIES_VIEW: 'categories.view',
    CATEGORIES_CREATE: 'categories.create',
    CATEGORIES_UPDATE: 'categories.update',
    CATEGORIES_DELETE: 'categories.delete',
  
    // Combo
    COMBOS_VIEW: 'combos.view',
    COMBOS_CREATE: 'combos.create',
    COMBOS_UPDATE: 'combos.update',
    COMBOS_DELETE: 'combos.delete',
  
    // Khuyến mãi
    PROMOTIONS_VIEW: 'promotions.view',
    PROMOTIONS_CREATE: 'promotions.create',
    PROMOTIONS_UPDATE: 'promotions.update',
    PROMOTIONS_DELETE: 'promotions.delete',
  
    // Slider
    SLIDERS_VIEW: 'sliders.view',
    SLIDERS_CREATE: 'sliders.create',
    SLIDERS_UPDATE: 'sliders.update',
    SLIDERS_DELETE: 'sliders.delete',
  
    // Bài viết
    POSTS_VIEW: 'posts.view',
    POSTS_CREATE: 'posts.create',
    POSTS_UPDATE: 'posts.update',
    POSTS_DELETE: 'posts.delete',
  
    // Nhà cung cấp
    SUPPLIERS_VIEW: 'suppliers.view',
    SUPPLIERS_CREATE: 'suppliers.create',
    SUPPLIERS_UPDATE: 'suppliers.update',
    SUPPLIERS_DELETE: 'suppliers.delete',
  
    // Nhập hàng
    PURCHASE_INVOICES_VIEW: 'purchase-invoices.view',
    PURCHASE_INVOICES_CREATE: 'purchase-invoices.create',
    PURCHASE_INVOICES_UPDATE: 'purchase-invoices.update',
    PURCHASE_INVOICES_DELETE: 'purchase-invoices.delete',
  
    // Chi nhánh
    BRANCHES_VIEW: 'branches.view',
    BRANCHES_CREATE: 'branches.create',
    BRANCHES_UPDATE: 'branches.update',
    BRANCHES_DELETE: 'branches.delete',
  
    // Nhóm nhà cung cấp
    GROUP_SUPPLIERS_VIEW: 'supplier-groups.view',
    GROUP_SUPPLIERS_CREATE: 'supplier-groups.create',
    GROUP_SUPPLIERS_UPDATE: 'supplier-groups.update',
    GROUP_SUPPLIERS_DELETE: 'supplier-groups.delete',
  
    // Khách hàng
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_UPDATE: 'users.update',
    USERS_DELETE: 'users.delete',
  
    // Nhân viên/Admin
    ADMIN_USERS_VIEW: 'admin-users.view',
    ADMIN_USERS_CREATE: 'admin-users.create',
    ADMIN_USERS_UPDATE: 'admin-users.update',
    ADMIN_USERS_DELETE: 'admin-users.delete',
  
    // Phân quyền
    ROLES_VIEW: 'roles.view',
    ROLES_CREATE: 'roles.create',
    ROLES_UPDATE: 'roles.update',
    ROLES_DELETE: 'roles.delete'
  };

  export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
