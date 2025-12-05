import React from 'react';
import { Platform, Pressable, StyleSheet,TouchableOpacity } from 'react-native';
import { Text, Image, HStack } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAppDispatch } from '@/state/hooks';
import { warningTimer } from '@/constant/customHooks';
import auth from '@react-native-firebase/auth';
import appleAuth, { AppleAuthRequestOperation, AppleAuthRequestScope } from '@invertase/react-native-apple-authentication';
import { setLoggedIn, setUserData } from '@/state/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
// icons
import AppleIcon from '@/assets/logo/Apple-Logo.png';
import { apiSocialLogin } from '@/apis/auth';

const AppleLogin = ({ setMsg, navigation }: any): React.JSX.Element => {
    const dispatch = useAppDispatch();

    const appleLogin = async (token: any) => {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation:  AppleAuthRequestOperation.LOGIN,
                requestedScopes: [AppleAuthRequestScope.FULL_NAME, AppleAuthRequestScope.EMAIL],
            });
            // Ensure Apple returned a user identityToken
            if (!appleAuthRequestResponse.identityToken) {
                // throw new Error('Apple Sign-In failed!');
                setMsg({ msg: 'Apple Sign-In failed!', error: true, show: true });
                const timer = await warningTimer(5);
                timer && setMsg({ msg: '', error: false, show: false });
            }

            // Create a Firebase credential from the response
            const { identityToken, nonce } = appleAuthRequestResponse;
            const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

            // Sign the user in with the credential
            const result = await auth().signInWithCredential(appleCredential);

            if (result?.user?.providerData[0]?.uid) {
				const data = {
					uid: result.user.providerData[0]?.uid,
					first_name: result.user.providerData[0].displayName,
					email: result.user.providerData[0].email,
					device_type: Platform.OS,
					platform: 'apple',
					fcm_token: token,
				};
				const response = await apiSocialLogin(data);
				if (response.status) {
                    await AsyncStorage.setItem('@userData', JSON.stringify(response.result));
                    dispatch(
                        setUserData(response.result),
                    );
                    dispatch(setLoggedIn(true));
				} else {
					setMsg({ msg: response.message, error: true, show: true });
					const timer = await warningTimer(3);
					timer && setMsg({ msg: '', error: false, show: false });
				}
			}

        } catch (err) {
            console.log(err);
            setMsg({ msg: 'Can Not Login Through Apple', error: true, show: true });
            const timer = await warningTimer(3);
            timer && setMsg({ msg: '', error: false, show: false });
        }

    };

    const getFcmToken = async () => {
		try {
			const fcmToken = await messaging().getToken();
			appleLogin(fcmToken);
			await AsyncStorage.setItem('@fcmToken', fcmToken);
		} catch (err) {
			appleLogin(null);
		}
	};

    return (
       
        	<TouchableOpacity	 style={styles.socialButton1} onPress={() => { getFcmToken(); }}>
							<Image source={require('../../assets/icon/Union.png')} style={styles.socialIcon} />
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
export default AppleLogin;
