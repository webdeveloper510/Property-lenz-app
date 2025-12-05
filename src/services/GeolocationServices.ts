import { PermissionsAndroid, Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
// https://www.npmjs.com/package/@react-native-community/geolocation
import Geolocation from '@react-native-community/geolocation';
import { ResponseObject } from './types';
import cacheService from './CacheServices';
import { distanceFilter } from '@/constant';

let config: any = {
	skipPermissionRequests: false,
	authorizationLevel: 'whenInUse',
	enableBackgroundLocationUpdates: false,
	locationProvider: 'auto',
};
interface SimpleLocation {
	latitude: number;
	longitude: number;
}
interface Extras {
	verticalAccuracy: number;
}
interface Coordinates {
	accuracy: number;
	altitude: number;
	heading: number;
	latitude: number;
	longitude: number;
	speed: number;
}
interface LocationData {
	coords: Coordinates;
	extras: Extras;
	mocked: boolean;
	timestamp: number;
}

class GeolocationServices {
	API_ERROR: ResponseObject<null> = {
		status: false,
		result: null,
		message: 'Something went wrong!',
	};
	constructor() { }
	async configuration(): Promise<any> {
		try {
			Geolocation.setRNConfiguration(config);
		} catch (error) {
			console.log(error);
		}
	}
	async requestLocationPermission(): Promise<boolean> {
		try {
			if (Platform.OS === 'android') {
				await this.configuration();
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
					{
						title: 'Geolocation Permission',
						message: 'Can we access your location?',
						buttonNeutral: 'Ask Me Later',
						buttonNegative: 'Cancel',
						buttonPositive: 'OK',
					}
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					//   console.log('You can use Geolocation');
					return true;
				} else {
					//   console.log('You cannot use Geolocation');
					return false;
				}
			} else if (Platform.OS === 'ios') {
				const res = await this.requestIOSLocationPermission()
				console.log('check:res', res)
				return res;
			} else {
				console.log('Unsupported platform');
				return false;
			}
		} catch (err) {
			console.log('Catch err: ', err);
			return false;
		}
	}

	async requestIOSLocationPermission(): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.configuration();

				Geolocation.requestAuthorization(() => {
					console.log('SUCCESS:requestAuthorization')
					resolve(true);
				}, (error) => {
					console.log('ERROR:requestAuthorization', error)
					resolve(false)
				})

			} catch (err) {
				console.log('Catch err: ', err);
				resolve(false)
			}
		})
	}

	async getLocation(accuracy: boolean, time: number, age?: number): Promise<ResponseObject<SimpleLocation | number | null>> {
		let timeOut = time * 1000;
		let maximumAge = age ? age : 100 * 1000;
		let result = await this.requestLocationPermission();
		console.log('result: ', result);

		if (result) {
			console.log('res is:', result);

			const options = {
				enableHighAccuracy: accuracy,
				timeout: timeOut,
				maximumAge: maximumAge,
			};

			return new Promise((resolve, reject) => {
				Geolocation.getCurrentPosition(
					(position) => {
						// console.log('position: ', position);
						const { latitude, longitude } = position.coords;
						resolve({
							status: true,
							result: { latitude, longitude },
							message: 'Successfully Get Location',
						}
						);
					},
					error => {
						// console.log(error.code, error.message);
						resolve({
							status: false,
							result: error.code,
							message: error.message.toString(),
						});
					},
					options
				);
			});
		} else {
			return this.API_ERROR;
		}
	}
	async getDistance(coordinates1: { latitude: number, longitude: number },
		coordinates2: { latitude: number, longitude: number }, fixValue?: number): Promise<boolean> {
		const R = 6371; // Radius of the Earth in kilometers
		const toRadians = (degrees: any) => degrees * (Math.PI / 180);

		const dLat = toRadians(coordinates2.latitude - coordinates1.latitude);
		const dLon = toRadians(coordinates2.longitude - coordinates1.longitude);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRadians(coordinates1.latitude)) * Math.cos(toRadians(coordinates2.longitude)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		let dis: number = R * c;
		let distanceInMeters = dis * 1000;

		// If distance is greater than or equal to 1000 meters, convert back to kilometers
		let finalDistance = distanceInMeters >= 1000
			? parseFloat((distanceInMeters / 1000).toFixed(fixValue !== undefined ? fixValue : 0))
			: parseFloat(distanceInMeters.toFixed(fixValue !== undefined ? fixValue : 0));

		const unit = distanceInMeters >= 1000 ? 'km' : 'm';
		console.log(`Distance: ${finalDistance} ${unit}`);
		// fix to given number if fixValue = 2 => ans = 1.02
		dis = parseFloat(dis.toFixed(fixValue !== undefined ? fixValue : 0));
		if (dis > distanceFilter) {
			return false;
		} else {
			return true;
		}

	}
}

const geoService = new GeolocationServices();
export default geoService;
