import { ResponseObject, NewAreas, NewItem, Templates } from '@/services/types';
import apiService from '@/services/ApiService';
interface template {
	type: string;
}


export const apiGetAreas = async (data: any): Promise<ResponseObject<NewAreas>> => {
	const response = await apiService.get('/area/all', data);
	return response;
};

export const apiGetTemplates = async (): Promise<ResponseObject<any>> => {
	// console.log('api: ', data);
	const response = await apiService.get('/template/list', {
		page_no: 1,
		per_page: 100,
	});
	return response;
};

// /template/all-areas?type=TENENT_MOVE_IN
export const apiGetTemplatesAllAreas = async (data: template): Promise<ResponseObject<Templates>> => {
	// console.log('api: ', data);
	const response = await apiService.get('/template/all-areas/', data);
	return response;
};

export const apiNewPictureAreas = async (data: any): Promise<ResponseObject<NewAreas>> => {
	const response = await apiService.get(`/property/${data}/areas`);
	return response;
};

export const apiNewPictureItem = async (data: any): Promise<ResponseObject<NewItem>> => {
	const response = await apiService.get(`/area/item/all/${data}`);
	return response;
};

export const apiGetItems = async (): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/area/item/non-custom');
	return response;
};

