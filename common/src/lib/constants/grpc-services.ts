export const GRPC_SERVICES = {
  USER: 'UserService',
} as const;

export const GRPC_PACKAGE = {
  USER: 'USER_PACKAGE',
};

export const USER_METHODS = {
  CREATE: 'CreateUser',
  GET_ONE: 'GetUser',
  UPDATE: 'UpdateUser',
  GET_ALL: 'GetAllUsers',
  LOGIN: 'LoginUser',
} as const;
