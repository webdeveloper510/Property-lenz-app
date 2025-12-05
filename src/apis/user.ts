import { ResponseObject, UserData, ManagerResponse, TenantResponse,StaffData } from '@/services/types';
import apiService from '@/services/ApiService';
interface MyManagerType {
	per_page: number;
	page_no: number;
	q?: string;
}


export const apiAllUsers = async (): Promise<ResponseObject<UserData>> => {
	const response = await apiService.get('/user/all');
	return response;
};
export const apiAllStaff = async (): Promise<ResponseObject<StaffData>> => {
	const response = await apiService.get('/user/getStaff');
	return response;
};
export const apiAllManager = async (data : MyManagerType): Promise<ResponseObject<ManagerResponse>> => {
	const response = await apiService.get('/user/list', data);
	return response;
};
export const apiAllTenant = async (data : MyManagerType): Promise<ResponseObject<TenantResponse>> => {
	const response = await apiService.get('/tenant/list', data);
	return response;
};

export const apiAddManager = async (data: UserData): Promise<ResponseObject<UserData>> => {
	const response = await apiService.postMultipart('/user/add', data);
	return response;
};

export const apiGetUserById = async (data : MyManagerType): Promise<ResponseObject<ManagerResponse>> => {
	const response = await apiService.get(`/user/details/${data}`);
	return response;
};
// under progress section ----------------------------------------------------------------
export const apiUpdateManager = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.putMultipart(`/user/update/${data.id}`, data);
	return response;
};
export const apiDeleteManager = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.delete(`/user/delete/${data.id}`);
	return response;
};
export const apiTenantManager = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.delete(`/tenant/delete/${data.id}`);
	return response;
};
