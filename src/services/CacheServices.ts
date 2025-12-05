import { BASE_URL } from '@/constant/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionGet, ResponseObject } from './types';
import { apiCompleteInspection, apiInspectorSign, apiMarkAll, apiRenterSign, apiUpdateInspectionImage, apiUpdateStatus } from './AsyncApis';
import { warningTimer } from '@/constant/customHooks';
const CHECK_URL: string = 'https://www.google.com';

interface CacheApi {
	(name: string, data: any): Promise<ResponseObject<any>>;
}

const apis_obj: any = {
	apiMarkAll: apiMarkAll,
	apiUpdateStatus: apiUpdateStatus,
	apiUpdateInspectionImage: apiUpdateInspectionImage,
	apiCompleteInspection: apiCompleteInspection,
	apiInspectorSign: apiInspectorSign,
	apiRenterSign: apiRenterSign,
};

class CacheService {
	private isLocked: boolean = false;
	API_ERROR: ResponseObject<null> = {
		status: false,
		result: null,
		message: 'Something went wrong!',
	};

	constructor() {
		console.log('ApiService', BASE_URL);
	}
	async checkIsOnline(): Promise<boolean> {
		try {
			const response = await fetch(CHECK_URL, { method: 'HEAD' });
			return response.ok;
		} catch (error) {
			return false;
		}
	}
	async resetData(): Promise<boolean> {
		try {
			await AsyncStorage.removeItem('@userData');
			await AsyncStorage.removeItem('@inspectionData');
			await AsyncStorage.removeItem('@propertyData');
			await AsyncStorage.removeItem('@actionItems');
			await AsyncStorage.removeItem('@inspectionS');
			await AsyncStorage.removeItem('@packageData');
			return true;
		} catch (error) {
			return false;
		}

	}
	async getAsyncItem(key: string): Promise<any> {
		try {
			let response = await AsyncStorage.getItem(key);
			return response ? JSON.parse(response) : null;
		} catch (error) {
			return null;
		}
	}

	async setOfflineCache(key: string, data: any, from: string): Promise<boolean> {
		console.log(`set ${key} ${from}`);
		try {
				await AsyncStorage.setItem(key, JSON.stringify(data));
				return true;
		} catch (e) {
			console.log(`set ${key} failed!`);
			return false;
		}
	}
	async setOfflineInspectionCache(data: any): Promise<boolean> {
		try {
			const cached = await this.getAsyncItem('@inspectionData');
			const cachedData = Array.isArray(cached) ? cached : cached ? [cached] : [];
			if (cached) {
				const newIds = Array.isArray(data) ? data.map((item: any) => item.id) : [data.id];
				// remove items which are not in the data to maintain async updated
				let updatedCachedData = cachedData.filter((item: any) => newIds.includes(item.id));
				// Add new data entries which are not in cached data
				const newData = Array.isArray(data) ? data : [data];
				for (const item of newData) {
					if (!updatedCachedData.some((cachedItem: any) => cachedItem.id === item.id)) {
						updatedCachedData.push(item);
					}
				}
				await AsyncStorage.setItem('@inspectionData', JSON.stringify(updatedCachedData));
				console.log('set @inspection from cached');
			} else {
				console.log('set @inspection from data');
				await AsyncStorage.setItem('@inspectionData', JSON.stringify(data));

			}
			return true;
		} catch (error) {
			return false;
		}
	}
	// @inspectionData, @propertyData, @actionItems, @inspectionS,

	cacheUpdate = async (name: string, data: any): Promise<void> => {
		let response: any = await this.makeOfflineResponse('@inspectionData');
		if (response.status) {
			let toUpdate = response.result.filter((item: any) => item.id !== data?.id || data?.inspection_id);
			if (['apiMarkAll', 'apiUpdateStatus', 'apiUpdateInspectionImage'].includes(name)) {
				toUpdate = [...toUpdate, data];
				await this.setOfflineCache('@inspectionData', toUpdate, 'updateCache');
			} else if (name == 'apiCompleteInspection') {
				let findOne = response.result.find((ins: any) => ins.id === data?.inspection_id);
				if (findOne) {
					findOne.is_completed = 1;
					findOne.is_signed = ['INTERMITTENT_INSPECTION', 'MANAGER_INSPECTION'].includes(findOne.activity) ? 1 : 0;
					findOne.final_comments = '';
					findOne.optional_comments = data?.optional_comments || '';
					findOne.signed_at = ['INTERMITTENT_INSPECTION', 'MANAGER_INSPECTION'].includes(findOne.activity) ? new Date().toISOString() : null;
					toUpdate = [...toUpdate, findOne];
					await this.setOfflineCache('@inspectionData', toUpdate, 'updateCache');
				}
			} else if (name == 'apiInspectorSign') {
				let findOne = response.result.find((ins: any) => ins.id == data?.id);
				if (findOne) {
					findOne.inspector_sign = data.inspector_sign;
					toUpdate = [...toUpdate, findOne];
					await this.setOfflineCache('@inspectionData', toUpdate, 'updateCache');
				}
			} else if (name == 'apiRenterSign') {
				let findOne = response.result.find((ins: any) => ins.id == data?.id);
				if (findOne) {
					findOne.tenant_sign = data.tenant_sign;
					toUpdate = [...toUpdate, findOne];
					await this.setOfflineCache('@inspectionData', toUpdate, 'updateCache');
				}
			}
		}
	};
	async generateCalendar(startDate:any, endDate: any, data: any) {
		let dateObject: any = {};
		let currentDate = new Date(startDate);
		let end = new Date(endDate);

		while (currentDate <= end) {
			let dateKey = currentDate.toISOString().split('T')[0];
			if (!dateObject[dateKey]) {
				dateObject[dateKey] = [];
			}
			for (const item of data) {
				let formattedDate = new Date(item.created_at).toISOString().split('T')[0];

				if (formattedDate == dateKey) {
					let updated = {
						id: item.id,
						property_id: item.property.id,
						created_by: item.created_by,
						name: item.property.name,
						activity: item.activity,
						inspection_date: item.inspection_date,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        final_comments: item.final_comments,
                        inspector_sign: item.inspector_sign,
						tenant_sign: item.tenant_sign,
                        is_completed: item.is_completed,
                        complete_at: item.complete_at,
                        tenants: item.tenants,
					};

					dateObject[dateKey].push(updated);
				}
			}

			// Move to the next day
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dateObject;
	}
	offlineDataHandler = async (action: { screen: string, id?: number, date?: {start_date: any, end_date: any}}, data: any) => {
		try {
			let parsedData = JSON.parse(data);
			if (action.screen.includes('details inspection')) {
				const filtered = parsedData.filter((ins: any) => ins.property_id == action.id && ins.is_completed == 0);
				return {
					status: true,
					result: { data: filtered },
					message: 'Success',
				};
			} else if (action.screen.includes('details property')) {
				const filtered = parsedData.data.find((prt: any) => prt.id == action.id);
				return {
					status: true,
					result: { ...filtered },
					message: 'Success',
				};
			} else if (action.screen.includes('specific inspection')) {
				let filtered = parsedData.find((ins: any, i: number) => {
					return ins.id == action.id;
				}
				);
				return {
					status: true,
					result: { ...filtered },
					message: 'Success',
				};
			} else if (action.screen.includes('calendar')) {
				let calendarData = await this.generateCalendar(action.date?.start_date, action.date?.end_date, parsedData);
				// console.log(JSON.stringify(calendarData, null, 2));
				return {
					status: true,
					result: calendarData,
					message: 'Success',
				};
			} else {
				return {
					status: true,
					result: parsedData,
					message: 'Success',
				};
			}
		} catch (error) {
			return {
				status: false,
				result: null,
				message: 'Failed to process offline data',
			};
		}
	};
	async makeOfflineResponse(key: string, action?: { screen: string, id?: number, date?: {start_date: any, end_date: any} }): Promise<ResponseObject<any>> {
		try {
			let response = await AsyncStorage.getItem(key);
			if (response) {
				if (action) {
					return this.offlineDataHandler(action, response);
				} else {
					return {
						status: true,
						result: JSON.parse(response),
						message: 'Success',
					};
				}
			} else {
				console.log('2: offline empty');
				return { ...this.API_ERROR };
			}
		} catch (e) {
			console.log('2: offline failed', e);
			return { ...this.API_ERROR };
		}
	}
	async makeAsyncResponse(): Promise<boolean> {
		if (this.isLocked) {
            console.log('makeAsyncResponse is already running. Exiting.');
            return false;
        }
		this.isLocked = true;
		try {
			let response: any[] | null = await this.getAsyncItem('@inspectionS');
			let indexToRemove: number[] = [];

			if (response && response.length > 0) {
				for (const [index, item] of response.entries()) {
					const network = await this.checkIsOnline();

					if (network) {
						const res = await apis_obj[item.name](item.data);
						console.log('API response: ', res);

						if (res.status) {
							// Mark index for removal
							indexToRemove.push(index);
						} else if (
							['apiInspectorSign', 'apiRenterSign'].includes(item.name) &&
							!res.status
						) {
							// Retry logic for specific APIs
							for (let attempt = 1; attempt <= 3; attempt++) {
								await warningTimer(2);
								const retryRes = await apis_obj[item.name](item.data);
								console.log(`Retry attempt ${attempt}: `, retryRes);

								if (retryRes.status) {
									indexToRemove.push(index);
									break;
								}
							}
						}
					}
				}

				// Remove items from AsyncStorage in one go
				const updatedResponse = response.filter((_, i) => !indexToRemove.includes(i));
				await this.setOfflineCache('@inspectionS', updatedResponse, 'makeAsyncResponse');

				console.log('Updated response saved: ', JSON.stringify(updatedResponse, null, 2));
			}

			return true;
		} catch (e) {
			console.log('makeAsyncResponse error: ', e);
			return false;
		} finally {
			this.isLocked = false;
		}
	}


	asyncInspectionCache: CacheApi = async (name: string, data: any): Promise<ResponseObject<any>> => {
		try {
			let apiRequests: { name: string; data: any }[] = [];
			let response = await this.getAsyncItem('@inspectionS');
			// for sign check
			let insData =
				name === 'apiCompleteInspection'
					? await this.makeOfflineResponse('@inspectionData', { screen: 'specific inspection', id: data.inspection_id })
					: null;

			const FilterSign = ['apiInspectorSign', 'apiRenterSign'].includes(name);
			if (response) {
				if (FilterSign) {
					apiRequests = apiRequests.filter(
						(item: any) => !(item.data.id === data.id && item.name === name));
				}

				if (name == 'apiCompleteInspection' && insData?.status) {
					let { tenant_sign: tenant, inspector_sign: inspector, activity } = insData.result;
					let isInspectorRequired = ['INTERMITTENT_INSPECTION', 'MANAGER_INSPECTION'].includes(activity);
					if (isInspectorRequired && inspector == null) {
						return {
							status: false,
							result: null,
							message: 'Inspector Sign Required!',
						};
					}
					if (!isInspectorRequired && tenant == null) {
						return {
							status: false,
							result: null,
							message: 'Renter Sign Required!',
						};
					}
				}
				apiRequests = response;
			}


			apiRequests.push({
				name,
				data,
			});

			console.log('cacheApi:apiRequests', JSON.stringify(apiRequests, null, 2));
			await AsyncStorage.setItem('@inspectionS', JSON.stringify(apiRequests));
			return {
				status: true,
				result: null,
				message: 'Success',
			};
		} catch (e) {
			console.log('error:cacheApi', e);
			return {
				status: false,
				result: null,
				message: 'Failed to cache data',
			};
		}
	};

}

const cacheService = new CacheService();
export default cacheService;
