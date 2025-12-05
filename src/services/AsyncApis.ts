import apiService from './ApiService';
import { ResponseObject } from './types';
interface CompleteIns {
	inspection_id: number,
	final_comments: string,
	optional_comments: string
}

export const apiMarkAll = async (data: any): Promise<ResponseObject<any>> => {
    const response = await apiService.put(`/inspection/update-area-item-status/${data.id}/${data.area_id}`, data);
    return response;
};
export const apiUpdateStatus = async (data: any): Promise<ResponseObject<any>> => {
    const response = await apiService.put(`/inspection/update-area-item/${data.id}/${data.area_id}/${data.item_id}`, data);
    return response;
};
export const apiUpdateInspectionImage = async (data: any): Promise<ResponseObject<any>> => {
    const response = await apiService.postMultipart(`/inspection/image/${data.id}/${data.area_id}/${data.item_id}`, data);
    return response;
};
export const apiCompleteInspection = async (data: CompleteIns): Promise<ResponseObject<any>> => {
    const response = await apiService.postMultipart(`/inspection/complete/${data.inspection_id}`, data);
    return response;
};
export const apiInspectorSign = async (data: { id: number, inspector_sign: any }): Promise<ResponseObject<any>> => {
    const response = await apiService.postMultipart(`/inspection/sign/${data.id}`, data);
    return response;
};
export const apiRenterSign = async (data: { id: number | undefined, tenant_sign: any }): Promise<ResponseObject<any>> => {
    const response = await apiService.postMultipart(`/inspection/tenant-sign/${data.id}`, data);
    return response;
};
