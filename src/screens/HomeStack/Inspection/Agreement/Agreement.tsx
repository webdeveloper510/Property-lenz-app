import React, {useState, useRef} from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setInspectorSign, setTenantSign} from '@/state/propertyDataSlice';
import {apiCompleteInspection} from '@/apis/property';
import {
    Text,
    Input,
    Button,
    Box,
    Image,
    Alert,
    HStack,
    VStack,
    Spinner,
} from 'native-base';
import {warningTimer} from '@/constant/customHooks';
import BackButton from '@/components/BackButton';
// icon
import BackIcon from '@/assets/icon/btnBack.png';
import cacheService from '@/services/CacheServices';
import {maxHeight} from 'styled-system';
import SignatureCapture from 'react-native-signature-capture';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import {apiRenterSign, apiInspectorSign} from '@/apis/property';
import CommanButton from '@/components/CommanButton';

const {height: windowHeight} = Dimensions.get('window');
interface Canvas {
    encoded: string;
    pathName: string;
}
const Agreement = ({navigation}: any): React.JSX.Element => {
    const [optionalComment, setOptionalComment] = useState<string>('');
    const userData = useAppSelector(state => {
        return state.auth.userData;
    });
    console.log("🚀 ~ Agreement ~ userData:", userData)
    const tenantSign = useAppSelector(state => state.property.tenantSign);
    const inspectorSign = useAppSelector(state => state.property.inspectorSign);
    const inspectionData = useAppSelector(state => state.property.inspection);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const canvasRef: any = useRef();
    const canvasRef1: any = useRef();
    let imgData: any = null;
    const dispatch = useAppDispatch();
    console.log(
        '🚀 ~ Agreement ~ inspectionData:###############',
        inspectionData,
    );

    const route = useRoute();
    const insId: any = route.params;

    const submit = async () => {
        dispatch(showLoader())
        const data = {
            inspection_id: insId,
            final_comments: optionalComment,
            optional_comments: optionalComment.trim(),
        };
        const response = await apiCompleteInspection(data);
        console.log("🚀 ~ submit ~ response:", response)
        if (response.status) {
            dispatch(hideLoader())
            setErrMsg({
                msg: 'Successfully Submitted',
                error: false,
                show: true,
            });
            await cacheService.makeAsyncResponse();
            await cacheService.cacheUpdate('apiCompleteInspection', data);
            navigation.navigate('Details', inspectionData?.property_id);
            cleanup();
        } else {
            setErrMsg({msg: response.message, error: true, show: true});
            const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
            dispatch(hideLoader())
        }
    };

    const cleanup = () => {
        if (tenantSign) {
            dispatch(setTenantSign(null));
        }
        if (inspectorSign) {
            dispatch(setInspectorSign(null));
        }
    };
    const warnStatusHandler = async () => {
        if (
            inspectionData?.activity != 'INTERMITTENT_INSPECTION' &&
            inspectionData?.activity != 'MANAGER_INSPECTION' &&
            tenantSign === null
        ) {
            setErrMsg({
                msg: 'Please Provide Renter Sign',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
        } else {
            submit();
        }
    };
    // useEffect(() => { }, []);

    // Awaiting user/inspector signature
    const showInspector = inspectionData?.is_renter_self_led === 0;

    // Awaiting renter signature
    const showRenter =
        (inspectionData?.is_renter_present === 1 &&
            inspectionData?.is_renter_self_led === 0) ||
        inspectionData?.is_renter_self_led === 1;

    const save = async (data: Canvas) => {
        try {
            dispatch(showLoader());
            const res = await fetch(
                Platform.OS === 'ios'
                    ? data.pathName
                    : `file://${data.pathName}`,
            );
            const image = await res.blob();
            const File = {
                name: 'img.jpg',
                type: image.type,
                size: image.size,
                uri:
                    Platform.OS === 'ios'
                        ? data.pathName
                        : `file://${data.pathName}`,
            };

            let dataToSend = {
                id: inspectionData?.id,
                tenant_sign: File.uri,
            };
            const response = await apiRenterSign({
                id: inspectionData?.id,
                tenant_sign: File,
            });
            console.log('res: ', response);

            if (response.status) {
                dispatch(hideLoader());
                dispatch(
                    setTenantSign({path: data.pathName, data: data.encoded}),
                );
                await cacheService.cacheUpdate('apiRenterSign', dataToSend);
            } else {
                  dispatch(hideLoader());
                setErrMsg({msg: response.message, error: false, show: false});
            }
        } catch (e) {
            dispatch(hideLoader());
            console.log('Error in save image', e);
            setErrMsg({
                msg: 'Unable to save sign, Please try again!',
                error: false,
                show: false,
            });
        }
    };

    const inspectorSignData = async (data: Canvas) => {
        try {
            dispatch(showLoader());
            await warningTimer(2);
            const res = await fetch(
                Platform.OS === 'ios'
                    ? data.pathName
                    : `file://${data.pathName}`,
            );
            const image = await res.blob();
            const File = {
                name: 'img.jpg',
                type: image.type,
                size: image.size,
                uri:
                    Platform.OS === 'ios'
                        ? data.pathName
                        : `file://${data.pathName}`,
            };

            let dataToSend = {
                id: insId,
                inspector_sign: File.uri,
            };
            const response = await apiInspectorSign({
                id: insId,
                inspector_sign: File,
            });
            console.log('res: ', response);

            if (response.status) {
                dispatch(hideLoader());
                dispatch(
                    setInspectorSign({path: data.pathName, data: data.encoded}),
                );
                await cacheService.cacheUpdate('apiInspectorSign', dataToSend);
            } else {
                setErrMsg({msg: response.message, error: false, show: false});
            }
        } catch (e) {
            dispatch(hideLoader());
            console.log('Error in save image', e);
            setErrMsg({
                msg: 'Unable to save sign, Please try again!',
                error: false,
                show: false,
            });
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F2F2F2'}}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
                    marginHorizontal: 15,
                    // backgroundColor:'red'
                }}>
                <TouchableOpacity
                    style={{
                        height: 50,
                        width: 50,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50,
                        elevation: 3,
                    }}
                    onPress={() => {
                        navigation.goBack(null);
                        cleanup();
                    }}>
                    <Image
                        alt="back"
                        source={require('@/assets/icon/back.png')}
                        resizeMode="contain"
                        style={{width: 14, height: 14}}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        paddingRight: 12,
                        // paddingTop: 20,
                    }}>
                    Agreement
                </Text>
                <View style={{width: 40}}></View>
            </View>
            <ScrollView style={{flex: 1}}>
                <View style={styles.mainContainer}>
                    <VStack space={6} mt={3}>
                        {/* <Input style={styles.input} value={comment} onChangeText={setComment} placeholder={'comment...'} /> */}

                        <TouchableOpacity
                            style={styles.container}
                            onPress={() =>
                                navigation.navigate('Review', insId)
                            }>
                            {/* LEFT CONTENT */}
                            <View style={styles.leftRow}>
                                <Image
                                    source={require('../../../../assets/icon/review_2.png')} // your left icon
                                    style={styles.leftIcon}
                                />
                                <Text style={styles.label}>Review</Text>
                            </View>

                            {/* RIGHT ARROW */}
                            <View style={styles.arrowContainer}>
                                <Image
                                    source={require('../../../../assets/icon/right_2.png')}
                                    style={styles.arrowIcon}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* {showInspector && (
                            <TouchableOpacity
                                style={styles.container}
                                onPress={() =>
                                    navigation.navigate('InspectorSign', insId)
                                }>
                                {inspectorSign === null ? (
                                    <>
                                        <View style={styles.leftRow}>
                                            <Image
                                                source={require('../../../../assets/icon/sign.png')} // your left icon
                                                style={styles.leftIcon}
                                            />
                                            <Text style={styles.label}>
                                                Inspector Sign
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.arrowContainer}
                                            onPress={() =>
                                                navigation.navigate(
                                                    'InspectorSign',
                                                    insId,
                                                )
                                            }>
                                            <Image
                                                source={require('../../../../assets/icon/right_2.png')}
                                                style={styles.arrowIcon}
                                            />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Image
                                        source={{
                                            uri: `data:image/png;base64,${inspectorSign?.data}`,
                                        }}
                                        style={{resizeMode: 'stretch'}}
                                        mx={'auto'}
                                        alt="Renter Sign"
                                        size="sm"
                                    />
                                )}
                            </TouchableOpacity>
                        )} */}
{/* 
                        {showRenter && (
                            <TouchableOpacity
                                style={styles.container}
                                onPress={() =>
                                    navigation.navigate('TenantSign', insId)
                                }>
                                {tenantSign === null ? (
                                    <>
                                        <View style={styles.leftRow}>
                                            <Image
                                                source={require('../../../../assets/icon/sign.png')} // your left icon
                                                style={styles.leftIcon}
                                            />
                                            <Text style={styles.label}>
                                                Renter Sign
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.arrowContainer}
                                            onPress={() =>
                                                navigation.navigate(
                                                    'TenantSign',
                                                    insId,
                                                )
                                            }>
                                            <Image
                                                source={require('../../../../assets/icon/right_2.png')}
                                                style={styles.arrowIcon}
                                            />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Image
                                        source={{
                                            uri: `data:image/png;base64,${tenantSign?.data}`,
                                        }}
                                        style={{resizeMode: 'stretch'}}
                                        mx={'auto'}
                                        alt="Renter Sign"
                                        size="sm"
                                    />
                                )}
                            </TouchableOpacity>
                        )} */}

                        <View
                            style={{
                                width: '100%',
                                borderWidth: 1,
                                borderColor: '#BF56FF',
                                borderRadius: 20,
                                padding: 15,
                                marginTop: 25,
                            }}>
                            <View style={{flexDirection: 'row'}}>
                                <Image
                                    source={require('../../../../assets/icon/sign.png')} // your left icon
                                    style={styles.leftIcon}
                                />
                                <Text style={styles.label}>Signatures</Text>
                            </View>

                            {showRenter && (
                                <View
                                    style={{
                                        width: '100%',
                                        alignSelf: 'center',
                                        backgroundColor: '#EAE7ED',
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#EAE7ED',
                                        padding: 15,
                                        marginVertical: 10,
                                    }}>
                                    <VStack space={3} mt={3}>
                                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                        <Text
                                            bold
                                            fontSize={13}
                                            color={'#9A46DB'}>
                                            Renter Signature
                                        </Text>
                                        <View style={{flexDirection:'row'}}>
                                        <TouchableOpacity
                                        onPress={()=>{
                                              dispatch(setTenantSign(null));
                                                if (
                                                    canvasRef &&
                                                    canvasRef.current
                                                ) {
                                                    canvasRef.current.resetImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                        }}
                                        >
                                            <Image
                                            source={require('../../../../assets/icon/reset_2.png')}
                                            style={{width:44,height:27}}
                                            />
                                        </TouchableOpacity>
                                        <View style={{width:12}}/>
                                           <TouchableOpacity
                                           onPress={()=>{
                                               if (
                                                    canvasRef &&
                                                    canvasRef.current
                                                ) {
                                                    canvasRef.current.saveImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                           }}
                                           >
                                            <Image
                                            source={require('../../../../assets/icon/save_2.png')}
                                            style={{width:44,height:27}}
                                            />
                                        </TouchableOpacity>
                                        </View>
                                        </View>
                                        <Text
                                            bold
                                            fontSize={13}
                                            color={'#250959'}>
                                            Name: {inspectionData?.tenant[0]?.tenant_first_name}
                                        </Text>
                                        <View
                                            style={{
                                                width: '100%',
                                                height: 200,
                                                backgroundColor: '#ffffff',
                                                borderRadius: 10,
                                            }}>
                                            <Text
                                                style={{
                                                    color: '#250959',
                                                    fontSize: 10,
                                                    fontWeight: '700',
                                                    padding: 15,
                                                }}>
                                                Signature:
                                            </Text>

                                            {tenantSign === null ? (
                                                <SignatureCapture
                                                    style={{
                                                        flex: 0.9,
                                                        width: '100%',
                                                    }}
                                                    onSaveEvent={(
                                                        data: Canvas,
                                                    ) => {
                                                        imgData == null
                                                            ? save(data)
                                                            : null;
                                                    }}
                                                    // backgroundColor="#dbeaff"
                                                    ref={canvasRef}
                                                    strokeColor="#000000"
                                                    minStrokeWidth={4}
                                                    maxStrokeWidth={4}
                                                    showTitleLabel={false}
                                                    showBorder={false}
                                                    showNativeButtons={false}
                                                    rotateClockwise={false}
                                                    viewMode={'portrait'}
                                                    saveImageFileInExtStorage={
                                                        true
                                                    }
                                                />
                                            ) : (
                                                <Image
                                                    source={{
                                                        uri: `data:image/png;base64,${tenantSign?.data}`,
                                                    }}
                                                    mx={'auto'}
                                                    alt="Tenant Sign"
                                                    style={{
                                                        width: 160,
                                                        resizeMode: 'contain',
                                                        height: 160,
                                                    }}
                                                />
                                            )}
                                        </View>
                                    </VStack>
                                    {/* <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                color: '#250959',
                                                fontWeight: '400',
                                            }}>
                                            Signed on: October 12, 2025 at 4:45
                                            pm
                                        </Text>
                                    </View> */}
                                    {/* <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <CommanButton
                                            label={'Save'}
                                            width={'45%'}
                                            height={55}
                                            onCkick={() => {
                                                if (
                                                    canvasRef &&
                                                    canvasRef.current
                                                ) {
                                                    canvasRef.current.saveImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                            }}
                                        />
                                        <CommanButton
                                            label={'Reset'}
                                            width={'45%'}
                                            height={55}
                                            onCkick={() => {
                                              dispatch(setTenantSign(null));
                                                if (
                                                    canvasRef &&
                                                    canvasRef.current
                                                ) {
                                                    canvasRef.current.resetImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                            }}
                                        />
                                    </View> */}
                                </View>
                            )}

                            {showInspector && (
                                <View
                                    style={{
                                        width: '100%',
                                        alignSelf: 'center',
                                        backgroundColor: '#EAE7ED',
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#EAE7ED',
                                        padding: 15,
                                        marginVertical: 10,
                                    }}>
                                    <VStack space={3} mt={3}>
                                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                        <Text
                                            bold
                                            fontSize={13}
                                            color={'#9A46DB'}>
                                            Inspector Signature
                                        </Text>
                                         <View style={{flexDirection:'row'}}>
                                        <TouchableOpacity
                                        onPress={()=>{
                                                 dispatch(setInspectorSign(null));
                                                if (
                                                    canvasRef1 &&
                                                    canvasRef1.current
                                                ) {
                                                    canvasRef1.current.resetImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                        }}
                                        >
                                            <Image
                                            source={require('../../../../assets/icon/reset_2.png')}
                                            style={{width:44,height:27}}
                                            />
                                        </TouchableOpacity>
                                        <View style={{width:12}}/>
                                           <TouchableOpacity
                                            onPress={()=>{
                                                  if (
                                                    canvasRef1 &&
                                                    canvasRef1.current
                                                ) {
                                                    canvasRef1.current.saveImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                            }}
                                           >
                                            <Image
                                            source={require('../../../../assets/icon/save_2.png')}
                                            style={{width:44,height:27}}
                                            />
                                        </TouchableOpacity>
                                        </View>
                                        </View>
                                        <Text
                                            bold
                                            fontSize={13}
                                            color={'#250959'}>
                                            Name: {inspectionData?.inspected_by}
                                        </Text>
                                        <View
                                            style={{
                                                width: '100%',
                                                height: 200,
                                                backgroundColor: '#ffffff',
                                                borderRadius: 10,
                                            }}>
                                            <Text
                                                style={{
                                                    color: '#250959',
                                                    fontSize: 10,
                                                    fontWeight: '700',
                                                    padding: 15,
                                                }}>
                                                Signature:
                                            </Text>
                                            {inspectorSign === null ? (
                                                <SignatureCapture
                                                    style={{
                                                        flex: 0.9,
                                                        width: '100%',
                                                    }}
                                                    onSaveEvent={(
                                                        data: Canvas,
                                                    ) => {
                                                        imgData == null
                                                            ? inspectorSignData(
                                                                  data,
                                                              )
                                                            : null;
                                                    }}
                                                    // backgroundColor="#dbeaff"
                                                    ref={canvasRef1}
                                                    strokeColor="#000000"
                                                    minStrokeWidth={4}
                                                    maxStrokeWidth={4}
                                                    showTitleLabel={false}
                                                    showBorder={false}
                                                    showNativeButtons={false}
                                                    rotateClockwise={false}
                                                    viewMode={'portrait'}
                                                    saveImageFileInExtStorage={
                                                        true
                                                    }
                                                />
                                            ) : (
                                                <Image
                                                    source={{
                                                        uri: `data:image/png;base64,${inspectorSign?.data}`,
                                                    }}
                                                    mx={'auto'}
                                                    alt="Tenant Sign"
                                                    style={{
                                                        width: 160,
                                                        resizeMode: 'contain',
                                                        height: 160,
                                                    }}
                                                />
                                            )}
                                        </View>
                                    </VStack>
                                    {/* <Text
                                        style={{
                                            fontSize: 10,
                                            color: '#250959',
                                            fontWeight: '400',
                                        }}>
                                        Signed on: October 12, 2025 at 4:45 pm
                                    </Text> */}
                                    {/* <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <CommanButton
                                            label={'Save'}
                                            width={'45%'}
                                            height={55}
                                            onCkick={() => {
                                                if (
                                                    canvasRef1 &&
                                                    canvasRef1.current
                                                ) {
                                                    canvasRef1.current.saveImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                            }}
                                        />
                                        <CommanButton
                                            label={'Reset'}
                                            width={'45%'}
                                            height={55}
                                            onCkick={() => {
                                                    dispatch(setInspectorSign(null));
                                                if (
                                                    canvasRef &&
                                                    canvasRef.current
                                                ) {
                                                    canvasRef.current.resetImage();
                                                } else {
                                                    console.log(
                                                        'canvasRef is null',
                                                    );
                                                }
                                            }}
                                        />
                                    </View> */}
                                </View>
                            )}
                        </View>
                        <View style={styles.container21}>
                            <Text style={styles.label21}>
                                Additional Comments (Optional)
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Type here..."
                                placeholderTextColor="#C7C3D1"
                                multiline
                                value={optionalComment}
                                onChangeText={setOptionalComment}
                                textAlignVertical="top"
                            />
                        </View>
                        {/* <Input
                        style={styles.input}
                        value={optionalComment}
                        onChangeText={setOptionalComment}
                        placeholder={'Additional comment(Optional)'}
                    /> */}
                    </VStack>
                    {errMsg.show && (
                        <View
                            style={{
                                width: '90%',
                                alignSelf: 'center',
                                height: 60,
                            }}>
                            <Alert
                                w="100%"
                                status={errMsg.error ? 'danger' : 'success'}
                                my={'auto'}>
                                <Text
                                    fontSize="md"
                                    color={
                                        errMsg.error ? 'red.500' : 'green.500'
                                    }>
                                    {errMsg.msg}
                                </Text>
                            </Alert>
                        </View>
                    )}

                    <View style={{height: windowHeight * 0.2}} />
                    <Pressable
                        onPress={() => {
                            // isLoading ? null : warnStatusHandler();
                            submit();
                        }}>
                        <HStack
                            alignItems={'center'}
                            justifyContent={'center'}
                            style={
                                isLoading
                                    ? {
                                          ...styles.footerBtn,
                                          backgroundColor:
                                              'rgba(265, 265,265,0.7)',
                                      }
                                    : styles.footerBtn
                            }
                            mt={5}
                            mx={'auto'}>
                            <Text bold fontSize={'lg'} color={'#ffffff'}>
                                Submit
                            </Text>
                        </HStack>
                    </Pressable>
                </View>
                {/* <View style={{height:windowHeight * 0.1}}/> */}
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        backgroundColor: '#F2F2F2',
        // height: '100%',
        // flex: 1,
        // width: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    preview: {
        height: 114,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        flex: 1,
    },
    previewImage: {
        width: 335,
        height: 114,
        resizeMode: 'contain',
    },
    signature: {
        flex: 1,
        borderColor: '#000033',
        borderWidth: 1,
    },
    input: {
        backgroundColor: '#fff',
        paddingLeft: 20,
        height: 45,
    },
    button: {
        height: 45,
        width: '60%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 113, 188,0.9)',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F2F2F2',
        // height: 100,
        marginLeft: -20,
        marginRight: -20,
    },

    footerBtn: {
        backgroundColor: '#9A46DB',
        width: '70%',
        height: 60,
        borderRadius: 50,
    },
    container: {
        width: '95%',
        height: 100,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#BF56FF',
        backgroundColor: '#fff',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        // marginVertical: 10,
    },

    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    leftIcon: {
        width: 26,
        height: 26,
        tintColor: '#A259FF',
        marginRight: 10,
        resizeMode: 'contain',
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9A47DB',
    },

    arrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#F3E7FD',
        justifyContent: 'center',
        alignItems: 'center',
    },

    arrowIcon: {
        width: 14,
        height: 14,
        tintColor: '#250959',
        resizeMode: 'contain',
    },
    container21: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#BF56FF',
    },
    label21: {
        fontSize: 12,
        color: '#43216D',
        fontWeight: '600',
        marginBottom: 5,
    },
    input21: {
        fontSize: 15,
        padding: 0,
        minHeight: 100,
        color: '#43345D',
    },
});

export default Agreement;
