import { Platform } from 'react-native';
export const ImageBaseUrl = 'http://13.61.148.252:9000/uploads/user_images/'
export const leaseStatus = [
    { name: 'Listed', value: 'LISTED' },
    { name: 'Moving In', value: 'MOVING_IN' },
    { name: 'Current', value: 'CURRENT' },
    { name: 'Current Renewal', value: 'CURRENT_RENEWAL' },
    { name: 'Moving Out', value: 'MOVING_OUT' },
    { name: 'Moving Out SD Pending', value: 'MOVING_OUT_SD_PENDING' },
    { name: 'SD Returned', value: 'SD_RETURNED' },
    { name: 'Moving In Roommate', value: 'MOVING_IN_ROOMMATE' },
    { name: 'Moving Out Roommate', value: 'MOVING_OUT_ROOMMATE' },
    { name: 'Moving Out SD Pending Roommate', value: 'MOVING_OUT_SD_PENDING_ROOMMATE' },
    { name: 'SD Returned Roommate', value: 'SD_RETURNED_ROOMMATE' },
  ];
  export const productSkus = Platform.select({
    android: [
        'recipe_app_premium',
    ],
});
