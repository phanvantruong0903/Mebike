export const USER_MESSAGES = {
  CREATE_SCUCCESS: 'User created successfully',
  UPDATE_SUCCESS: 'User updated successfully',
  GET_ALL_SUCCESS: 'Users retrieved successfully',
  GET_DETAIL_SUCCESS: 'User details retrieved successfully',
  DELETE_SUCCESS: 'User deleted successfully',
  NOT_FOUND: 'User not found',
  VALIDATION_ERROR: 'Validation error',
  CREATE_FAILED: 'Create User failed',
  VALIDATION_FAILED: 'Username or Password incorrect',
  LOGIN_SUCCESS: 'User Login Successfully',
  EMAIL_EXISTED: 'Email has been used',
};

export const SERVER_MESSAGE = {
  INTERNAL_SERVER: 'Interal Server Error',
  VALIDATION_FAILED: 'Validation Failed',
  DATABASE_ERROR: 'Database Error',
  FOREIGN_KEY_FAILED: 'Foreign key constraint failed',
  FOREIGN_KEY_INVALID: (field: string) => `Field ${field} invalid`,
  UNIQUE_CONSTRAINT_FAILED: 'Unique constraint failed',
  UNEXPECTED_ERROR: 'Unexpected Error',
  RCP_EXCEPTION: 'Rcp Exception',
};
