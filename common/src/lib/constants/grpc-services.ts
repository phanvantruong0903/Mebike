export const GRPC_SERVICES = {
  AUTH: 'AuthService',
  USER: 'UserService',
  WAREHOUSE: 'WarehouseService',
  ZONE: 'ZoneService',
  RACK: 'RackService',
  BIN: 'BinService',
  STOCK: 'StockService',
  PRODUCT: 'ProductService',
} as const;

export const WAREHOUSE_METHODS = {
  // Warehouse
  CREATE_WAREHOUSE: 'CreateWarehouse',
  UPDATE_WAREHOUSE: 'UpdateWarehouse',
  GET_WAREHOUSE: 'GetWarehouse',
  LIST_WAREHOUSES: 'ListWarehouses',
  INACTIVATE_WAREHOUSE: 'InactivateWarehouse',
  ACTIVATE_WAREHOUSE: 'ActivateWarehouse',

  // Zone
  CREATE_ZONE: 'CreateZone',
  UPDATE_ZONE: 'UpdateZone',
  DELETE_ZONE: 'DeleteZone',
  LIST_ZONES: 'ListZones',

  // Rack
  CREATE_RACK: 'CreateRack',
  UPDATE_RACK: 'UpdateRack',
  DELETE_RACK: 'DeleteRack',
  LIST_RACKS: 'ListRacks',

  // Bin
  CREATE_BIN: 'CreateBin',
  UPDATE_BIN: 'UpdateBin',
  DELETE_BIN: 'DeleteBin',
  LIST_BINS: 'ListBins',
} as const;

export const STOCK_METHODS = {
  GET_STOCK_LEVEL: 'GetStockLevel',
  ADJUST_STOCK: 'AdjustStock',
} as const;

export const GRPC_PACKAGE = {
  AUTH: 'AUTH_PACKAGE',
  USER: 'USER_PACKAGE',
  INVENTORY: 'INVENTORY_PACKAGE',
};

export const USER_METHODS = {
  CREATE: 'CreateUser',
  GET_ONE: 'GetUser',
  UPDATE: 'UpdateUser',
  GET_ALL: 'GetAllUsers',
  LOGIN: 'LoginUser',
  REFRESH_TOKEN: 'RefreshToken',
  CHANGE_PASSWORD: 'ChangePassword',
  CREATE_PROFILE: 'CreateProfile',
  CHANGE_STATUS: 'ChangeStatus',
} as const;

export const PRODUCT_METHODS = {
  CREATE: 'CreateProduct',
  GET_ONE: 'GetProduct',
  UPDATE: 'UpdateProduct',
  GET_ALL: 'GetAllProducts',
  GET_DETAIL: 'GetProductDetail',
  CHANGE_STATUS: 'ChangeStatus',
} as const;
