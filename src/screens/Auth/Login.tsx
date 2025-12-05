import React, {useEffect, useState} from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
	BackHandler
} from 'react-native';
import {
    FormControl,
    Text,
    Input,
    Button,
    Box,
    Image,
    Checkbox,
    VStack,
    HStack,
    Alert,
    ScrollView,
    Switch,
} from 'native-base';
import {apiLogin} from '@/apis/auth';
import { apiTenantLogin } from '@/apis/auth';
import {useAppDispatch} from '@/state/hooks';
import {setUserData, setLoggedIn, setPackage} from '@/state/authSlice';
import {warningTimer} from '@/constant/customHooks';
import BackButton from '@/components/BackButton';
import CommanButton from '@/components/CommanButton';
import TextInputField from '@/components/TextInputField';
import {
    heightPercentageToDP,
    widthPercentageToDP,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import messaging from '@react-native-firebase/messaging';
import GoogleLogin from './GoogleLogin';
import AppleLogin from './AppleLogin';
// icons
import Hide from '@/assets/icon/hide.png';
import Show from '@/assets/icon/view.png';
import Logo from '@/assets/logo/logo1.png';
import { showLoader,hideLoader } from '@/state/loaderSlice';
const Login = ({navigation}: any): React.JSX.Element => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [view, setView] = useState<boolean>(false);
    const [remember, setRemember] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
	const [passKey, setPassKey] = useState<string>('');
    const dispatch = useAppDispatch();
    interface UserRemember {
        email: string;
        password: string;
        remember: boolean;
    }

    const getFcmToken = async () => {
        try {
            const fcmToken = await messaging().getToken();
            login(fcmToken);
            await AsyncStorage.setItem('@fcmToken', fcmToken);
        } catch (err) {
            login(null);
        }
    };

	 	const getFcmToken2 = async () => {
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
    useEffect(() => {
        (async () => {
            const userRemember = await AsyncStorage.getItem('@userRemember');
            if (userRemember) {
                try {
                    const data: UserRemember = JSON.parse(userRemember);
                    setEmail(data.email);
                    setPassword(data.password);
                    setRemember(true);
                } catch (e) {}
            } else {
                return;
            }
        })();
    }, []);
    const login = async (token: any) => {
        try {
            const data = {
                email: email.toLowerCase().trim(),
                password: password.trim(),
                fcm_token: token,
                device_type: Platform.OS,
            };

            const response = await apiLogin(data);
            console.log('login: ', JSON.stringify(response));
            if (response.status) {
                await AsyncStorage.setItem(
                    '@userData',
                    JSON.stringify(response.result),
                );
                if (remember) {
                    await AsyncStorage.setItem(
                        '@userRemember',
                        JSON.stringify({...data, remember: remember}),
                    );
                } else {
                    await AsyncStorage.removeItem('@userRemember');
                }
                if (response.result?.subscriptionPackage) {
                    dispatch(setPackage(response.result.subscriptionPackage));
                    await AsyncStorage.setItem(
                        '@packageData',
                        JSON.stringify(response.result.subscriptionPackage),
                    );
                }
                dispatch(setUserData(response.result));
                dispatch(setLoggedIn(true));
            } else {
                setErrMsg({msg: response.message, error: true, show: true});
                const timer = await warningTimer(3);
                timer && setErrMsg({msg: '', error: false, show: false});
            }
        } catch (error) {
            setErrMsg({
                msg: 'Please Check Internet Connectivity.',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const submit = async () => {
        if (email === '' || password === '') {
            setErrMsg({
                msg: 'Please Fill Both Fields',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
            return;
        }
        setLoading(false);
        setIsLoading(true);
        getFcmToken();
    };

    useEffect(() => {}, [view, remember]);
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
           <SafeAreaView style={{flex:1}}>
        <ScrollView
            style={{
                minHeight: heightPercentageToDP('100%'),
                backgroundColor: '#F2F2F2',
            }}> 
            <Box style={styles.mainContainer}>
             
                    {/* <BackButton navigation={navigation} isLogin={true}/> */}
                 <View style={{height:10}}/>
            
                <Image
                    source={Logo}
                    style={styles.logo}
                    mx={'auto'}
                    alt="Logo"
                />
                <Text style={styles.heading}>PropertyLenz 2025</Text>
                <View style={{height: 75}} />
                <Text style={styles.text}>Login</Text>
                <Text style={styles.text1}>
                    Hey, Enter your details to get Log in {'\n'}to your
                    account.
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '90%',
                        alignSelf: 'center',
                        paddingTop: 10,
                    }}>
                    <Text style={styles.toggleStyle}>Are you a Renter?</Text>
                    <Switch
                        size={Platform.OS == 'ios' ? 'sm' :'lg'}
                        offTrackColor={'#9A46DB33'}
                        offThumbColor={'#FFFFFF'}
                        onTrackColor={'#9A46DB'}
                        onThumbColor={'#FFFFFF'}
                        isChecked={isChecked}
                        onChange={() => {
                            setIsChecked(!isChecked);
                        }}
                    />
                </View>
                <View style={{height: 10}} />
                {isChecked ? (
					<View>
                    <TextInputField
                        placeholder="8 - 4 - 8 - A - D - E - 3"
                        value={passKey}
                        onChangeText={setPassKey}
                        url={require('../../assets/icon/passkey.png')}
                        label={'Passkey'}
                    />
					 <CommanButton
                                    label={'Login'}
                                    onCkick={getFcmToken2}
                                    isLoading={isLoading}
                                    // width={Platform.OS == 'ios' ? '56%' : '72%'}
                                />
					</View>
                ) : (
                    <View>
                        <TextInputField
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            url={require('../../assets/icon/email.png')}
                            label={'Email'}
                        />

                        <TextInputField
                            placeholder="* * * * * * * * *"
                            value={password}
                            onChangeText={setPassword}
                            url={require('../../assets/icon/lock.png')}
                            label={'Password'}
                            secureTextEntry={view ? false : true}
                            isEye={true}
                            onClick={() => setView(!view)}
                            rightIcon={require('../../assets/icon/eye_2.png')}
                        />
                        <VStack
                            space={2}
                            justifyContent={'center'}
                            alignItems={'center'}>
                            <HStack
                                style={{width: '100%', marginTop: 10}}
                                justifyContent={'space-around'}
                                alignItems={'center'}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setRemember(!remember)}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            borderRadius: 5,
                                            backgroundColor: '#fff',
                                            borderWidth: 1,
                                            borderColor: '#9A46DB',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 10,
                                        }}>
                                        {remember && (
                                            <Image
                                                source={require('../../assets/icon/tick.png')}
                                                style={{
                                                    height: 10,
                                                    width: 10,
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <Text style={{color:'#250959',fontSize:14,fontFamily:'Gilroy',fontWeight:'700'}}>Remember Me</Text>
                                </View>
                                <Text
                                    bold
                                    style={styles.link}
                                    onPress={() => {
                                        navigation.navigate('ForgetPassword');
                                    }}>
                                    Forgot Password?
                                </Text>
                            </HStack>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '90%',
                                    marginTop: 20,
                                }}>
                                <CommanButton
                                    label={'Login'}
                                    onCkick={submit}
                                    isLoading={isLoading}
                                    width={Platform.OS == 'ios' ? '56%' : '72%'}
                                />
                                <GoogleLogin setMsg={setErrMsg} />
                                {Platform.OS == 'ios' && (
                                    <AppleLogin setMsg={setErrMsg} />
                                )}
                            </View>
                        </VStack>
                    </View>
                )}
          {errMsg.show && (
                    <Alert
                        w="100%"
                        status={errMsg.error ? 'danger' : 'success'}
                        mt={5}
                        mb={-10}>
                        <Text
                            fontSize="md"
                            color={errMsg.error ? 'red.500' : 'green.600'}>
                            {errMsg.msg}
                        </Text>
                    </Alert>
                )}

                <Box style={styles.linkBox} >
                    <Text style={{color:'#9284AC',fontSize:14,fontFamily:'Gilroy',fontWeight:'700'}}>
                        Don't have an account?
                        <Text
                            bold
                            style={styles.link}
                            onPress={() => navigation.navigate('Register')}>
                            {' '}
                            Register
                        </Text>
                    </Text>
                </Box>
            </Box>
            {/* <View style={{height: 20}} /> */}
                </ScrollView>
        </SafeAreaView>
    );
};
// w= -0.5, h= -1.5 ~ -1.7

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 10,
        height: heightPercentageToDP('100%'),
        width: '100%',
        backgroundColor: '#F2F2F2',
    },
    backIcon: {
        height: 50,
        width: 50,
        marginTop: 20,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        elevation: 3,
    },
    socialIcon: {
        height: 30,
        width: 30,
        resizeMode: 'stretch',
    },
    socialButton: {
        backgroundColor: '#fff',
        width: widthPercentageToDP('65%'),
        height: 55,
        elevation: 3,
        borderRadius: 10,
        padding: 15,
    },
    logo: {
        height: 45,
        width: '65%',
        resizeMode: 'stretch',
        marginTop: '5%',
        // marginBottom: '15%',
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
    },
    input: {
        flex: 1,
        paddingLeft: 20,
        height: 60,
        color: 'black',
        backgroundColor: 'transparent',
    },
    icon: {
        height: 20,
        width: 20,
        marginRight: 10,
    },
    loginButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        width: '70%',
        height: 55,
        borderRadius: 10,
    },
    buttonDisabled: {
        backgroundColor: 'rgba(90,113,189,0.9))',
        alignSelf: 'center',
        width: '70%',
        height: 55,
        borderRadius: 10,
    },
    link: {
        color: '#9A46DB',
        fontSize: 14,
        fontFamily: 'Gilroy',
        fontWeight: '700',
    },
    linkBox: {
        position:'absolute',
        // display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom:Platform.OS == 'ios' ? 70 :10
    },
    footer: {
        alignSelf: 'center',
        color: 'rgba(153, 153, 153, 1.0)',
        position: 'relative',
        bottom: 0,
    },
    heading: {
        color: '#B598CB',
        textAlign: 'center',
        fontSize: 10,
    },
    text: {
        fontSize: 30,
        color: '#250959',
        paddingLeft: 15,
        fontFamily: 'Gilroy',
        fontWeight: '700',
        paddingTop: 10,
    },
    text1: {
        paddingTop: 8,
        fontSize: 12,
        color: '#250959',
        paddingLeft: 15,
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
    toggleStyle: {
        fontSize: 16,
        color: '#250959',
        fontFamily: 'Gilroy',
        fontWeight: '600',
        paddingRight: 10,
    },
    socialButton1: {
        backgroundColor: '#fff',
        width: 60,
        height: 60,
        elevation: 3,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Login;
