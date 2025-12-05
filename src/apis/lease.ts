// /tenant/all?q=sahir@tenant.com
import { ResponseObject } from '@/services/types';
import apiService from '@/services/ApiService';

interface Add {
    id?: number,
    tenant_id?: number,
    property_id?: any,
    status: string,
    start_date: any,
    end_date: any,
    move_in_date: any | null,
    move_out_date: any | null,
    sign_status: string | null,
    rent: number | null,
    comments: string | null,
}


export const apiGetLease = async (data: any): Promise<ResponseObject<any>> => {
    const response = await apiService.get(`/propertylease/list/${data}`);
    return response;
};
export const apiGetLeaseAll = async (data: any): Promise<ResponseObject<any>> => {
    const response = await apiService.get(`/propertylease/all/${data}`);
    return response;
};
export const apiLeaseAdd = async (data: Add): Promise<ResponseObject<any>> => {
	const response = await apiService.post(`/propertylease/add/${data.property_id}`, data);
	return response;
};
// "/update/:property_id/:id"
    export const apiUpdateLease = async (data: any): Promise<ResponseObject<Add>> => {
        const response = await apiService.put(`/propertylease/update/${data.property_id}/${data.id}`, data);
        return response;
    };
    export const apiDeleteLease = async (data: {lease_id: number}): Promise<ResponseObject<any>> => {
        const response = await apiService.delete(`/propertylease/delete/${data.lease_id}`);
        return response;
    };

