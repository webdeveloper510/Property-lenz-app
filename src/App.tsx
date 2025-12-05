/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */



import React, { useEffect, useState } from 'react';
import { Linking, PermissionsAndroid, Platform,StatusBar } from 'react-native';
import Auth from './navs/AuthStack';
import { useAppDispatch, useAppSelector } from './state/hooks';
import RootStack from './navs/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLoggedIn,  setPackage,  setUserData } from './state/authSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableLayoutAnimations } from 'react-native-reanimated';
import messaging, { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import Spinner_Loading from './components/Loading/Spinner_loading';
import { Text, Modal } from 'native-base';
import { warningTimer } from './constant/customHooks';
import { UserDataObject } from './services/types';
import { setHomeMode } from '@/state/propertyDataSlice';
// import IAP, {
// 	initConnection,
// 	clearTransactionIOS,
// 	endConnection,
// 	getPurchaseHistory,
// 	validateReceiptIos,
// } from 'react-native-iap';
import { apiIOSValidate } from './apis/auth';
// https://www.npmjs.com/package/@react-native-community/geolocation
// import Geolocation from '@react-native-community/geolocation';
import geoService from './services/GeolocationServices';

// Disable Reanimated warnings
enableLayoutAnimations(false);


const App = ({ navigation }: any): React.JSX.Element => {
	const loggedIn = useAppSelector(state => state.auth.loggedIn);
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState<boolean>(true);
	const userData: UserDataObject | any = useAppSelector(state => state.auth.userData);
	const [notification, setNotification] = useState<any>('');
	const [modalVisible, setModalVisible] = useState(false);

	const getPermission = async () => {
		try {
			const isNotify = await AsyncStorage.getItem('@notification');
			// if app is opening first time and does not have notification setting
			// or if user already set his notification preference and allow notifications
			if (isNotify == null || isNotify == 'true') {
				// Android 13+ notification permission
				if (Platform.OS === 'android' && Platform.Version >= 33) {
					const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
					if (permission == 'granted') {
						await AsyncStorage.setItem('@notification', 'true');
						getFcmToken();
					} else {
						await AsyncStorage.setItem('@notification', 'false');
					}
					// Check if iOS version is 10 or higher
				} else if (Platform.OS === 'ios' && (Platform.Version >= '10.0' || Platform.Version >= '10')) {
					const authorizationStatus = await messaging().requestPermission();
					const enabled =
						authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
						authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

					if (enabled) {
						await AsyncStorage.setItem('@notification', 'true');
						getFcmToken();
					} else {
						await AsyncStorage.setItem('@notification', 'false');
					}
				} else {
					await AsyncStorage.setItem('@notification', 'false');
				}
			}
		} catch (err) {
			await AsyncStorage.setItem('@notification', 'false');
		}
	};
	const getFcmToken = async () => {
		try {
			const fcmToken = await messaging().getToken();
			console.log('fcm get token run');
			await AsyncStorage.setItem('@fcmToken', fcmToken);
		} catch (error) {
			console.log('fcmAsync: Error ', error);
			await AsyncStorage.setItem('@notification', JSON.stringify(false));
		}
	};
	useEffect(() => {


		const unsubscribe = messaging().onMessage(async remoteMessage => {
			console.log(remoteMessage.notification);
			setModalVisible(true);
			setNotification(remoteMessage.notification);
			const time = await warningTimer(8);
			time && setModalVisible(false);
		});

		return unsubscribe;
	}, []);

   useEffect(()=>{
	onHomeMode();
   },[])
  
    const onHomeMode=async()=>{
		try{
			const res = await AsyncStorage.getItem('@homeMode')
			console.log("🚀 ~ onHomeMode ~ res:", res)
			if(res){
				dispatch(setHomeMode(res == 'true'))
			}
		}catch(error){
		console.log("🚀 ~ onHomeMode ~ error:", error)

		}
	}


	useEffect(() => {
		(async () => {
			try {
				const response = await AsyncStorage.getItem('@userData');
				console.log('auth: ', response);
				if (response) {
					const data = JSON.parse(response);
					await AsyncStorage.setItem('@apiToken', data.authToken);
					setLoading(false);
					dispatch(setUserData(data));
					dispatch(setLoggedIn(true));
				} else {
				}

				const packageResponse = await AsyncStorage.getItem('@packageData');
				if (packageResponse) {
					const packageData = JSON.parse(packageResponse);
					dispatch(setPackage(packageData));
				}

			} catch (error) {
				console.log(error);
				setLoading(false);
			} finally {
				setLoading(false);
				getPermission();
			}
		})();
	}, []);

	// useEffect(() => {
	// 	if (userData && Platform.OS === 'ios') {
	// 		initConnection().catch(e => {
	// 			console.log('ERROR: initConnection', e);
	// 		}).then((status) => {
	// 			console.log('Connected to Apple store', status);

	// 			try {
	// 				clearTransactionIOS();
	// 			} catch (e) { }

	// 			getPurchaseHistory().catch(e => {
	// 				console.log('ERROR: getPurchaseHistory', e);
	// 			}).then((res) => {
	// 				if (res && res.length) {
	// 					const receipt = res[res.length - 1].transactionReceipt;

	// 					if (receipt) {
	// 						validateReceipt(receipt, () => {

	// 						});
	// 					}
	// 				}
	// 			});
	// 		});
	// 	}

	// 	return () => {
	// 		try {
	// 			if (Platform.OS === 'ios') {
	// 				endConnection();
	// 			}
	// 		} catch (e) {}
	// 	};
	// }, [userData]);

	// const validateReceipt = async (receipt: any, cb: any) => {
	// 	console.log('validateReceipt: ', receipt);
	// 	const receiptBody = {
	// 		'receipt-data': receipt,
	// 		password: 'db930cc864af4a919b22791491c5cd75', // app shared secret, can be found in App Store Connect
	// 	};
	// 	let result = await validateReceiptIos({ receiptBody, isTest: false });
	// 	console.log(result);


	// 	if (result.status === 21007) {
	// 		result = await validateReceiptIos({ receiptBody, isTest: true });
	// 		console.log('test', result);
	// 	}


	// 	if (result.latest_receipt_info.length) {
	// 		const latestReceiptInfo = result.latest_receipt_info[0];
	// 		console.log({latestReceiptInfo});

	// 		const response = await apiIOSValidate({ receiptData: latestReceiptInfo, userId: userData?.id });
	// 		console.log('apiIOSValidate: ', response);

	// 		if (response.status) {
    //             //alert
    //             // setErrMsg({msg: response.message, error: false, show: true});
	// 			dispatch(
	// 				setPackage(response.result.data.subscriptionPackage)
	// 			);
	// 			await AsyncStorage.setItem('@packageData', JSON.stringify(response.result.data.subscriptionPackage));
    //             const timer = await warningTimer(2);
	// 			timer && navigation.goBack(null);
	// 		} else {
	// 			await AsyncStorage.removeItem('@packageData');
	// 			dispatch(setPackage(null));
	// 			// setErrMsg({ msg: response.message, error: true, show: true });
	// 			// const timer = await warningTimer(3);
	// 			// timer && setErrMsg({ msg: '', error: false, show: false });
	// 		}

	// 		// navigation.goBack(null);
	// 	}

	// 	if (cb) {
	// 		cb();
	// 	}

	// };

	

	if (loading) {
		return <Spinner_Loading />;
	}


	return (
		<>
		<StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
			<Modal mt={10} isOpen={modalVisible} onClose={() => setModalVisible(false)} justifyContent="flex-start" size="xl">
				<Modal.Content>
					<Modal.Body bg={'indigo.100'}>
						<Text bold fontSize={'lg'} style={{ flex: 1, flexWrap: 'nowrap' }} color={'my.td'} alignSelf={'center'}>{notification?.title}</Text>
						<Text fontSize={'sm'} style={{ flex: 1, flexWrap: 'nowrap' }} color={'my.t'} mt={1}>{notification?.body}</Text>
					</Modal.Body>
				</Modal.Content>
			</Modal>
			{loggedIn ?
				<GestureHandlerRootView style={{ flex: 1 }}>
					<RootStack />
				</GestureHandlerRootView>
				:
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Auth />
				</GestureHandlerRootView>
			}
		</>
	);
};

export default App;
