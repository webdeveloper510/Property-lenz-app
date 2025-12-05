import React, {useEffect, useState} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    Button,
    Image,
    HStack,
    Stack,
    FormControl,
    Input,
    Alert,
} from 'native-base';
import {apiForgotPassword} from '@/apis/auth';
import {SafeAreaView} from 'react-native';
import {warningTimer} from '@/constant/customHooks';
import TextInputField from '@/components/TextInputField';
import BackButton from '@/components/BackButton';
import CommanButton from '@/components/CommanButton';
// icons
import Back from '@/assets/icon/btnBack.png';
import Logo from '@/assets/logo/logo1.png';

const ForgetPassword = ({navigation}: any): React.JSX.Element => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});

    const forgetRequest = async () => {
        if (email.trim() == '') {
            setErrMsg({msg: 'Please Give Email', error: true, show: true});
            const timer = await warningTimer(1.5);
            timer && setErrMsg({msg: '', error: false, show: false});
        } else {
            setLoading(true);
            const data = {email: email.toLowerCase().trim()};
            const response = await apiForgotPassword(data);
            console.log(response);
            if (response.status) {
                setLoading(false);
                setErrMsg({msg: response.message, error: false, show: true});
                const timer = await warningTimer(8);
                timer && setErrMsg({msg: '', error: false, show: false});
            } else {
                setLoading(false);
                setErrMsg({msg: response.message, error: true, show: true});
                const timer = await warningTimer(8);
                timer && setErrMsg({msg: '', error: false, show: false});
            }
        }
    };
    useEffect(() => {}, [loading]);

    return (
        <SafeAreaView style={styles.mainContainer}>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{flex: 1}}>
                    <View
                        style={{
                            marginTop: Platform.OS == 'ios' ? 0 : 28,
                            marginLeft: 10,
                        }}>
                        <BackButton navigation={navigation} />
                    </View>

                    <Image
                        source={Logo}
                        style={styles.logo}
                        mx={'auto'}
                        alt="Logo"
                        resizeMode="contain"
                    />
                    <Text style={styles.heading}>PropertyLenz 2025</Text>
                    <View style={{height: 75}} />
                    <Text style={styles.text}>Forgot Password?</Text>
                    <Text style={styles.text1}>
                        Lorem Ipsum is simply dummy text{'\n'}of the industry.
                    </Text>
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}
                            mb={5}>
                            <Text>{errMsg.msg}</Text>
                        </Alert>
                    )}
                    <View style={{height: 50}} />
                    <TextInputField
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        url={require('../../assets/icon/email.png')}
                        label={'Email'}
                    />
                    {/* <FormControl style={styles.formControl}>
              <Input variant="filled" placeholder="Email" style={styles.input}
              keyboardType="email-address" _focus={{ borderColor: 'transparent' }}
                value={email} onChangeText={setEmail} />
            </FormControl> */}
                    {/* <View style={{height: 50}} /> */}
                    <CommanButton
                        label={'Confirm'}
                        onCkick={forgetRequest}
                        isLoading={loading}
                    />
                    <View style={{flex:1,position:'relative'}}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 25,
                            position: 'absolute',
                            bottom: 20,
                            alignSelf: 'center',
                        }}>
                        <Text
                            style={{
                                color: '#9284AC',
                                fontSize: 14,
                                fontFamily: 'Gilroy',
                                fontWeight: '700',
                            }}>
                            Back to{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.goBack(null)}>
                            <Text
                                style={{
                                    color: '#9A46DB',
                                    fontSize: 14,
                                    fontFamily: 'Gilroy',
                                    fontWeight: '700',
                                }}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        // justifyContent: 'flex-start',
        padding: 10,
        backgroundColor: '#F2F2F2',
        height: '100%',
        width: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    logo: {
        height: 60,
        width: '65%',
        marginTop: '5%',
        // backgroundColor: 'black',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 10,
        height: '100%',
        width: '100%',
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
        marginBottom: 20,
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
    linkBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        verticalAlign: 'bottom',
    },
    link: {
        color: 'rgba(37, 73, 137, 0.8)',
    },
    link2: {
        color: 'rgba(37, 73, 137, 0.8)',
        marginTop: -5,
    },
    linkContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
});

export default ForgetPassword;
