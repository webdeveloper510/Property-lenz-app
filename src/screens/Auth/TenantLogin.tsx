import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Text, Button, Box, FormControl, Input, Image, VStack, HStack, Alert } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/state/hooks';
import { setUserData, setLoggedIn } from '@/state/authSlice';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import { apiTenantLogin } from '@/apis/auth';
import { warningTimer } from '@/constant/customHooks';
import messaging from '@react-native-firebase/messaging';
// icon
import Logo from '@/assets/logo/Logo.png';
import Back from '@/assets/icon/btnBack.png';
import { SafeAreaView } from 'react-native';

const TenantLogin = ({ navigation }: any): React.JSX.Element => {
	const [passKey, setPassKey] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
	const dispatch = useAppDispatch();

	const getFcmToken = async () => {
		if (passKey.trim() == '') {
			setErrMsg({ msg: 'Please give Pass Key', error: true, show: true });
			const timer = await warningTimer(2);
			timer && setErrMsg({ msg: '', error: false, show: false });
			return;
		}
		try {
			const fcmToken = await messaging().getToken();
			LoginTenant(fcmToken);
			await AsyncStorage.setItem('@fcmToken', fcmToken);
		} catch (error) {
			LoginTenant(null);
			console.log('fcmAsync: Error ', error);
		}
	};

	const LoginTenant = async (token: any) => {
		try {
			setIsLoading(true);
			const response = await apiTenantLogin({
				tenant_code: passKey.trim(),
				fcm_token: token,
				device_type: Platform.OS,
			});
			if (response.status) {
				if (response.result) {
					await AsyncStorage.setItem('@userData', JSON.stringify(response.result));
					dispatch(setUserData(response.result));
					dispatch(setLoggedIn(true));
				}
			} else {
				setErrMsg({ msg: response.message, error: true, show: true });
				const timer = await warningTimer(2);
				timer && setErrMsg({ msg: '', error: false, show: false });
			}
		} catch (error) {
			setErrMsg({ msg: 'Please Check Internet Connectivity.', error: true, show: true });
			const timer = await warningTimer(2);
			timer && setErrMsg({ msg: '', error: false, show: false });
		}
		finally {
			setLoading(false);
			setIsLoading(false);
		}
	};

	return (
		loading ?
			<Spinner_Loading />
			:
			<Box style={styles.mainContainer}>
				<SafeAreaView>
					<HStack mb={-5}>
						<Pressable onPress={() => { navigation.goBack(null); }}>
							<Image alt="back" source={Back} style={styles.backIcon} />
						</Pressable>
					</HStack>
				</SafeAreaView>
				{errMsg.show &&
					<Alert w="100%" status={errMsg.error ? 'danger' : 'success'} style={{ position: 'absolute', top: 100, zIndex: 10 }} >
						<Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
					</Alert>
				}
				<Image source={Logo} style={styles.logo} mx={'auto'} alt="Logo" />
				<VStack space={2} justifyContent={'center'} alignItems={'center'} >
					<FormControl style={styles.formControl}>
						<Input variant="filled" type="text" placeholder="Pass Key..." style={styles.input} _focus={{ borderColor: 'transparent' }}
							value={passKey} onChangeText={setPassKey} />
					</FormControl>
					<Button isLoading={isLoading} onPress={() => { getFcmToken(); }} style={styles.loginButton}>Login</Button>
				</VStack>
				<Text bold color={'my.tf'} style={styles.footer} mb={1} mx={'auto'}>PropertyLenz2024</Text>
			</Box>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 10,
		height: '100%',
		width: '100%',
	},
	backIcon: {
		height: 40,
		width: 40,
	},
	logo: {
		height: 75,
		width: '85%',
		resizeMode: 'stretch',
		marginTop: '30%',
		marginBottom: '30%',
	},
	heading: {
		alignSelf: 'flex-start',
		marginTop: '15%',
		color: 'rgba(37, 43, 117, 0.9)',
		marginLeft: 10,
	},
	text: {
		alignSelf: 'flex-start',
		marginBottom: '20%',
		color: 'rgba(37, 73, 137, 0.7)',
		marginLeft: 10,
	},
	formControl: {
		display: 'flex',
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		height: 60,
		width: '90%',
		borderWidth: 4,
		borderColor: 'rgba(225, 225, 225, 1.0)',
		borderRadius: 30,
		marginBottom: 20,
	},
	input: {
		flex: 1,
		paddingLeft: 20,
		height: 60,
		color: 'black',
		backgroundColor: 'transparent',
	},
	loginButton: {
		backgroundColor: 'rgba(0, 113, 188,0.9)',
		width: '70%',
		height: 55,
		borderRadius: 10,
		marginTop: 50,
	},
	buttonDisabled: {
		backgroundColor: 'rgba(90,113,189,0.9))',
		alignSelf: 'center',
		width: '70%',
		height: 55,
		borderRadius: 10,
		marginTop: 50,
	},
	footer: {
		marginTop: '40%',
		alignSelf: 'center',
		color: 'rgba(153, 153, 153, 1.0)',
	},
});
export default TenantLogin;
