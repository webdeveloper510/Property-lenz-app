
import { ResponseObject, UserDataObject , LoginData, ResetPasswordData, RegisterData, UserData, UpdatePassword, SocialLogin } from '@/services/types';
import apiService from '@/services/ApiService';
interface RegResponse {
	user_id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null,
	created_at: string;
	updated_at: string;
}

export const apiLogin = async (data: LoginData): Promise<ResponseObject<UserDataObject>> => {
	const response = await apiService.auth('/auth/login', data);

	if (response.status) {
		const token = response.result.authToken;
		console.log( token);
		apiService.setToken(token);
	}

	return response;
};
export const apiSocialLogin = async (data: any): Promise<ResponseObject<UserDataObject>> => {
	const response = await apiService.auth('/auth/social-signin', data);

	if (response.status) {
		const token = response.result.authToken;
		console.log( token);
		apiService.setToken(token);
	}

	return response;
};
export const apiTenantLogin = async (data: any): Promise<ResponseObject<UserDataObject>> => {
	
	console.log("🚀 ~ apiTenantLogin ~ data:", data)
	const response = await apiService.auth('/auth/login-tenant', data);

	if (response.status) {
		const token = response.result.authToken;
		console.log( token);
		apiService.setToken(token);
	}

	return response;
};

export const apiRegister = async (data: RegisterData): Promise<ResponseObject<RegResponse>> => {
	const response = await apiService.auth('/auth/register', data);
	return response;
};
export const apiLogout = async (): Promise<ResponseObject<any>> => {
	const response = await apiService.post('/auth/logout', {});
	return response;
};
export const apiTenantLogOut = async (): Promise<ResponseObject<any>> => {
	const response = await apiService.post('/auth/logout-tenant', {});
	return response;
};


export const apiUpdateProfile = async (data: any): Promise<ResponseObject<any>> => {
	const response = await apiService.postMultipart('/auth/update-profile', data);
	console.log("🚀 ~ apiUpdateProfile ~ response:", response)
	return response;
};

export const apiUpdatePassword = async (data: UpdatePassword): Promise<ResponseObject<any>> => {
	const response = await apiService.patch('/auth/update-password', data);
	return response;
};

export const apiGetProfile = async (data: UserData): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/auth/profile', data);
	return response;
};


export const apiGetCheckTrails = async (): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/user/checkTrial');
	return response;
};

export const apiForgotPassword = async (data: {email: string}) : Promise<ResponseObject<any>> => {
	return await apiService.auth('/auth/forgot-password', data);
};

export const apiResetPassword = async (data: ResetPasswordData) : Promise<ResponseObject<any>> => {
	return await apiService.auth('/reset-password', data);
};
export const apiGetPackages = async () : Promise<ResponseObject<any>> => {
	return await apiService.get('/package/list');
};
export const apiGetKey = async (data: any) : Promise<ResponseObject<any>> => {
	return await apiService.getAuth(`/payment/sheet/${data}`, data);
};
export const apiSubscribe = async (data: {user_id: number, package_id: number}) : Promise<ResponseObject<any>> => {
	const response = await apiService.auth(`/subscription/add/${data.user_id}/${data.package_id}`, data);
	return response;
};
export const apiUpdateSubscription = async (data: {package_id: number}) : Promise<ResponseObject<any>> => {
	const response = await apiService.put(`/subscription/update/${data.package_id}`, data);
	return response;
};
export const apiCancelSubscribe = async () : Promise<ResponseObject<any>> => {
	const response = await apiService.delete('/subscription/cancel' );
	return response;
};
// IOS
export const apiIOSValidate = async (data:{userId: number, receiptData: any}) : Promise<ResponseObject<any>> => {
	return await apiService.post('/subscription/validate-receipt-ios', data);
};
export const apiIOSPackageValidate = async (packageId: any) : Promise<ResponseObject<any>> => {
	return await apiService.get(`/subscription/validate-package-ios/${packageId}`);
};
