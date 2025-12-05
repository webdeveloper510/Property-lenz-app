// /tenant/all?q=sahir@tenant.com
import { ResponseObject, SearchTenant } from '@/services/types';
import apiService from '@/services/ApiService';
import { Create_Tenant } from '@/services/types';

interface MyTenant {
	per_page?: number;
	page_no?: number;
	sort_by?: number;
	sort_type?: number;
	q?: string;
}
interface InviteTenant {
	lease_id: number;
	type: string;
	message: string;
	movein_invite_on: any;
	movein_disable_on: any;
}


export const apiSearchTenant = async (data: {q?: string}): Promise<ResponseObject<SearchTenant>> => {
	const response = await apiService.get('/tenant/all', data);
	return response;
};
export const apiMyTenant = async (data: MyTenant): Promise<ResponseObject<SearchTenant>> => {
	const response = await apiService.get('/tenant/list',);
	return response;
};
export const apiCreateTenant = async (data: Create_Tenant): Promise<ResponseObject<any>> => {
	const response = await apiService.post('/tenant/add', data);
	return response;
};
export const apiUpdateTenant = async (data: Create_Tenant): Promise<ResponseObject<any>> => {
	const response = await apiService.put(`/tenant/update/${data.id}`, data);
	return response;
};
export const apiDeleteTenant = async (data: {id: number}): Promise<ResponseObject<any>> => {
	const response = await apiService.delete(`/tenant/delete/${data.id}`,);
	return response;
};
export const apiInviteTenant = async (data: InviteTenant): Promise<ResponseObject<any>> => {
	const response = await apiService.post('/propertylease/invite-tenant', data);
	return response;
};

export const apiGetTenantById = async (data: {id : number}): Promise<ResponseObject<any>> => {
	console.log("params data=======>",data.id)
	const response = await apiService.get(`/tenant/getTenantById/${data.id}`);
	return response;
};
