export const GRPC_SERVICES = {
  AUTH: 'AuthService',
} as const;

export const GRPC_PACKAGE = {
  AUTH: 'AUTH_PACKAGE',
};

export const USER_METHODS = {
  CREATE: 'CreateUser',
  GET_ONE: 'GetUser',
  UPDATE: 'UpdateUser',
  GET_ALL: 'GetAllUsers',
  LOGIN: 'LoginUser',
  REFRESH_TOKEN: 'RefreshToken',
} as const;
