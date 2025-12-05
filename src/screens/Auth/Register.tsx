import React, {useState} from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
	TouchableOpacity
} from 'react-native';
import {
  
    Text,
   
    Image,


    Alert,

} from 'native-base';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {apiRegister} from '@/apis/auth';
import {warningTimer} from '@/constant/customHooks';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import CommanButton from '@/components/CommanButton';
import GoogleLogin from './GoogleLogin';
import AppleLogin from './AppleLogin';
import PhoneInputField from '@/components/PhoneInputField';
// icons
import Hide from '@/assets/icon/hide.png';
import Show from '@/assets/icon/view.png';
import Logo from '@/assets/logo/logo1.png';
import Back from '@/assets/icon/btnBack.png';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const Register = ({navigation}: any): React.JSX.Element => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [cpass, setCpass] = useState('');
    const [password, setPassword] = useState('');
    const [phone,setPhone] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [view, setView] = useState<boolean>(false);
    const [view1, setView1] = useState<boolean>(false);
    const [countryCode,setCountryCode] = useState('');
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });

    const submit = async () => {
        if (firstName.trim() === '') {
            setErrMsg({
                message: 'Please Give First Name',
                error: true,
                show: true,
            });
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        } else if (lastName.trim() === '') {
            setErrMsg({
                message: 'Please Give Last Name',
                error: true,
                show: true,
            });
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        } else if (email.trim() === '') {
            setErrMsg({message: 'Please Give Email', error: true, show: true});
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        } else if (password.trim() !== '' && cpass.trim() !== '') {
            if (password.trim() !== cpass.trim()) {
                setErrMsg({
                    message: "Password Doesn't Match.",
                    error: true,
                    show: true,
                });
                const timer = await warningTimer(2);
                timer && setErrMsg({message: '', error: false, show: false});
            } else {
                setIsLoading(true);
                try {
                    const data = {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        email: email.toLowerCase().trim(),
                        password: password.trim(),
                        confirm_password: cpass.trim(),
                        phone:phone,
                        country_code:countryCode
                    };

                    console.log("🚀 ~ submit ~ data:", data)
                    const response = await apiRegister(data);
                    console.log("🚀 ~ submit ~ response:", response)
                    if (response.status) {
                        navigation.navigate('Login');
                        // navigation.navigate('Subscribe', response.result);
                    } else {
                        setErrMsg({
                            message: response.message,
                            error: true,
                            show: true,
                        });
                        const timer = await warningTimer(3);
                        timer &&
                            setErrMsg({message: '', error: false, show: false});
                    }
                } catch (error) {
                    setErrMsg({
                        message:
                            'An error occurred during login. Please try again later.',
                        error: true,
                        show: true,
                    });
                    const timer = await warningTimer(3);
                    timer &&
                        setErrMsg({message: '', error: false, show: false});
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            setErrMsg({
                message: 'Please Fill Both Password Fields',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={{marginHorizontal:20,flexDirection:'row',justifyContent:'space-between',marginTop: Platform.OS == 'ios' ? 28 :34}}>
            <BackButton navigation={navigation} />
            <View>
            <Image
                    source={Logo}
                    style={styles.logo}
                    mx={'auto'}
                    alt="Logo"
                    resizeMode="contain"
                />

                <Text style={styles.heading}>PropertyLenz 2025</Text>
                </View>
                <View></View>
            </View>
        <KeyboardAwareScrollView
            enableOnAndroid={true}
            enableAutomaticScroll={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={100}
            extraHeight={20}>
            <View style={styles.mainContainer}>
             
             
                <View style={{height: 20}} />
                <Text style={styles.text}>Register Now!</Text>
                <Text style={styles.text1}>
                    Hey, Enter your details to get your{'\n'}new account.
                </Text>
                <TextInputField
                    placeholder="Enter your name"
                    value={firstName}
                    onChangeText={setFirstName}
                    url={require('../../assets/icon/user_3.png')}
                    label={'First Name'}
                />
                <TextInputField
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={setLastName}
                    url={require('../../assets/icon/user_3.png')}
                    label={'Last Name'}
                />
                <TextInputField
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    url={require('../../assets/icon/email.png')}
                    label={'Email'}
                />
                 <PhoneInputField
                        placeholder="Enter your phone"
                        value={phone}  
                        label={'Phone'}
                        onChangeText={setPhone}
                        onCallBack={(txt:any)=> setCountryCode(txt)}
                        />
                 {/* <TextInputField
                    placeholder="Enter your phone"
                    value={phone}
                    onChangeText={setPhone}
                    url={require('../../assets/icon/email.png')}
                    label={'Phone'}
                /> */}
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
                <TextInputField
                    placeholder="* * * * * * * * *"
                    value={cpass}
                    onChangeText={setCpass}
                    url={require('../../assets/icon/lock.png')}
                    label={'Confirm Password'}
                    secureTextEntry={view1 ? false : true}
                    isEye={true}
                    onClick={() => setView1(!view1)}
                    rightIcon={require('../../assets/icon/eye_2.png')}
                />

                {errMsg.show && (
                    <Alert
                        w="100%"
                        status={errMsg.error ? 'danger' : 'success'}
                        mt={4}>
                        <Text
                            fontSize="md"
                            color={errMsg.error ? 'red.500' : 'green.500'}>
                            {errMsg.message}
                        </Text>
                    </Alert>
                )}
                {/* <CommanButton
                    label={'Register'}
                    onCkick={submit}
                    isLoading={isLoading}
                /> */}
                 <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '90%',
                                    marginTop: 20,
                                    alignSelf:'center'
                                }}>
                                <CommanButton
                                    label={'Register'}
                                    onCkick={submit}
                                    isLoading={isLoading}
                                    width={Platform.OS == 'ios' ? '56%' : '72%'}
                                />
                                <GoogleLogin setMsg={setErrMsg} />
                                {Platform.OS == 'ios' && (
                                    <AppleLogin setMsg={setErrMsg} />
                                )}
                            </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // position: 'absolute',
                        // bottom: 30,
                        alignSelf: 'center',
                        marginTop:30
                    }}>
                    <Text style={{color:'#9284AC',fontSize:14,fontFamily:'Gilroy',fontWeight:'700'}}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.goBack(null)}>
                        <Text
                            style={{
                                color: '#9A46DB',
                                fontSize: 14,
                                fontFamily: 'Gilroy',
                                fontWeight: '700',
								paddingLeft:5
                            }}>
                            Login Now
                        </Text>
                    </TouchableOpacity>
                </View>
                {/* <Button
                        mt={4}
                        isLoading={isLoading}
                        style={styles.loginButton}
                        onPress={submit}>
                        Register
                    </Button> */}
            </View>
        </KeyboardAwareScrollView>
            </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 10,
        minHeight: heightPercentageToDP('100%'),
        width: '100%',
        backgroundColor: '#F2F2F2',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        padding: 10,
        height: '100%',
        width: '100%',
    },
    logo: {
        height: 40,
        width: 160
    },
    heading: {
        color: '#B598CB',
        textAlign: 'center',
        fontSize: 10,
    },
    text: {
        paddingTop: 12,
        fontSize: 30,
        color: '#250959',
        paddingLeft: 15,
        // fontFamily: 'Gilroy',
        fontWeight: '700',
        // marginTop: 15,
    },
    text1: {
        paddingTop: 8,
        fontSize: 12,
        color: '#250959',
        paddingLeft: 15,
        fontFamily: 'Gilroy',
        fontWeight: '400',
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
    linkBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    link: {
        color: 'rgba(37, 73, 137, 0.8)',
    },
    footer: {
        alignSelf: 'center',
        color: 'rgba(153, 153, 153, 1.0)',
    },
});

export default Register;
