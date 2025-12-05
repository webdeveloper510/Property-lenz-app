import React, {useEffect, useState} from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Linking,
    View,
    TouchableOpacity,
    ActionSheetIOS,
    ActivityIndicator,
} from 'react-native';
import {
    Box,
    Image,
    VStack,
    Avatar,
    Badge,
    Text,
    Spinner,
    Modal,
    Button,
} from 'native-base';
import Camera from '@/assets/icon/edit_2.png';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {apiGetProfile, apiUpdateProfile} from '@/apis/auth';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {setUserData} from '@/state/authSlice';
import LinearGradient from 'react-native-linear-gradient';
// https://www.npmjs.com/package/react-native-permissions
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import FastImage from 'react-native-fast-image'
const _dp = ({}: any): React.JSX.Element => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userData: any = useAppSelector(state => {
        return state.auth.userData;
    });
    const profileData: any = useAppSelector(state => state.auth.profileData);

    const dispatch = useAppDispatch();
    const [myDp, setMyDp] = useState<string | null>(
        userData?.dp ? userData?.dp : null,
    );
    const firstName = userData?.first_name || '';
    const initials = firstName.charAt(0).toUpperCase();
    const getProfile = async () => {
        try{
         setLoading(true);
        const response = await apiGetProfile({});
        console.log('🚀 ~ getProfile ~ response:', response);
        if (response.status) {
            dispatch(setUserData({...userData, dp: response.result.dp}));
            setMyDp(response.result.dp);
        }
        setLoading(false);
        }catch(error){
        console.log("🚀 ~ getProfile ~ error:", error)
         setLoading(false);
        }
      
    };
    const updateProfile = async (blob: any) => {
        try{
        setIsLoading(true)

   let profilePic = {
            first_name: userData.first_name,
            last_name: userData.last_name || '',
            dp: {
                name: 'img.jpg',
                type: blob.assets[0].type,
                size: blob.assets[0].fileSize,
                uri:
                    Platform.OS === 'ios'
                        ? blob.assets[0].uri.replace('file://', '')
                        : blob.assets[0].uri,
            },
        };
        console.log("#############@@@@@@@@@@======>",profilePic)
        const response = await apiUpdateProfile(profilePic);
        if (response.status) {
            console.log('🚀 ~ updateProfile ~ response:', response);
            getProfile();
            setIsLoading(false)
        }
        }catch(error){
        console.log("🚀 ~ updateProfile ~ error:", error)
       setIsLoading(false)
        }
    

     
    };

    const handleDocumentSelection = async () => {
        let options: any = {
            selectionLimit: 1,
            type: 'photo',
        };
        try {
            const result: any = await launchImageLibrary(options, () => {});
            // setMyDp(null);
            updateProfile(result);
        } catch (err) {}
    };
    const cameraPermission = async () => {
        const permissionType = Platform.select({
            ios: PERMISSIONS.IOS.CAMERA,
            android: PERMISSIONS.ANDROID.CAMERA,
        });
        const res = await check(permissionType!);
        if (res === RESULTS.DENIED) {
            const requestResult = await request(permissionType!);
            if (requestResult === RESULTS.BLOCKED) {
                await Linking.openSettings();
            } else {
                handelCamera();
            }
        } else {
            handelCamera();
        }
    };
    const handelCamera = async () => {
        let options: any = {
            cameraType: 'back',
            saveToPhotos: false,
        };
        const result: any = await launchCamera(options, () => {});
        if (result?.didCancel == true) {
            return;
        } else {
            setMyDp(null);
            updateProfile(result);
        }
    };
  

    return (
        <>
            <Modal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                justifyContent="center"
                size="lg">
                <Modal.Content borderRadius={20} backgroundColor="#ffffff">
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
                                width: 20,
                                height: 20,
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
                            Photo From
                        </Text>
                    </Modal.Header>
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
                                handleDocumentSelection();
                                setModalVisible(false);
                            }}>
                            <Text style={{color: '#9A46DB'}}>Gallery</Text>
                        </Button>
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
                                cameraPermission();
                                setModalVisible(false);
                            }}>
                            <Text style={{color: '#9A46DB'}}>Camera</Text>
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
            <View>
                {/* <LinearGradient
        colors={['#C38CFF', '#A78BFA', '#9E77FF']}
        start={{x: 0.1, y: 0}}
        end={{x: 0.2, y: 1}}
        style={styles.glowBg}
      /> */}

                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 130,
                        height: 130,
                        backgroundColor: '#E0D3F5',
                        borderRadius: 20,
                        marginBottom: 20,
                        overflow:'hidden'
                    }}>
                    {isLoading ? (
                        <ActivityIndicator  size={"large"} color={"#9A46DB"}/>
                    ) : (
                        <FastImage
                            source={
                                myDp
                                    ? { uri: `${myDp}?t=${Date.now()}`}
                                    : require('@/assets/icon/image_4.png')
                            }
                            style={styles.img}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                    )}

                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            backgroundColor: '#ffffff',
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            bottom: 6,
                            right: 6,
                            elevation: 5,
                        }}
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}>
                        <Image
                            source={Camera}
                            alt="Back"
                            style={{
                                height: 16,
                                width: 12,
                                resizeMode: 'contain',
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        minHeight: '100%',
    },
    backIcon: {
        height: 50,
        width: 50,
    },
    badge: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },
    modalButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: 80,
    },
    img: {
        width: 200,
        height: 140,
        borderRadius: 20,
        // borderRadius: 500,
        // marginBottom: 20,
    },
    glowBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 30,
        opacity: 0.4, // Creates soft glow
    },
});
export default React.memo(_dp);
