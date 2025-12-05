import React, {useEffect, useState, useRef} from 'react';
import {
    Pressable,
    StyleSheet,
    SafeAreaView,
    Linking,
    Platform,
    View,
    TouchableOpacity,
} from 'react-native';
import {
    Text,
    Input,
    Button,
    Box,
    Image,
    Divider,
    HStack,
    FormControl,
    ScrollView,
    Alert,
    Modal,
} from 'native-base';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {key} from '../../HomeStack/AddProperty/key';
import {detailsData} from '@/services/types';
import {
    apiGetProfile,
    apiLogout,
    apiTenantLogOut,
    apiUpdateProfile,
} from '@/apis/auth';
import {setLoggedIn, setProfile, setUserData} from '@/state/authSlice';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dp from './_dp';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import PhoneInputField from '@/components/PhoneInputField';
import CommanButton from '@/components/CommanButton';
// icon
import BackIcon from '@/assets/icon/btnBack.png';
import cacheService from '@/services/CacheServices';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {BlurView} from '@react-native-community/blur';
const initialAddress = '1600 Amphitheatre Parkway, Mountain View, CA';
const Profile = ({navigation}: any): React.JSX.Element => {
    const userData: any = useAppSelector(state => state.auth.userData);
    const profileData: any = useAppSelector(state => state.auth.profileData);
    // console.log('profile data====>', userData);
    const [fName, setFName] = useState(userData?.first_name);
    const [lName, setLName] = useState(userData?.last_name);
    const [phone, setPhone] = useState<number | string>(userData?.phone);
    const [mobile, setMobile] = useState<string | null>(
        profileData?.mobile || null,
    );
    const [address, setAddress] = useState<string | null>(userData?.address);
    const [address2, setAddress2] = useState<string | null>(
        profileData?.address_line_2,
    );
    const [country, setCountry] = useState<string | null>(profileData?.country);
    const [countryCode, setCountryCode] = useState<string | null>('');
    // console.log("🚀 ~ Profile ~ countryCode:", countryCode)

    const [state, setState] = useState<string | null>(profileData?.state);
    const [city, setCity] = useState<string | null>(profileData?.city);
    const [zip, setZip] = useState<string | null>(profileData?.zip);
    const [tax_Id, setTax_Id] = useState<string | null>(
        profileData?.tax_id || '',
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoading1, setIsLoading1] = useState<boolean>(false);
    const [location, setLocation] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const [addressText, setAddressText] = useState(profileData?.address || '');
    const ref = useRef();
    const dispatch = useAppDispatch();

    const cleanUp = async (): Promise<boolean> => {
        try {
            dispatch(setLoggedIn(false));
            dispatch(setUserData(null));
            dispatch(setProfile(null));
            await AsyncStorage.removeItem('@userData');
            console.log('cleanup success');
            return true;
        } catch (error) {
            console.log('cleanup failed');
            return false;
        }
    };

    const logout = async (): Promise<boolean> => {
        try {
            if (userData.type != 'TENANT') {
                await GoogleSignin.signOut();
                const response = await apiLogout();
                if (response.status) {
                    console.log('logout success');
                    return cleanUp();
                } else {
                    console.log('logout failed');
                    return false;
                }
            } else {
                const response = await apiTenantLogOut();
                if (response.status) {
                    console.log('logout success');
                    return cleanUp();
                } else {
                    console.log('logout failed');
                    return false;
                }
            }
        } catch (error) {
            return false;
        }
    };

    const accountDeleteHandle = async () => {
        const downloadUrl =
            'https://portal.propertylenz.io/request-account-deletion';
        const logOutStatus = await logout();
        if (logOutStatus) {
            try {
                await Linking.openURL(downloadUrl);
                console.log('Opening URL in browser: ', downloadUrl);
            } catch (err) {
                console.log('Error opening file: ', err);
            }
        } else {
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

 const getProfile = async () => {
    const online = await cacheService.checkIsOnline();
    
    // Check if the user is online before making the API call
    if (online) {
        const response = await apiGetProfile({});
        
        // 1. Check if response and response.result exist before logging/accessing address
        const profileAddress = response?.result?.address || '';
        
        console.log('🚀 ~ getProfile ~ response:', profileAddress);
        
        // Use the null-safe variable
        setAddress(profileAddress);
        
        // 2. Main success check
        if (response?.status) {
            
            // Check if result exists before dispatching userData
            if (response.result) { 
                dispatch(setUserData({...userData, dp: response.result.dp}));
            }

            // 3. Check for ref.current existence and use the safe address variable
            if (ref.current) {
                ref.current.setAddressText(profileAddress);
            }

            // 4. Check if result exists before dispatching setProfile
            if (response.result) {
                dispatch(setProfile(response.result));
            }
        }
    }
};
    const onUpdate = async () => {
        setIsLoading(true);
        const updateData = {
            first_name: fName === '' ? null : fName,
            last_name: lName === '' ? null : lName,
            phone: phone === '' ? null : `${countryCode}${phone}`,
            mobile: mobile === '' ? null : mobile,
            address: address === '' ? null : address,
            address_line_2: address2 === '' ? null : address2,
            country: country === '' ? null : country,
            city: city === '' ? null : city,
            state: state === '' ? null : state,
            zip: zip === '' ? null : zip,
            tax_id: tax_Id === '' ? null : tax_Id,
        };
        const response = await apiUpdateProfile(updateData);
        if (response.status) {
            dispatch(
                setUserData({
                    ...userData,
                    first_name: fName,
                    last_name: lName,
                    phone: phone,
                }),
            );
            getProfile();
            setIsLoading(false);
            setErrMsg({msg: 'Profile Updated', error: false, show: true});
            setTimeout(() => {
                setErrMsg({msg: '', error: false, show: false});
            }, 3000);
        } else {
            setIsLoading(false);
            setErrMsg({msg: response.message, error: true, show: true});
            setTimeout(() => {
                setErrMsg({msg: '', error: false, show: false});
            }, 3300);
        }
    };

    useEffect(() => {}, [userData, profileData]);
    const fillLocationDetails = (details: detailsData) => {
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@123===>');
        details.address_components.map(component => {
            if (component.types && component.types.includes('street_number')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('route')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('neighborhood')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('locality')) {
                setCity(component.long_name);
            }
            if (
                component.types &&
                component.types.includes('administrative_area_level_1')
            ) {
                setState(component.long_name);
            }
            if (component.types && component.types.includes('country')) {
                setCountry(component.long_name);
            }
            if (component.types && component.types.includes('postal_code')) {
                setZip(component.long_name);
            }
        });
        console.log('details.formatted_address', details.formatted_address);
        setLocation(details.formatted_address);
        setAddress(details.formatted_address);
        // setAddress_2(details.formatted_address);
        // setLongitude(details.geometry.location.lng);
        // setLatitude(details.geometry.location.lat);
    };
    return (
        <SafeAreaView style={{flex: 1}}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 28,
                    marginHorizontal: 15,
                    // backgroundColor:'red'
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        paddingRight: 12,
                        // paddingTop: 20,
                    }}>
                    Edit Profile
                </Text>
                <View></View>
            </View>
              <KeyboardAwareScrollView
                            enableOnAndroid={true}
                            enableAutomaticScroll={Platform.OS === 'ios'}
                            keyboardShouldPersistTaps="handled"
                            extraScrollHeight={100}
                            extraHeight={20}
                            nestedScrollEnabled={true}>
                <View style={styles.mainContainer}>
                    {/* dp component */}
                    {userData.type != 'TENANT' && (
                        <View
                            style={{
                                alignItems: 'center',
                                marginBottom: 20,
                                flexDirection: 'row',
                                marginHorizontal: 15,
                            }}>
                            <Dp />
                            <Text
                                bold
                                fontSize={'2xl'}
                                alignSelf={'center'}
                                color={'#250959'}
                                pl={'5'}>
                                {userData?.first_name?.length > 6
                                    ? `${userData?.first_name}\n${userData?.last_name}`
                                    : `${userData?.first_name} ${userData?.last_name}`}
                            </Text>
                        </View>
                    )}

                    <Modal
                        isOpen={modalVisible}
                        onClose={() => setModalVisible(false)}
                        justifyContent="center"
                        size="lg"
                        backdropOpacity={0}>
                        <View style={StyleSheet.absoluteFill}>
                            <BlurView
                                style={StyleSheet.absoluteFill}
                                blurType="light"
                                blurAmount={1}
                            />
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: '#9A46DB40', // Tint color
                                }}
                            />
                        </View>
                        <Modal.Content
                            borderRadius={20}
                            backgroundColor="#ffffff">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    padding: 10,
                                    backgroundColor: '#F2F2F2',
                                    borderBottomLeftRadius: 20,
                                    zIndex: 1,
                                }}>
                                <Image
                                    source={require('../../../assets/icon/close_2.png')}
                                    style={{
                                        width: 15,
                                        height: 15,
                                        tintColor: '#9A46DB',
                                    }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Modal.Header
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text
                                    style={{
                                        color: '#250959',
                                        fontSize: 18,
                                        fontFamily: 'Gilroy-Regular',
                                        fontWeight: '700',
                                    }}>
                                    Delete Account
                                </Text>
                            </Modal.Header>
                            <Modal.Body
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text
                                    my={2}
                                    style={{
                                        textAlign: 'center',
                                        color: '#250959',
                                        fontSize: 14,
                                        fontFamily: 'Gilroy-Regular',
                                    }}>
                                    Are you sure you want to {'\n'} delete
                                    account?
                                </Text>
                            </Modal.Body>
                            <Modal.Footer
                                justifyContent={'space-around'}
                                backgroundColor={'#ffffff'}>
                                <Button
                                    px={8}
                                    py={2}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderWidth: 1,
                                        borderRadius: 32,
                                        borderColor: '#9A46DB',
                                    }}
                                    onPress={() => {
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#9A46DB'}}>Back</Text>
                                </Button>
                                <Button
                                    px={8}
                                    py={2}
                                    style={{
                                        backgroundColor: '#9A46DB',
                                        borderWidth: 1,
                                        borderRadius: 32,
                                        borderColor: '#9A46DB',
                                    }}
                                    onPress={() => {
                                        accountDeleteHandle();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#ffffff'}}>
                                        Confirm
                                    </Text>
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    <Text style={styles.heading1}>General Info</Text>
                    <TextInputField
                        placeholder="Enter your name"
                        value={fName}
                        onChangeText={setFName}
                        url={require('../../../assets/icon/user_3.png')}
                        label={'First Name'}
                    />
                    <TextInputField
                        placeholder="Enter your last name"
                        value={lName}
                        onChangeText={setLName}
                        url={require('../../../assets/icon/user_3.png')}
                        label={'Last Name'}
                    />
                    <Text style={styles.heading1}>Contact Details</Text>
                    {/* <TextInputField
                        placeholder="Enter your phone"
                        value={phone}
                        onChangeText={setPhone}
                        url={require('../../../assets/icon/phone_2.png')}
                        label={'Phone'}
                    /> */}
                    <PhoneInputField
                        placeholder="Enter your phone"
                        value={phone}
                        label={'Phone'}
                        onChangeText={setPhone}
                        onCallBack={(txt: any) => setCountryCode(txt)}
                    />

                    {userData.type != 'MANAGER' && (
                        <TextInputField
                            placeholder="Enter your phone"
                            value={mobile}
                            onChangeText={setMobile}
                            url={require('../../../assets/icon/mobile_2.png')}
                            label={'Mobile'}
                        />
                    )}
                    <TextInputField
                        placeholder="Enter your zip"
                        value={userData?.email}
                        url={require('../../../assets/icon/email_3.png')}
                        label={'Email'}
                        isDisable={true}
                    />
                    <Text style={styles.heading1}>Location Info</Text>

                    <View style={[styles.MainContainer21, {zIndex: 999}]}>
                        <View
                            style={{
                                width: '15%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Image
                                source={require('../../../assets/icon/location_2.png')}
                                style={{width: 19, height: 19}}
                                resizeMode="contain"
                            />
                        </View>

                        <View
                            style={{
                                width: '70%',
                                position: 'relative',
                                zIndex: 999,
                            }}>
                            <Text style={styles.labelStyle}>Address</Text>

                            <GooglePlacesAutocomplete
                                ref={ref}
                                placeholder="Address"
                                fetchDetails={true}
                                query={{
                                    key: key?.key,
                                    language: key?.language,
                                }}
                                textInputProps={{
                                    InputComp: Input,
                                    placeholderTextColor: '#250959', // ✅ Placeholder color
                                    onChangeText: (text) => setAddressText(text),
                                }}
                                styles={{
                                    container: {
                                        flex: 0,
                                        zIndex: 999,
                                    },
                                    textInputContainer: {
                                        height: 45,
                                    },
                                    textInput: {
                                        height: 45,
                                        paddingHorizontal: 0,
                                        borderColor: 'transparent',
                                        borderRadius: 0,
                                        fontSize: 14,
                                        color: '#000',
                                    },
                                    listView: {
                                        position: 'absolute',
                                        top: 50, // ✅ Dropdown appears below input
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#fff',
                                        borderRadius: 8,
                                        elevation: 5, // Android shadow
                                        shadowColor: '#000',
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        zIndex: 999,
                                    },
                                    row: {
                                        paddingVertical: 12,
                                        paddingHorizontal: 10,
                                    },
                                    separator: {
                                        height: 1,
                                        backgroundColor: '#eee',
                                    },
                                }}
                                onPress={(data, details: any) => {
                                    fillLocationDetails(details);
                                    setAddressText(data.description);
                                }}
                                renderRow={data => (
                                    <Text style={{fontSize: 14, color: '#333'}}>
                                        {data.description}
                                    </Text>
                                )}
                                nestedScrollEnabled={true}
                            />
                        </View>
                    </View>
                    {/* <TextInputField
                        placeholder="Enter your address"
                        value={address}
                        onChangeText={setAddress}
                        url={require('../../../assets/icon/location_2.png')}
                        label={'Address'}
                    /> */}

                    <TextInputField
                        placeholder="Enter your country"
                        value={country}
                        onChangeText={setCountry}
                        url={require('../../../assets/icon/flag_2.png')}
                        label={'Country'}
                    />
                    <TextInputField
                        placeholder="Enter your state"
                        value={state}
                        onChangeText={setState}
                        url={require('../../../assets/icon/state.png')}
                        label={'State'}
                    />
                    <TextInputField
                        placeholder="Enter your state"
                        value={city}
                        onChangeText={setCity}
                        url={require('../../../assets/icon/city_2.png')}
                        label={'City'}
                    />
                    <TextInputField
                        placeholder="Enter your zip"
                        value={zip}
                        onChangeText={setZip}
                        url={require('../../../assets/icon/zip_2.png')}
                        label={'Zip'}
                    />
                    <TextInputField
                        placeholder="Enter your Address 2"
                        value={address2}
                        onChangeText={setAddress2}
                        url={require('../../../assets/icon/location_2.png')}
                        label={'Address 2'}
                    />
                    <Text style={styles.heading1}>Other Info</Text>
                    {userData.type != 'TENANT' && (
                        <TextInputField
                            placeholder="Enter your Tax Id"
                            value={tax_Id}
                            onChangeText={setTax_Id}
                            url={require('../../../assets/icon/tax_2.png')}
                            label={'Tax Id'}
                        />
                    )}

                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}
                            mb={3}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.500'}>
                                {errMsg.msg}
                            </Text>
                        </Alert>
                    )}
                    {/* https://portal.propertylenz.io/request-account-deletion */}
                    <View
                        style={{
                            width: '92%',
                            alignSelf: 'center',
                            justifyContent:
                                userData.type == 'OWNER'
                                    ? 'space-between'
                                    : 'center',
                            flexDirection: 'row',
                        }}>
                        {userData.type == 'OWNER' && (
                            <CommanButton
                                label={'Delete Account'}
                                onCkick={() => setModalVisible(!modalVisible)}
                                isLoading={isLoading1}
                                width={'51%'}
                                color={'#ffffff'}
                                titleColor={'#9945DA'}
                            />
                        )}
                        <CommanButton
                            label={'Update'}
                            onCkick={onUpdate}
                            isLoading={isLoading}
                            width={userData.type == 'OWNER' ? '45%' : '100%'}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 8,
        flex: 1,
        // padding: 10,
        backgroundColor: '#F2F2F2',
        // minHeight: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
        resizeMode: 'stretch',
    },
    avatar: {},
    formControl: {
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 'auto',
        width: '100%',
        borderRadius: 8,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        paddingLeft: 20,
        color: 'black',
    },
    badge: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(250,250,250,0.8)',
        elevation: 10,
        marginTop: -45,
    },
    button: {
        backgroundColor: 'rgba(10,113,189,0.9)',
    },
    modalButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: 80,
    },
    cardButtonExpired: {
        backgroundColor: 'rgba(253, 56, 24, 1)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    heading1: {
        fontSize: 10,
        color: '#250959',
        paddingLeft: 30,
        fontWeight: '500',
        fontFamily: 'Gilroy-SemiBold',
    },
    MainContainer21: {
        width: '90%',
        height: 66,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 70,
        marginVertical: 10,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelStyle: {
        fontSize: 10,
        color: '#250959',
        paddingLeft: 5,
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
});

export default Profile;
