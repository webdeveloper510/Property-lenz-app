import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, Box, Image, HStack, VStack, ScrollView, Alert, Modal, useToast } from 'native-base';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { warningTimer } from '@/constant/customHooks';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
// iap
// https://www.npmjs.com/package/react-native-iap
// icons
import BackIcon from '@/assets/icon/btnBack.png';
import Logo from '@/assets/logo/Logo.png';
import { UserDataObject } from '@/services/types';
// import IAP, {
// 	initConnection,
// 	clearTransactionIOS,
// 	endConnection,
// 	getPurchaseHistory,
// 	getSubscriptions,
// 	SubscriptionPurchase,
// 	purchaseErrorListener,
// 	purchaseUpdatedListener,
// 	type ProductPurchase,
// 	type PurchaseError,
// 	flushFailedPurchasesCachedAsPendingAndroid,
// 	getProducts,
// 	requestSubscription,
// 	finishTransaction,
// 	validateReceiptIos,
// } from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGetPackages, apiIOSValidate, apiSubscribe, apiUpdateSubscription } from '@/apis/auth';
import _iosPlansCard from '@/components/Subscription/_iosPlanCard';
import { setPackage, setUserData } from '@/state/authSlice';

let purchaseUpdateListener: any = null;
let purchaseErrorListenerLocal: any = null;
let isPurchased: any = false;
let isHandlePurchaseRun: any = false;

// db930cc864af4a919b22791491c5cd75 -- secret

const Ios = ({ navigation }: any): React.JSX.Element => {
	const [activePage, setActivePage] = useState<number>(0);
	const [packagesData, setPackagesData] = useState<any[]>([]);
	const [packages, setPackages] = useState<any[]>([]);
	const [selectedPlan, setSelectedPlan] = useState('');
	const [voucher, setVoucher] = useState('');
	const [loading, setLoading] = useState<boolean>(true);
	const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
	const dispatch = useAppDispatch();
	const route = useRoute();
	const loggedIn = useAppSelector(state => state.auth.loggedIn);
	const userData: UserDataObject | any = useAppSelector(state => state.auth.userData);
	const costumerId: any = route.params;
	const toast = useToast();

	// useEffect(() => {
	
	// 	initConnection().catch(e => {
	// 		console.log('ERROR: initConnection', e);
	// 	}).then((status) => {
	// 		console.log('Connected to Apple store', status);
	// 		try {
	// 			clearTransactionIOS();
	// 		} catch (e) { }

	// 		getPakages((d: any) => {
	// 			let productsIds: string[] = [];
	// 			d.forEach((p: any) => {
	// 				if (p?.ios_product_id) {
	// 					productsIds.push(p.ios_product_id);
	// 				}
	// 			});

	// 			// let productsIds: string[] = ['pl_1499_1m','pl_3499_1m','pl_6999_1m','pl_9999_1m'];
	// 			if (productsIds.length > 0) {
	// 				getSubscriptions({ skus: productsIds }).catch(e => {
	// 					console.log('ERROR: getSubscriptions', e);
	// 					setLoading(false);
	// 				}).then((res: any) => {
	// 					console.log('Products', res.length);
	// 					setPackages([...res]);
	// 					setLoading(false);
	// 				});
	// 			}
	// 			// getPurchaseHistory().catch(e => {
	// 			//     console.log('ERROR: getPurchaseHistory', e);
	// 			//     setLoading(false);
	// 			// }).then((res) => {
	// 			//     if (res && res.length) {
	// 			//         try {
	// 			//             const receipt = res[res.length - 1].transactionReceipt;
	// 			//             console.log('receipt', receipt);
	// 			//             if (receipt) {
	// 			//                 validateReceipt(receipt);
	// 			//             }
	// 			//         } catch (error) {

	// 			//         }
	// 			//     } else {
	// 			//         setLoading(false);
	// 			//     }
	// 			// });
	// 		});

	// 		if (!purchaseUpdateListener) {
	// 			purchaseUpdateListener = IAP.purchaseUpdatedListener((purchase) => {
	// 				try {
	// 					console.log('purchase', purchase);

	// 					const receipt = purchase.transactionReceipt;
	// 					setErrMsg({
	// 						msg: 'Validating purchase, Please wait...',
	// 						error: false,
	// 						show: true,
	// 					});
	// 					setTimeout(() => {
	// 						setErrMsg({ msg: '', error: false, show: false });
	// 					}, 4000);

	// 					// if (!toast.isActive(toast_id)) {
	// 					// 	toast.show({
	// 					// 		toast_id,
	// 					// 		title: "Validating purchase, Please wait..."
	// 					// 	});
	// 					// }

	// 					console.log('purchaseUpdatedListener', { receipt });
	// 					if (receipt && isPurchased) {
	// 						validateReceipt(receipt, () => {
	// 							finishTransaction({ purchase, isConsumable: false }).catch(e => {
	// 								console.log('ERROR: finishTransaction', e);
	// 							});
	// 						});
	// 					}
	// 				} catch (error) {
	// 					console.log('ERROR: purchaseUpdatedListener', error);
	// 					setLoading(false);
	// 				}
	// 			});
	// 		}

	// 		if (!purchaseErrorListenerLocal) {
	// 			purchaseErrorListenerLocal = IAP.purchaseErrorListener((error) => {
	// 				setErrMsg({
	// 					msg: 'There has been error processing your purchase',
	// 					error: true,
	// 					show: true,
	// 				});
	// 				setTimeout(() => {
	// 					setErrMsg({ msg: '', error: false, show: false });
	// 				}, 4000);
	// 				setLoading(false);
	// 			});
	// 		}
	// 	});


	// 	return () => {
	// 		endConnection();
	// 		try {
	// 			if (purchaseUpdateListener) {
	// 				purchaseUpdateListener.remove();
	// 				purchaseUpdateListener = null;
	// 			}
	// 			if (purchaseErrorListenerLocal) {
	// 				purchaseErrorListenerLocal.remove();
	// 				purchaseErrorListenerLocal = null;
	// 			}
	// 		} catch (error) {

	// 		}
	// 	};
	// }, []);

	const slider = (x: number, w: number) => {
		let ratio = x / w;
		let count = Math.floor(ratio) + (ratio % 1 > 0.5 ? 1 : 0);
		if (count !== activePage) {
			setActivePage(count);
		}
	};

	const getPakages = async (cb: any) => {
		const response = await apiGetPackages();
		if (response.status) {
			setPackagesData(response.result.data);
			if (cb) {
				cb(response.result.data);
			}
		} else {
			console.log('error: ', response);
		}
	};


	// const submit = async (plan: any) => {
	// 	console.log('submit', plan);
	// 	if (plan) {
	// 		setSelectedPlan(plan);

	// 		setLoading(true);
	// 		isPurchased = true;
	// 		requestSubscription({
	// 			sku: plan,
	// 		}).catch(e => {
	// 			console.log('ERROR: requestSubscription', e);
	// 			setErrMsg({ msg: 'Error in purchase, Please try again later!', error: true, show: true });
	// 			setTimeout(() => {
	// 				setErrMsg({ msg: '', error: false, show: false });
	// 			}, 4000);
	// 		}).then((res: any) => {

	// 			if (res) {
	// 				console.log('res----------------', res);

	// 				validateReceipt(res.transactionReceipt, () => {

	// 				});
	// 			}
	// 		});
	// 	} else {
	// 		setErrMsg({ msg: 'Please select a plan to purchase', error: true, show: true });
	// 		setTimeout(() => {
	// 			setErrMsg({ msg: '', error: false, show: false });
	// 		}, 2000);
	// 	}
	// };

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
    //             setErrMsg({msg: response.message, error: false, show: true});
	// 			dispatch(
	// 				setPackage(response.result.data.subscriptionPackage)
	// 			);
	// 			await AsyncStorage.setItem('@packageData', JSON.stringify(response.result.data.subscriptionPackage));
    //             const timer = await warningTimer(2);
	// 			timer && navigation.goBack(null);
	// 		} else {
	// 			setErrMsg({ msg: response.message, error: true, show: true });
	// 			const timer = await warningTimer(3);
	// 			timer && setErrMsg({ msg: '', error: false, show: false });
	// 		}

	// 		// navigation.goBack(null);
	// 	}

	// 	if (cb) {
	// 		cb();
	// 	}

	// };


	return (loading ? <Spinner_Loading show={errMsg.show} msg={errMsg.msg} error={errMsg.error} /> :
		<ScrollView>
			{errMsg.show &&
				<Alert w="80%" alignSelf={'center'} status={errMsg.error ? 'danger' : 'success'} mb={2}
					style={{
						position: 'absolute',
						top: 90,
						zIndex: 3,
					}} >
					<Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
				</Alert>
			}
			<Box style={styles.mainContainer}>
				<SafeAreaView>
					<HStack mt={2} justifyContent={'flex-start'} alignItems={'center'}>
						<HStack mb={3} ml={-1} style={{ padding: 15 }} alignItems={'center'}>
							<Pressable onPress={() => { navigation.goBack(null); }}>
								<Image source={BackIcon} alt="Back" style={styles.backIcon} />
							</Pressable>
						</HStack>
						<Image source={Logo} ml={-2} mx={'auto'} style={styles.logo} alt="logo" />
					</HStack>
				</SafeAreaView>
				<Text bold fontSize={'2xl'} mt={0} mx={'auto'} mb={1} color={'my.h3'} >Choose a Plan</Text>
				{/* <Text mx={'auto'}>{packages.length} - {JSON.stringify(packages)}</Text> */}
				<HStack space={1} mt={0} justifyContent={'center'} alignItems={'center'}>
					{packages.sort((a: any, b: any) => a.price - b.price).map((iosPackage: any, i: number) => {
						let item = packagesData.find(p => p.ios_product_id == iosPackage.productId);
						return (
							item ?
								<Box key={i} style={activePage !== i ? styles.boxInactive : styles.boxActive}>{ }</Box>
								: <></>
						);
					})}
				</HStack>
				<ScrollView horizontal={true} pagingEnabled={true} style={{ minHeight: '80%' }}
					onScroll={(e) => {
						slider(e.nativeEvent.contentOffset.x, e.nativeEvent.layoutMeasurement.width);
					}} >
					{packages.length > 0 && packages.sort((a: any, b: any) => a.price - b.price).map((iosPackage: any, i: number) => {
						let item = packagesData.find(p => p.ios_product_id == iosPackage.productId);
						//   item = packagesData[i];
						return (
							item ?
								<Box key={i} mt={2} style={{
									width: widthPercentageToDP('80%'), minHeight: heightPercentageToDP('63%'), alignItems: 'center',
									marginLeft: widthPercentageToDP('10%'), marginRight: widthPercentageToDP('10%'),
								}}>

									<_iosPlansCard costumerId={costumerId?.user_id} item={item} iosPackage={iosPackage}
										active={i === activePage ? true : false}  ErrMsg={setErrMsg}
									/>
								</Box>
								: <></>
						);
					})}
				</ScrollView>
			</Box>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		paddingBottom: 30,
		height: '100%',
		flex: 1,
	},
	backIcon: {
		height: 40,
		width: 40,
	},
	logo: {
		height: 75,
		width: '75%',
		resizeMode: 'stretch',
	},
	boxInactive: {
		height: 5,
		width: 5,
		borderRadius: 20,
		backgroundColor: 'rgba(100,170,253,0.7)',
	},
	boxActive: {
		height: 10,
		width: 10,
		borderRadius: 20,
		backgroundColor: 'rgba(13,110,253,0.7)',
	},
});
export default Ios;
