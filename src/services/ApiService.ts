import { BASE_URL } from '@/constant/index';
import { ResponseObject } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ParamsObj {
	[key: string]: any;
}

interface GetRequest {
	(url: string, queryParams?: ParamsObj | undefined): Promise<ResponseObject<any>>
}
interface PostRequest {
	(url: string, bodyParams: ParamsObj, queryParams?: ParamsObj | undefined): Promise<ResponseObject<any>>
}
interface DeleteRequest {
	(url: string): Promise<ResponseObject<any>>
}

class ApiService {

	API_ERROR: ResponseObject<null> = {
		status: false,
		result: null,
		message: 'Something went wrong!!!',
	};

	constructor() {
		console.log('ApiService', BASE_URL);
	}


	get: GetRequest = async (url, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
			});
			if (response.ok) {
				const data = await response.json();
				return data;
			} else {
				console.log('res1: ', response);
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};
	getAuth: GetRequest = async (url, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;
             console.log("complete url======>",apiUrl)
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ',
				},
			});
			if (response.ok) {
				const data = await response.json();
				return data;
			} else {
				console.log('res1: ', response);
				return { ...this.API_ERROR };
			}
		} catch (error) {
			console.log('res2: ', error);
			return { ...this.API_ERROR };
		}
	};

	post: PostRequest = async (url, bodyParams, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify(bodyParams),
			});
			// console.log('postToken: ', token);

			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};

    postMultipart1: PostRequest = async (url, bodyParams, queryParams) => {
		try {
		const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

		const token = await this.getToken();

		if (!token) {
			console.log('Token Not Found');
			return { ...this.API_ERROR };
		}

		const formData = new FormData();

		// --- Universal append function ---
		const appendToFormData = (formData: any, key: any, value: any) => {
			if (value === null || value === undefined) return;

			// Handle file
			if (value?.uri && value?.name && value?.type) {
				formData.append(key, {
					uri: value.uri,
					name: value.name,
					type: value.type,
				});
				return;
			}

			// Handle array
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					appendToFormData(formData, `${key}[${index}]`, item);
				});
				return;
			}

			// Handle object
			if (typeof value === "object") {
				Object.keys(value).forEach(subKey => {
					appendToFormData(formData, `${key}[${subKey}]`, value[subKey]);
				});
				return;
			}

			// Primitive values
			formData.append(key, value);
		};

		// Append all body params safely
		Object.keys(bodyParams).forEach(key => {
			appendToFormData(formData, key, bodyParams[key]);
		});
		// --- API CALL ---
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + token,
			},
			body: formData,
		});
		if (response.ok) {
			return await response.json();
		} else {
			return { ...this.API_ERROR };
		}

	} catch (error) {
		return { ...this.API_ERROR };
	}
};

	postMultipart: PostRequest = async (url, bodyParams, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				console.log('Token Not Found',);
				return { ...this.API_ERROR };
				// return {
				// 	status: false,
				// 	result: null,
				// 	message: 'Token Not found',
				// };
			}
			const formData = new FormData();
			function appendToFormData(formData: any, key: any, value: any) {
				if (Array.isArray(value)) {
					value.forEach((item, index) => {
						for (let subKey in item) {
							if (Array.isArray(item[subKey])) {
								for (let j = 0; j < item[subKey].length; j++) {
									formData.append(`${key}[${index}][${subKey}][${j}]`, item[subKey][j]);
								}
							} else {
								formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
							}
						}
					});
				} else {
					formData.append(key, value);
				}
			}
			for (let key in bodyParams) {
				appendToFormData(formData, key, bodyParams[key]);
				// console.log(formData);
			}
			// for (let key in bodyParams) {
			// 	formData.append(key, bodyParams[key]);
			// }

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					// 'Content-Type': 'multipart/form-data; charset=utf-8; boundary=' + Math.random().toString().substr(2),
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
				// return {
				// 	status: false,
				// 	result: null,
				// 	message: 'Response failed',
				// };
			}
		} catch (error) {
			return { ...this.API_ERROR };
			// return {
			// 	status: false,
			// 	result: null,
			// 	message: `Catch error ${JSON.stringify(error)}`,
			// };
		}
	};


	patch: PostRequest = async (url, bodyParams, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}

			const response = await fetch(apiUrl, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify(bodyParams),
			});

			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};
	put: PostRequest = async (url, bodyParams, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}

			const response = await fetch(apiUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify(bodyParams),
			});

			if (response.ok) {
				const data = await response.json();
				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};
	putMultipart: PostRequest = async (url, bodyParams, queryParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}${this.makeGetParamsString(queryParams)}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}

			const formData = new FormData();
			function appendToFormData(formData: any, key: any, value: any) {
				if (Array.isArray(value)) {
					value.forEach((item, index) => {
						for (let subKey in item) {
							formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
						}
					});
				} else {
					formData.append(key, value);
				}
			}
			for (let key in bodyParams) {
				appendToFormData(formData, key, bodyParams[key]);
				// console.log(formData);
			}
			// for (let key in bodyParams) {
			// 	formData.append(key, bodyParams[key]);
			// }

			const response = await fetch(apiUrl, {
				method: 'PUT',
				headers: {
					// 'Content-Type': 'multipart/form-data; charset=utf-8; boundary=' + Math.random().toString().substr(2),
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};


	delete: DeleteRequest = async (url) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}`;

			const token = await this.getToken();

			if (!token) {
				return { ...this.API_ERROR };
			}

			const response = await fetch(apiUrl, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
			});

			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};

	auth: PostRequest = async (url, bodyParams) => {
		try {
			const apiUrl: string = `${BASE_URL}${url}`;
			console.log("🚀 ~ ApiService ~ apiUrl:", apiUrl)

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify(bodyParams),
			});
			if (response.ok) {
				const data = await response.json();

				return data;
			} else {
				return { ...this.API_ERROR };
			}
		} catch (error) {
			return { ...this.API_ERROR };
		}
	};


	async getToken(): Promise<(string | null)> {
		try {
			const jsonValue = await AsyncStorage.getItem('@apiToken');
			return (jsonValue != null) ? jsonValue : null;
		} catch (e) {
			return null;
		}
	}

	async setToken(token: string): Promise<boolean> {
		// console.log(token);
		try {
			await AsyncStorage.setItem('@apiToken', token);
			return true;
		} catch (e) {
			return false;
		}
	}


	private makeGetParamsString(params: ParamsObj | undefined): string {
		if (!params || Object.keys(params).length === 0) {
			return '';
		}

		return '?' +
			Object.keys(params).map(function (key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
			}).join('&');
	}
}

const apiService = new ApiService();
export default apiService;
