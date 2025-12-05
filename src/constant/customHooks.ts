import { apiGetCalendar } from '@/apis/calendar';
import { apiInspectionAll } from '@/apis/property';
import cacheService from '@/services/CacheServices';
import { propertyGet } from '@/services/types';

export const warningTimer = (sec: number): Promise<boolean> =>
  new Promise(resolve => setTimeout(() => resolve(true), sec * 1000));

export const formatDate = (value: string | Date | null,character: string = '-'): string | null => {
  if (value !== null) {
      const date = new Date(value);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${month}${character}${dayOfMonth}${character}${year}`;
  } else {
      return null;
  }
};
const eventNamesObject: any = {
  MOVE_IN: 'Move In',
  MOVE_OUT: 'Move Out',
  PET_INSPECTION: 'Pet Inspection',
  MANAGER_INSPECTION: 'General Inspection',
  INTERMITTENT_INSPECTION: 'Periodic Inspection',
  VIOLATION: 'Violation',
  LISTED: 'Listed',
  MOVING_IN: 'Moving In',
  MOVING_OUT: 'Moving Out',
  CURRENT: 'Current',
  CURRENT_RENEWAL: 'Current Renewal',
  MOVING_OUT_SD_PENDING: 'Moving Out SD Pending',
  SD_RETURNED: 'SD Returned',
  MOVING_IN_ROOMMATE: 'Moving In Roommate',
  MOVING_OUT_ROOMMATE: 'Moving Out Roommate',
  MOVING_OUT_SD_PENDING_ROOMMATE: 'Moving Out SD Pending Roommate',
  SD_RETURNED_ROOMMATE: 'SD Returned Roommate',
  SINGLE_FAMILY: 'Single Family',
  APARTMENT: 'Apartment',
  DUPLEX: 'Duplex',
  MULTI_FAMILY: 'Multi-family',
  COMMERCIAL: 'Commercial',
};
export const eventNames = (value: string) => {
  return eventNamesObject[value] || value;
};
const statusObject: any = {
  PENDING: 'P',
  NEW: 'N',
  SATISFACTORY: 'S',
  DAMAGE: 'D',
  ATTENTION: 'A',
  NOT_AVAILABLE: 'N/A',
};
export const formateStatus = (status: string) => {
  return statusObject[status] || status;
};
export const handleBedroomAndBathroomCount = (data: propertyGet) => {
  if (!data?.areas) {return { bedroom: 0, bathroom: 0 };}
  return data?.areas?.reduce(
    (counts, area) => {
      if (area?.title?.includes('Bedroom')) {counts.bedroom++;}
      if (area?.title?.includes('Bathroom')) {counts.bathroom++;}
      return counts;
    },
    { bedroom: 0, bathroom: 0 }
  );
};
export const dateTOIsoString = (date: Date | null): string | null => {
  return date ? date.toISOString().split('T')[0] : null;
};
const names:any = {
  MOVE_IN: 'Move In',
  MOVE_OUT: 'Move Out',
  MANAGER_INSPECTION: 'Manager',
  INTERMITTENT_INSPECTION: 'Intermittent',
};
export const formateInspectionName = (name: any)=>{
  return names[name] || name;
};
export const getAllInspection = async () => {
  const response = await apiInspectionAll();
  if (response.status) {
    await cacheService.setOfflineInspectionCache(response.result);
    await cacheService.makeAsyncResponse();
  }
};
