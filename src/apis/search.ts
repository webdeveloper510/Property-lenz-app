// /search
import { ResponseObject } from '@/services/types';
import apiService from '@/services/ApiService';
import { SearchType } from '@/services/types';
interface Query {
    q: string,
}

export const apiSearch = async (data: Query): Promise<ResponseObject<any>> => {
	const response = await apiService.get('/search', data);
	return response;
};

