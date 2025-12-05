import { ResponseObject, CalendarResult } from '@/services/types';
import apiService from '@/services/ApiService';
import cacheService from '@/services/CacheServices';
interface calendarData {
    start_date: string,
    end_date: string
}


export const apiGetCalendar = async (data: calendarData): Promise<ResponseObject<CalendarResult>> => {
    // const online = await cacheService.checkIsOnline();
    // if (online) {
        const response = await apiService.get('/calendar/list', data);
        return response;
    // } else {
    //     const response = await cacheService.makeOfflineResponse('@inspectionData', {screen: 'calendar', date: data});
    //     return response;
    // }
};


