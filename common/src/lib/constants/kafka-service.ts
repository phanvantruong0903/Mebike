export const KAFKA_SERVICE = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
  RENTAL_SERVICE: 'rental-service',
  MEMBERSHIP_SERVICE: 'membership-service',
} as const;

export const KAFKA_GROUP_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
  PAYMENT_SERVICE: 'payment-service',
  RENTAL_SERVICE: 'rental-service',
  MEMBERSHIP_SERVICE: 'membership-service',
} as const;

export const KAFKA_CLIENT_ID = {
  USER_SERVICE: 'user-service',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATION_SERVICE: 'notification-service',
  FLEET_SERVICE: 'fleet-service',
  RENTAL_SERVICE: 'rental-service',
  MEMBERSHIP_SERVICE: 'membership-service',
} as const;

export const KAFKA_TOPIC = {
  USER_CREATED: 'user.created',
  USER_RESET_PASSWORD: 'notification.send_email_reset_password',
  STATION_CREATED: 'station.created',
  STATION_UPDATED: 'station.updated',
  WELCOME_EMAIL: 'notification.send_email_welcome',
  WALLET_CREATED: 'wallet.created',
  VERIFY_EMAIL: 'notification.send_email_verify_email',
  BIKE_CREATED: 'bike.created',
  BIKE_UPDATED: 'bike.updated',
  BIKE_CACHE_REFRESH: 'bike.cache_refresh',
} as const;
