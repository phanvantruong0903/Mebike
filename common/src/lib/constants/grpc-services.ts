export const GRPC_SERVICES = {
  AUTH: 'AuthService',
  USER: 'UserService',
  NOTIFICATION: 'NotificationService',
} as const;

export const GRPC_PACKAGE = {
  AUTH: 'AUTH_PACKAGE',
  USER: 'USER_PACKAGE',
  NOTIFICATION: 'NOTIFICATION_PACKAGE',
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
  REGISTER: 'Register',
  RESET_PASSWORD_REQUEST: 'ResetPasswordRequest',
  RESET_PASSWORD: 'ResetPassword',
  VERIFY_OTP: 'VerifyOtp',
  GET_ACCOUNT_BY_ACCOUNT_ID: 'GetAccountByAccountIds',
  GET_STATS: 'GetUserStats',
} as const;
