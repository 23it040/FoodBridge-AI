export const USER_ROLES = {
  DONOR: 'donor',
  NGO: 'ngo',
  ADMIN: 'admin',
  VOLUNTEER: 'volunteer',
};

export const DONOR_TYPES = {
  RESTAURANT: 'restaurant',
  HOTEL: 'hotel',
  BAKERY: 'bakery',
  EVENT_ORGANIZER: 'event_organizer',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const FOOD_CATEGORIES = {
  VEG: 'veg',
  NON_VEG: 'non_veg',
  VEGAN: 'vegan',
  BAKED: 'baked',
  PACKAGED: 'packaged',
  MIXED: 'mixed',
};

export const QUANTITY_UNITS = {
  KG: 'kg',
  SERVINGS: 'servings',
  PIECES: 'pieces',
  LITERS: 'liters',
};

export const DONATION_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const REQUEST_TYPES = {
  DEMAND: 'demand',
  PICKUP: 'pickup',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const NOTIFICATION_TYPES = {
  DONATION: 'donation',
  REQUEST: 'request',
  PICKUP: 'pickup',
  EXPIRY: 'expiry',
  REVIEW: 'review',
  SYSTEM: 'system',
  VERIFICATION: 'verification',
};

export const ANALYTICS_TYPES = {
  PLATFORM: 'platform',
  DONOR: 'donor',
  NGO: 'ngo',
};

export const ANALYTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};
