export const GRPC_SERVICES = {
  USER: 'UserService',
} as const;

export const USER_METHODS = {
  CREATE: 'CreateUser',
  GET_ONE: 'GetUser',
  UPDATE: 'UpdateUser',
  GET_ALL: 'GetAllUsers',
  LOGIN: 'LoginUser',
} as const;
