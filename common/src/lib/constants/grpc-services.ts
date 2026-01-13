export const GRPC_SERVICES = {
  AUTH: 'AuthService',
  USER: 'UserService',
  NOTIFICATION: 'NotificationService',
  FLEET: 'FleetService',
  PAYMENT: 'PaymentService',
  TRANSACTION: 'TransactionService',
  RENTAL: 'RentalService',
  MEMBERSHIP: 'MembershipService',
  INCIDENT: 'IncidentService',
} as const;

export const GRPC_PACKAGE = {
  AUTH: 'AUTH_PACKAGE',
  USER: 'USER_PACKAGE',
  NOTIFICATION: 'NOTIFICATION_PACKAGE',
  FLEET: 'FLEET_PACKAGE',
  PAYMENT: 'PAYMENT_PACKAGE',
  TRANSACTION: 'TRANSACTION_PACKAGE',
  RENTAL: 'RENTAL_PACKAGE',
  MEMBERSHIP: 'MEMBERSHIP_PACKAGE',
  STATION: 'STATION_PACKAGE',
  BIKE: 'BIKE_PACKAGE',
  SOS: 'SOS_PACKAGE',
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
  LOGOUT: 'Logout',
  VERIFY_EMAIL: 'VerifyEmail',
  VERIFY_EMAIL_PROCESS: 'VerifyEmailProcess',
  USER_VERIFY: 'UserVerify',
  DELETE: 'DeleteUser',
  GET_USERS_BY_ACCOUNT_IDS: 'GetUsersByAccountIds',
  FIND_FREE_SOS: 'FindFreeSos',
} as const;

export const SUPPLIER_METHODS = {
  CREATE: 'CreateSupplier',
  GET_ONE: 'GetSupplier',
  UPDATE: 'UpdateSupplier',
  GET_ALL: 'GetAllSuppliers',
  CHANGE_STATUS: 'ChangeSupplierStatus',
  GET_STATS: 'GetSupplierStats',
  GET_SUPPLIERS_BY_IDS: 'GetSupplierByIds',
} as const;

export const STATION_METHODS = {
  CREATE: 'CreateStation',
  GET_ONE: 'GetStation',
  UPDATE: 'UpdateStation',
  GET_ALL: 'GetAllStations',
  GET_STATIONS_BY_IDS: 'GetStationsByIds',
  UPDATE_STATUS: 'UpdateStationStatus',
  STATION_EXIST: 'StationExist',
} as const;

export const BIKE_METHODS = {
  CREATE: 'CreateBike',
  GET_ONE: 'GetBike',
  UPDATE: 'UpdateBike',
  GET_ALL: 'GetAllBikes',
  CHANGE_STATUS: 'ChangeBikeStatus',
  GET_BIKES_BY_IDS: 'GetBikesByIds',
};

export const PAYMENT_METHODS = {
  CREATE_PAYMENT_URL: 'CreatePaymentUrl',
  PAYMENT_CALLBACK: 'PaymentCallback',
  CREATE_WALLET: 'CreateWallet',
  DEBIT_RENTAL: 'DebitRental',
  GET_WALLET: 'GetWallet',
  GET_ALL_WALLET: 'GetAllWallets',
  CHANGE_WALLET_STATUS: 'ChangeWalletStatus',
};

export const TRANSACTION_METHODS = {
  GET_ONE: 'GetTransaction',
  GET_ALL: 'GetAllTransactions',
  CREATE_WITHDRAW: 'CreateWithdraw',
  UPDATE_WITHDRAW_STATUS: 'UpdateWithdrawStatus',
  GET_ALL_WITHDRAW: 'GetAllWithdraws',
  GET_ONE_WITHDRAW: 'GetWithdraw',
};

export const RENTAL_METHODS = {
  CREATE: 'CreateRental',
  END: 'EndRental',
  GET_ONE: 'GetRental',
  GET_ALL: 'GetRentalList',
  SUMMARIZE: 'SummarizeRentals',
};

export const RESERVATION_METHODS = {
  CREATE: 'CreateReservation',
  CONFIRM: 'ConfirmReservation',
  GET_ONE: 'GetReservation',
  GET_ALL: 'GetReservationList',
};

export const SUBSCRIPTION_METHODS = {
  CREATE: 'CreateSubscription',
  GET_ONE: 'GetSubscription',
  GET_ALL: 'GetSubscriptionList',
  ACTIVATE: 'ActivateSubscription',
  EXPIRE: 'ExpireSubscription',
};

export const PACKAGE_METHODS = {
  CREATE: 'CreatePackage',
  UPDATE: 'UpdatePackage',
  GET_ONE: 'GetPackage',
  GET_ALL: 'GetPackageList',
};

export const SOS_METHODS = {
  CREATE: 'CreateSos',
  GET_ONE: 'GetSos',
  UPDATE: 'UpdateSos',
  GET_ALL: 'GetAllSos',
};
