import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet,TouchableOpacity } from 'react-native';
import { Text, Image, HStack } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAppDispatch } from '@/state/hooks';
import { warningTimer } from '@/constant/customHooks';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { apiSocialLogin } from '@/apis/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLoggedIn, setUserData } from '@/state/authSlice';
import { showLoader, hideLoader } from '@/state/loaderSlice';
// icons
import GoogleIcon from '@/assets/logo/Google-Logo.png';

const GoogleLogin = ({ setMsg, navigation }: any): React.JSX.Element => {
	const dispatch = useAppDispatch();
	useEffect(() => {
		GoogleSignin.configure({
			webClientId: '378302508201-edsc7513nlf191bk1v4da87gn334d8fq.apps.googleusercontent.com',
		});
	}, []);

	const googleLogin = async (token: any) => {
		try {
			dispatch(showLoader());
			await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

			const userInfo = await GoogleSignin.signIn();
			if (userInfo.type.includes('success')) {
				const { idToken }: any = userInfo.data;

				if (!idToken) {
					console.log('idToken: ', idToken);
					setMsg({ msg: 'Failed to connect to Google', error: true, show: true });
					const timer = await warningTimer(3);
					timer && setMsg({ msg: '', error: false, show: false });
					return;
				}
                 
				const googleCredential = auth.GoogleAuthProvider.credential(idToken);

				const result = await auth().signInWithCredential(googleCredential);
				if (result?.user?.providerData[0]?.uid) {
					const data = {
						uid: result.user.providerData[0]?.uid,
						first_name: result.user.providerData[0].displayName,
						email: result.user.providerData[0].email,
						device_type: Platform.OS,
						platform: 'google',
						fcm_token: token,
					};
					const response = await apiSocialLogin(data);
					console.log(response);
					if (response.status) {
						await AsyncStorage.setItem('@userData', JSON.stringify(response.result));
						dispatch(
							setUserData(response.result),
						);
						dispatch(setLoggedIn(true));
						dispatch(hideLoader());
					} else {
						setMsg({ msg: response.message, error: true, show: true });
						const timer = await warningTimer(3);
						timer && setMsg({ msg: '', error: false, show: false });
						dispatch(hideLoader());
					}
				}
			}

		} catch (err) {
			console.log('Error during Google login: ', err);
			setMsg({ msg: 'Error during Google login', error: true, show: true });
			const timer = await warningTimer(3);
			timer && setMsg({ msg: '', error: false, show: false });
			// dispatch(hideLoader());
		}

	};

	const getFcmToken = async () => {
		try {
			
			const fcmToken = await messaging().getToken();
			googleLogin(fcmToken);
			
			await AsyncStorage.setItem('@fcmToken', fcmToken);
		} catch (err) {
			googleLogin(null);
			dispatch(hideLoader());
		}
	};

	return (
	
			<TouchableOpacity style={styles.socialButton1} onPress={() => { getFcmToken(); }}>
									<Image source={require('../../assets/icon/google.png')} style={styles.socialIcon} />
								</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		padding: 20,
		minHeight: '100%',
	},
	backIcon: {
		height: 40,
		width: 40,
	},
	socialIcon: {
		height: 30,
		width: 30,
		resizeMode: 'stretch',
	},
	socialButton: {
		backgroundColor: '#fff',
		width: wp('65%'),
		height: 55,
		elevation: 3,
		borderRadius: 10,
		padding: 15,
	},
	  socialButton1: {
		backgroundColor: '#fff',
		width: 60,
		height: 60,
		elevation: 3,
		borderRadius: 40,
		justifyContent:'center',
		alignItems:'center'
  }
});
export default GoogleLogin;
