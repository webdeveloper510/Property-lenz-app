import React, {useEffect, useState} from 'react';
import {
    Linking,
    PermissionsAndroid,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {Text, HStack, VStack, Switch, Box, Button, Alert,Modal} from 'native-base';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {
    setLoggedIn,
    setPackage,
    setProfile,
    setUserData,
} from '@/state/authSlice';
import {setHomeMode} from '@/state/propertyDataSlice';
import {Subscription, UserDataObject} from '@/services/types';
import {
    apiCancelSubscribe,
    apiLogout,
    apiTenantLogOut,
    apiGetCheckTrails,
} from '@/apis/auth';
import {setInspection} from '@/state/propertyDataSlice';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import cacheService from '@/services/CacheServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import BackButton from '@/components/BackButton';
//  icon
import Background from '@/assets/icon/background_3.png';
import ProfileIcon from '@/assets/icon/user_2.png';
import Homemode from '@/assets/icon/mode_2.png';
import Notify from '@/assets/icon/notification.png';
import LogoutIcon from '@/assets/icon/logout_2.png';
import SubscribeIcon from '@/assets/icon/subscription.png';
import {warningTimer} from '@/constant/customHooks';
import {BlurView} from '@react-native-community/blur';
const Settings = ({navigation}: any): React.JSX.Element => {
    const dispatch = useAppDispatch();
    const userData: UserDataObject | any = useAppSelector(
        state => state.auth.userData,
    );

    const userPackage: Subscription | any = useAppSelector(
        state => state.auth.userPackage,
    );
  
    const homeModeStatus: boolean = useAppSelector(
        state => state.property.homeMode,
    );
    const [modalVisible,setModalVisible] = useState(false)
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const [allowNotification, setAllowedNotification] = useState(false);
    const [trailData,setTrailData] = useState({});
    const cleanUp = async () => {
        const status = await cacheService.resetData();
        if (status) {
            dispatch(setLoggedIn(false));
            dispatch(setUserData(null));
            dispatch(setProfile(null));
            dispatch(setPackage(null));
            dispatch(setInspection(null));
        }
    };

    const logout = async () => {
        const response =
            userData.type !== 'TENANT'
                ? await apiLogout()
                : await apiTenantLogOut();
        if (response.status) {
            cleanUp();
            if (userData.type == 'OWNER') {
                await GoogleSignin.signOut();
            }
        }
    };

    const handleNotificationSwitch = async () => {
        let allow: boolean = !allowNotification;
        if (allow) {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const permission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
                if (permission == 'granted') {
                    await AsyncStorage.setItem('@notification', 'true');
                    setAllowedNotification(true);
                } else {
                    await AsyncStorage.setItem('@notification', 'false');
                    setAllowedNotification(false);
                }
                // Check if iOS version is 10 or higher
            } else if (
                Platform.OS === 'ios' &&
                (Platform.Version >= '10.0' || Platform.Version >= '10')
            ) {
                const authorizationStatus =
                    await messaging().requestPermission();
                const enabled =
                    authorizationStatus ===
                        messaging.AuthorizationStatus.AUTHORIZED ||
                    authorizationStatus ===
                        messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    await AsyncStorage.setItem('@notification', 'true');
                    setAllowedNotification(true);
                } else {
                    await Linking.openSettings();
                    await AsyncStorage.setItem('@notification', 'true');
                    setAllowedNotification(true);
                }
            } else {
                await AsyncStorage.setItem('@notification', 'false');
                setAllowedNotification(false);
            }
        } else {
            await AsyncStorage.setItem('@notification', 'false');
            setAllowedNotification(false);
        }
    };
    const unSubscribe = async () => {
        const response = await apiCancelSubscribe();
        if (response.status) {
            let user: any = {...userData, subscriptionPackage: null};
            // delete user.subscriptionPackage;
            dispatch(setUserData(user));
            dispatch(setPackage(null));
            await AsyncStorage.removeItem('@packageData');
            await AsyncStorage.setItem('@userData', JSON.stringify(user));
        }
        setErrMsg({msg: response.message, error: response.status, show: true});
        const timer = await warningTimer(2);
        timer && setErrMsg({msg: '', error: false, show: false});
    };
    useEffect(() => {
        (async () => {
            const response = await AsyncStorage.getItem('@notification');
            if (response) {
                setAllowedNotification(response == 'true');
                console.log('set', response);
            } else {
                setAllowedNotification(false);
                await AsyncStorage.setItem('@notification', 'false');
            }
        })();
    }, []);
    useEffect(() => {}, [allowNotification]);

    const handleHomeMode = async () => {
        try {
            console.log('defalut vale==>', !homeModeStatus);
            dispatch(setHomeMode(!homeModeStatus));
            await AsyncStorage.setItem('@homeMode', `${!homeModeStatus}`);
        } catch (error) {
            console.log('🚀 ~ handleHomeMode ~ error:', error);
        }
    };

    useEffect(() => {
        getTrails();
    }, []);

    const getTrails = async () => {
        try {
            const res = await apiGetCheckTrails();
            if (res.code == '200') {
                setTrailData(res.result)
            }
            console.log('🚀 ~ getTrails ~ res:', res);
        } catch (error) {
            console.log('🚀 ~ getTrails ~ error:', error);
        }
    };
    return (
        <SafeAreaView>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    marginTop: Platform.OS == 'ios' ? 0 : 28,
                    marginHorizontal: 20,
                    justifyContent: 'space-between',
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        flex:1,
                        textAlign: 'center',
                    }}>
                    Settings
                </Text>
                <View style={{width:24}}/>
            </View>

            <ScrollView>
                <VStack space={3} style={styles.mainContainer}>
                    <ImageBackground
                        source={Background}
                        style={styles.imageBackground}
                        imageStyle={styles.imageStyle}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: 60,
                            }}>
                            <Image
                                source={require('../../assets/icon/free.png')}
                                style={{
                                    width: 21,
                                    height: 21,
                                    marginTop: 20,
                                    marginLeft: 20,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 30,
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    paddingTop: 29,
                                    paddingLeft: 20,
                                }}>
                                    {trailData.name}
                                {/* {userPackage.title} */}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                marginTop: 2,
                                marginBottom: 15,
                            }}>
                            <View
                                style={{
                                    alignItems: 'center',
                                    backgroundColor: '#9A46DB80',
                                    padding: 10,
                                    borderRadius: 10,
                                    width: '40%',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 26,
                                        fontWeight: '700',
                                        color: '#ffffff',
                                        paddingTop: 8,
                                    }}>
                                   {trailData.units}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '400',
                                        color: '#ffffff',
                                    }}>
                                    Allowed Properties
                                </Text>
                            </View>
                            <View
                                style={{
                                    alignItems: 'center',
                                    backgroundColor: '#9A46DB80',
                                    padding: 8,
                                    borderRadius: 10,
                                    width: '40%',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 26,
                                        fontWeight: '700',
                                        color: '#ffffff',
                                        paddingTop: 10,
                                    }}>
                                     Unlimited
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '400',
                                        color: '#ffffff',
                                    }}>
                                    Allowed User
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Subscribe', {
                                    user_id: userData?.id,
                                });
                            }}>
                            <View
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    marginBottom: 20,
                                    // marginTop: 15,
                                    borderRadius: 50,
                                    padding: 10,
                                    alignItems: 'center',
                                    width: '57%',
                                    alignSelf: 'center',
                                    height: 50,
                                    justifyContent: 'center',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '700',
                                        color: '#250959',
                                    }}>
                                    Update Package
                                </Text>
                            </View>
                        </TouchableOpacity>
                          {trailData?.plan_type !== 0 &&
                      userData?.type === "OWNER" && (
                       <TouchableOpacity
                                onPress={() => {
                                    unSubscribe();
                                }}>
                                <View
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        marginBottom: 30,
                                        // marginTop: 15,
                                        borderRadius: 50,
                                        padding: 10,
                                        alignItems: 'center',
                                        width: '57%',
                                        alignSelf: 'center',
                                        height: 50,
                                        justifyContent: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '700',
                                            color: '#250959',
                                        }}>
                                        Cancel Subscription
                                    </Text>
                                </View>
                            </TouchableOpacity>
                      )}

                            
                   
                    </ImageBackground>

                   
                    <Pressable onPress={() => navigation.navigate('Profile')}>
                        <HStack space={3} style={styles.continer}>
                            <Image source={ProfileIcon} style={styles.pIcon} />
                            <Text bold color={'#250959'} pl={3}>
                                Profile
                            </Text>
                            <HStack flex={1} justifyContent={'flex-end'} pr={2}>
                                <Image
                                    source={require('../../assets/icon/right_2.png')}
                                    style={{width: 10, height: 15}}
                                    resizeMode="contain"
                                />
                            </HStack>
                        </HStack>
                    </Pressable>
                    <HStack style={styles.continer}>
                        <Pressable
                            style={{width: '70%'}}
                            onPress={() => {
                                navigation.navigate('Notification');
                            }}>
                            <HStack space={3} alignItems={'center'} flex={1}>
                                <Image source={Notify} style={styles.pIcon} />
                                <Text bold color={'#250959'} pl={3}>
                                    Notifications
                                </Text>
                            </HStack>
                        </Pressable>
                        <HStack flex={1} justifyContent={'flex-end'} pr={2}>
                            <Switch
                                size={Platform.OS == 'ios' ? 'sm' :'lg'}
                                offTrackColor={'#e1d0ee'}
                                offThumbColor={'#FFFFFF'}
                                onTrackColor={'#9A46DB'}
                                onThumbColor={'#FFFFFF'}
                                isChecked={allowNotification}
                                onChange={() => {
                                    handleNotificationSwitch();
                                }}
                            />
                        </HStack>
                    </HStack>

                    <Pressable onPress={() => navigation.navigate('Profile')}>
                        <HStack space={3} style={styles.continer}>
                            <Image source={Homemode} style={styles.pIcon1} />
                            <Text bold color={'#250959'} pl={1}>
                                Home Mode
                            </Text>
                            <HStack
                                flex={1}
                                justifyContent={'flex-end'}
                                alignItems={'center'}
                                pr={2}>
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '400',
                                        paddingRight: 10,
                                    }}>
                                    Compact
                                </Text>
                                <Switch
                                    size={Platform.OS == 'ios' ? 'sm' :'lg'}
                                    offTrackColor={'#e1d0ee'}
                                    offThumbColor={'#FFFFFF'}
                                    onTrackColor={'#9A46DB'}
                                    onThumbColor={'#FFFFFF'}
                                    isChecked={homeModeStatus}
                                    onChange={() => handleHomeMode()}
                                />
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '400',
                                        paddingLeft: 10,
                                    }}>
                                    Detailed
                                </Text>
                            </HStack>
                        </HStack>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                             setModalVisible(true);
                        }}>
                        <HStack space={3} style={styles.continer}>
                            <Image source={LogoutIcon} style={styles.pIcon} />
                            <Text bold color={'#250959'} pl={3}>
                                Logout
                            </Text>
                        </HStack>
                    </Pressable>
                </VStack>
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
                                    source={require('../../assets/icon/close_2.png')}
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
                                    Logout Account
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
                                    Are you sure you want to {'\n'} Logout
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
                                         logout();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#ffffff'}}>
                                        Confirm
                                    </Text>
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>

                     {errMsg.show && (
                        <Alert
                            w="90%"
                            alignSelf={'center'}
                            status={errMsg.error ? 'danger' : 'success'}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.500'}>
                                {errMsg.msg}
                            </Text>
                        </Alert>
                    )}
                <View style={{height:160}}/>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        backgroundColor: '#F2F2F2',
        minHeight: '100%',
    },
    continer: {
        backgroundColor: '#ffffff',
        padding: 10,
        height: 70,
        alignItems: 'center',
        borderRadius: 20,
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    pIcon: {
        height: 20,
        width: 20,
        resizeMode: 'stretch',
        marginLeft: 10,
    },
    pIcon1: {
        height: 20,
        width: 30,
        resizeMode: 'stretch',
        marginLeft: 10,
    },
    cardBody: {
        backgroundColor: 'rgba(245,244,249,1.0)',
        borderRadius: 10,
    },
    icon: {
        height: 30,
        width: 30,
    },
    contentContainer: {
        width: '50%',
    },
    CardFooter: {
        backgroundColor: 'rgba(125,125,125,0.1)',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    cardButtonInvite: {
        backgroundColor: 'rgba(139,183,93,0.8)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonScheduled: {
        backgroundColor: 'rgba(37, 73, 137, 0.7)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonExpired: {
        backgroundColor: 'rgba(253, 56, 24, 1)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    imageBackground: {
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
      
        // ensures corners respect the border radius
    },
    imageStyle: {
        resizeMode: 'cover', // or 'contain' if you want to fit image inside
        opacity: 0.9, // optional: make it slightly transparent
        elevation:2
    },
});

export default Settings;
