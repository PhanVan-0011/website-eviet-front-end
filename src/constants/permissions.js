// src/constants/permissions.js
export const PERMISSIONS = {
    DASHBOARD_VIEW: 'dashboard.view',
  
    // Đơn hàng
    ORDERS_VIEW: 'orders.view',
    ORDERS_CREATE: 'orders.create',
    ORDERS_UPDATE: 'orders.update',
    ORDERS_CANCEL: 'orders.cancel',
    ORDERS_UPDATE_STATUS: 'orders.update_status',

    ORDERS_UPDATE_PAYMENT: 'orders.update_payment',
  
    // Sản phẩm
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_UPDATE: 'products.update',
    PRODUCTS_DELETE: 'products.delete',

    // Promotion
    PROMOTIONS_VIEW: 'promotions.view',
    PROMOTIONS_CREATE: 'promotions.create',
    PROMOTIONS_UPDATE: 'promotions.update',
    PROMOTIONS_DELETE: 'promotions.delete',
  
    // Module khác
    CATEGORIES_MANAGE: 'categories.manage',
    COMBOS_MANAGE: 'combos.manage',
    SLIDERS_MANAGE: 'sliders.manage',
    POSTS_MANAGE: 'posts.manage',
  
    // Hệ thống
    USERS_MANAGE: 'users.manage',
    ROLES_MANAGE: 'roles.manage'
  };

  export const ALL_PERMISSIONS = Object.values(PERMISSIONS);