
import { ResponseObject, InspectionGet, propertyGet, addProperty , AddInspectionRes, AddInspectionPay} from '@/services/types';
import apiService from '@/services/ApiService';
import cacheService from '@/services/CacheServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface P {
	id: number;
	type: string;
	name: string;
	location: string;
	cover_image: string | null;
	address?: string;
	address_line_2?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	zip?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	notes?: string | null;
	created_at?: string;
	updated_at?: string | null;
	manager_id?: number | null;
	owner_id?: number;
}[];
interface List {
	data: InspectionGet
  }
  interface CompleteIns {
	inspection_id: number,
	final_comments: string,
	optional_comments: string
  }

export const apiGetMyProperties = async (): Promise<ResponseObject<P>> => {
	const response = await apiService.get('/property/all');
	return response;
};
export const apiGetPropertyList = async (data: any): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.get('/property/list', data);
		if (response.status) {
			await cacheService.setOfflineCache('@propertyData',response.result, '');
		}
		return response;
	} else {
		const response = await cacheService.makeOfflineResponse('@propertyData');
		return response;
	}
};

export const apiGetInspectionStatus = async (data:any)=>{	
	const response = await apiService.get(`/inspection/changeInspectionStatus/${data}`);
	return response
}

export const apiGetTypeInspection = async (data:any)=>{
	const response = await apiService.get('/inspection/', data);
	return response
}
export const apiGetSpecificProperty = async (data: any): Promise<ResponseObject<propertyGet>> => {
	const response = await apiService.get(`/property/details/${data}`);
	return response;
};
export const apiAddMyProperties = async (data: addProperty): Promise<ResponseObject<any>> => {
	const response = await apiService.postMultipart('/property/add', data);
	return response;
};

export const apiAddMySingleProperties = async(data:addProperty):Promise<ResponseObject<any>> =>{
	const response = await apiService.postMultipart1('/property/addMultipleProperty',data);
	return response
}
export const apiUpdateProperties = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.putMultipart(`/property/update/${data.id}`, data);
	return response;
};
export const apiDeleteProperties = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.delete(`/property/delete/${data.id}`);
	return response;
};

// ------------------ inspection --------------------------------
export const apiInspectionAll = async (): Promise<ResponseObject<List>> => {
		const response = await apiService.get('/inspection/all');
		return response;
};

export const apiInspectionListData = async (): Promise<ResponseObject<List>> => {
		const response = await apiService.get('/inspection/inspectionList/');
		return response;
};
export const apiInspectionlistById = async (data:any): Promise<ResponseObject<List>> => {
	console.log("🚀 ~ apiInspectionlistById ~ data:", data)
	
		const response = await apiService.get('/inspection/inspectionList?q='+data);
		return response;
};
export const apiInspectionList = async (data: { per_page: number, property_id?: any, is_completed?: number }): Promise<ResponseObject<List>> => {
		const response = await apiService.get('/inspection', data);
		return response;
};
export const apiSpecificInspection = async (data: number): Promise<ResponseObject<InspectionGet>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.get(`/inspection/${data}`);
		return response;
	} else {
		const response = await cacheService.makeOfflineResponse('@inspectionData', {screen: 'specific inspection', id: data});
		return response;
	}
};
export const apiInspectionAdd = async (data: AddInspectionPay): Promise<ResponseObject<AddInspectionRes>> => {
	const response = await apiService.post('/inspection/add', data);
	return response;
};
// /inspection/check-tenant/66/2
export const apiInspectionCheck = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.get(`/inspection/check-tenant/${data.property_id}/${data.tenant_id}`, data);
	return response;
};

// /update-area-item/:id/:area_id/:item_id
export const apiUpdateStatus = async (data: any): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.put(`/inspection/update-area-item/${data.id}/${data.area_id}/${data.item_id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiUpdateStatus', data);
		return response;
	}
};
export const apiUpdateInspectionImage = async (data: any): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.postMultipart(`/inspection/image/${data.id}/${data.area_id}/${data.item_id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiUpdateInspectionImage', data);
        return response;
	}
};
export const apiActivity_images = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.postMultipart('/property/property_activity_images', data);
	return response;
};
export const apiCompleteInspection = async (data: CompleteIns): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.postMultipart(`/inspection/complete/${data.inspection_id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiCompleteInspection',data);
		return response;
	}
};
export const apiInspectorSign = async (data: {id: number, inspector_sign: any}): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	console.log("🚀 ~ apiInspectorSign ~ online:", online)
	
	if (online) {
		const response = await apiService.postMultipart(`/inspection/sign/${data.id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiInspectorSign', data);
		return response;
	}
};
export const apiRenterSign = async (data: {id: number | undefined, tenant_sign: any}): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.postMultipart(`/inspection/tenant-sign/${data.id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiRenterSign', data);
		return response;
	}
};
// /inspection/update-area-item-status/ins:3/area:5
export const apiMarkAll = async (data: any): Promise<ResponseObject<any>> => {
	const online = await cacheService.checkIsOnline();
	if (online) {
		const response = await apiService.put(`/inspection/update-area-item-status/${data.id}/${data.area_id}`, data);
		return response;
	} else {
		const response = await cacheService.asyncInspectionCache('apiMarkAll', data);
        return response;
	}
};
export const apiDeleteInspection = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.delete(`/inspection/delete/${data}`);
	return response;
};
//  ------------------- timeline ----------------
// /property/:property_id/timeline
export const apiTimeLine = async (data: any): Promise<ResponseObject<InspectionGet>> => {
	const response = await apiService.get(`/property/${data}/timeline`,);
	return response;
};
