export const GRPC_SERVICES = {
  AUTH: 'AuthService',
  USER: 'UserService',
} as const;

export const GRPC_PACKAGE = {
  AUTH: 'AUTH_PACKAGE',
  USER: 'USER_PACKAGE',
};

export const USER_METHODS = {
  REGISER: 'RegisterUser',
  CREATE: 'CreateUser',
  GET_ONE: 'GetUser',
  UPDATE: 'UpdateUser',
  GET_ALL: 'GetAllUsers',
  LOGIN: 'LoginUser',
  REFRESH_TOKEN: 'RefreshToken',
  CHANGE_PASSWORD: 'ChangePassword',
  CREATE_PROFILE: 'CreateProfile',
  CHANGE_STATUS: 'ChangeUserStatus',
} as const;
