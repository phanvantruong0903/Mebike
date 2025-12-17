export const KAFKA_SERVICE = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
} as const;

export const KAFKA_GROUP_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
  PAYMENT_SERVICE: 'payment-service',
} as const;

export const KAFKA_CLIENT_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
} as const;

export const KAFKA_TOPIC = {
  USER_CREATED: 'user.created',
  USER_RESET_PASSWORD: 'notification.send_email_reset_password',
  STATION_CREATED: 'station.created',
  STATION_UPDATED: 'station.updated',
  WELCOME_EMAIL: 'notification.send_email_welcome',
  WALLET_CREATED: 'wallet.created',
} as const;
