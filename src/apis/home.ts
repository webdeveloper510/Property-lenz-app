// /tenant/all?q=sahir@tenant.com
import { ResponseObject } from '@/services/types';
import apiService from '@/services/ApiService';
import cacheService from '@/services/CacheServices';

export const apiGetAction = async (): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.get('/home/all');
		if (response.result) {
			cacheService.setOfflineCache('@actionItems', response.result, '');
		}
		return response;
	} else {
		const response = await cacheService.makeOfflineResponse('@actionItems');
		return response;
	}
};

export const apiGetReports = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/home/report', data);
	return response;
};
export const apiDownloadReport = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.get(`/inspection/generate/${data}`);
	return response;
};
export const apiNotification = async (): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/notification/list');
	return response;
};

