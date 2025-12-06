export const KAFKA_SERVICE = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
} as const;

export const KAFKA_GROUP_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
} as const;

export const KAFKA_CLIENT_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
} as const;

export const KAFKA_TOPIC = {
  USER_CREATED: 'user.created',
  USER_RESET_PASSWORD: 'notification.send_email_reset_password',
} as const;
