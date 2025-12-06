import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Keyboard,
    View,
    TouchableOpacity,
 
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setInspection} from '@/state/propertyDataSlice';
import {
    Text,
    Button,
    Box,
    Image,
    HStack,
    ScrollView,
    Modal,
    Spinner,
} from 'native-base';
import {apiMarkAll, apiSpecificInspection} from '@/apis/property';

import {InspectionGet, UserDataObject} from '@/services/types';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import AreaCard from './_areaCard';
import _header from '@/components/_header';
import cacheService from '@/services/CacheServices';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// icon
import Back from '@/assets/icon/btnBack.png';
import geoService from '@/services/GeolocationServices';
import { SafeAreaView } from "react-native-safe-area-context";
interface LocationType {
    latitude: number;
    longitude: number;
}
import {BlurView} from '@react-native-community/blur';
const Areas = ({navigation}: any): React.JSX.Element => {
    const inspectionData = useAppSelector(state => state.property.inspection);
    const userData: UserDataObject | any = useAppSelector(
        state => state.auth.userData,
    );
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [location, setCode] = useState<LocationType | number | null>(null);
    const [message, setMessage] = useState<string>('');
    const [loadingState, setLoadingState] = useState({
        loading: true,
        isLoading: false,
        nLoading: false,
        bLoading: false,
    });
    const [page, setPage] = useState<number>(0);
    const scrollRef: any = useRef();

    const route = useRoute();
    const insId: any = route?.params.id;
    const count = useMemo(
        () => inspectionData?.areas?.length || 0,
        [inspectionData],
    );
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    console.log('🚀 ~ Areas ~ keyboardVisible:', keyboardVisible);
    const getLocation = async () => {
        const response = await geoService.getLocation(false, 5);
        console.log('location screen: ', response);
        if (response.status) {
            return response.result;
        } else {
            setCode(response.result);
            setModalVisible2(true);
            setMessage(response.message);
            return null;
        }
    };

    const getInsDetails = useCallback(async () => {
        console.log('my test', userData);
        let checkLocation =
            userData && userData.hasOwnProperty('check_location')
                ? userData.check_location
                : 0;
        console.log({checkLocation});

        const response = await apiSpecificInspection(insId);
        console.log("response=======>123",response)
        if (response.status) {
            if (checkLocation == 1) {
                const res: any = await getLocation();
                if (!res) {
                    setLoadingState(prevState => ({
                        ...prevState,
                        loading: false,
                    }));
                    return;
                }

                const coord1 = {
                    longitude: response.result.property.longitude,
                    latitude: response.result.property.latitude,
                };
                // const dumpyCoords = {longitude: res?.longitude - 0.01, latitude: res?.latitude - 0.01};
                const distance = await geoService.getDistance(coord1, res);
                if (!distance) {
                    setModalVisible2(true);
                    setMessage('You are too far from the property.');
                }
            }

            const pageIndex = response.result.areas.findIndex(
                obj => obj.is_completed === 0,
            );
            setPage(pageIndex >= 0 ? pageIndex : 0);
            dispatch(setInspection(response.result));
            setLoadingState(prevState => ({...prevState, loading: false}));
        }
        await cacheService.makeAsyncResponse();
    }, [insId, dispatch]);

    const handleNavigation = useCallback(
        async (action: string) => {
            setLoadingState(prevState => ({
                ...prevState,
                isLoading: true,
                [action === 'next' ? 'nLoading' : 'bLoading']: true,
            }));
            setPage(prevPage => {
                const newPage =
                    action === 'next'
                        ? Math.min(prevPage + 1, count - 1)
                        : Math.max(prevPage - 1, 0);
                return newPage;
            });
            await new Promise(resolve => setTimeout(resolve, 70));
            await cacheService.makeAsyncResponse();
            setLoadingState({
                loading: false,
                isLoading: false,
                nLoading: false,
                bLoading: false,
            });

            if (scrollRef.current) {
                scrollRef.current.scrollTo(0, 0);
            }
        },
        [count],
    );

    const markAll = useCallback(async () => {
        setLoadingState(prevState => ({
            ...prevState,
            bLoading: true,
            nLoading: true,
        }));
        const response = await apiMarkAll({
            id: inspectionData?.id,
            area_id: inspectionData?.areas[page].area_id,
        });
        if (response.status) {
            selectAll();
        } else {
            setLoadingState(prevState => ({
                ...prevState,
                bLoading: false,
                nLoading: false,
            }));
        }
    }, [inspectionData, page]);

    const selectAll = useCallback(async () => {
        const updateStatus: any = {
            ...inspectionData,
            areas: inspectionData?.areas.map((area, areaIndex) => {
                if (areaIndex === page) {
                    return {
                        ...area,
                        items: area.items.map(item => ({
                            ...item,
                            status: 'SATISFACTORY',
                        })),
                    };
                } else {
                    return area;
                }
            }),
        };
        dispatch(setInspection(updateStatus));
        await cacheService.cacheUpdate('apiMarkAll', updateStatus);
        await cacheService.makeAsyncResponse();
        setModalVisible(false);
        setLoadingState(prevState => ({
            ...prevState,
            bLoading: false,
            nLoading: false,
        }));
    }, [inspectionData, page, dispatch]);

    const updateItemStatus = useCallback(
        async (s: string, i_id: number, c: string, enabled: number) => {
            if (inspectionData?.areas) {
                const updatedData: InspectionGet = {
                    ...inspectionData,
                    areas: inspectionData?.areas.map((area, areaIndex) => {
                        if (areaIndex === page) {
                            return {
                                ...area,
                                items: area.items.map(item => {
                                    if (item.item_id === i_id) {
                                        return {
                                            ...item,
                                            status: s,
                                            comments: c,
                                            is_enable: enabled,
                                        };
                                    } else {
                                        return item;
                                    }
                                }),
                            };
                        } else {
                            return area;
                        }
                    }),
                };
                dispatch(setInspection(updatedData));
                await cacheService.cacheUpdate('apiUpdateStatus', updatedData);
                await cacheService.makeAsyncResponse();
            }
        },
        [inspectionData, page, dispatch],
    );

    useEffect(() => {
        getInsDetails();
    }, []);
    useEffect(() => {}, [location]);
    const handleTitle = (): any => {
        return (
            inspectionData?.areas[page].sub_title ||
            inspectionData?.areas[page].title
        );
    };

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () =>
            setKeyboardVisible(true),
        );
        const hideSub = Keyboard.addListener('keyboardDidHide', () =>
            setKeyboardVisible(false),
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return (
        <SafeAreaView style={{flex:1}}>
        <View style={styles.mainContainer}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    marginTop: Platform.OS === 'ios' ? 36 : 10,
                }}>
                <TouchableOpacity
                    style={styles.backIcon}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Image
                        alt="back"
                        source={require('../../../assets/icon/back.png')}
                        resizeMode="contain"
                        style={{width: 14, height: 14}}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                   {inspectionData?.areas[page]?.title}
                </Text>
                <View style={{width: '40'}}></View>
            </View>
            <>
                <Modal
                    isOpen={modalVisible}
                    onClose={() => setModalVisible(false)}
                    justifyContent="center"
                    size="lg">

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
                                    Are you sure?
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
                                     Do you want to mark all as Satisfactory?
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
                                    <Text style={{color: '#9A46DB'}}>No</Text>
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
                                        markAll();
                                    setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#ffffff'}}>
                                        Yes
                                    </Text>
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    {/* <Modal.Content>
                        <Modal.CloseButton />
                        <Modal.Header>Are you sure?</Modal.Header>
                        <Modal.Body>
                            <Text>
                                Do you want to mark all as Satisfactory?
                            </Text>
                        </Modal.Body>
                        <Modal.Footer justifyContent={'space-around'}>
                            <Button
                                style={{
                                    ...styles.modalButton,
                                    backgroundColor: 'rgba(225,20,40,0.9)',
                                }}
                                onPress={() => setModalVisible(false)}>
                                No
                            </Button>
                            <Button
                                style={styles.modalButton}
                                onPress={() => {
                                    markAll();
                                    setModalVisible(false);
                                }}>
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal.Content> */}
                </Modal>
                <Modal
                    isOpen={modalVisible2}
                    onClose={() => {
                        setModalVisible2(false);
                        navigation.goBack(null);
                    }}
                    justifyContent="center"
                    size="lg">
                    <Modal.Content>
                        <Modal.CloseButton />
                        <Modal.Header>Location Service</Modal.Header>
                        <Modal.Body>
                            <Text>
                                {location == 2
                                    ? 'Please Turn on Your GPS'
                                    : message}
                            </Text>
                        </Modal.Body>
                        <Modal.Footer justifyContent={'space-around'}>
                            <Button
                                px={8}
                                py={2}
                                style={{
                                    backgroundColor: 'rgba(253, 56, 24, 1)',
                                }}
                                onPress={() => {
                                    setModalVisible2(false);
                                    navigation.goBack(null);
                                }}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={Platform.OS === 'ios'}
                    keyboardShouldPersistTaps="handled"
                    extraScrollHeight={100}
                    extraHeight={20}
                    style={{
                        height: '65%',
                    }}
                    innerRef={ref => {
                        scrollRef.current = ref;
                    }}>
                    <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={{alignItems: 'center', marginBottom: 10,width:'100%',borderWidth:1,borderColor:'#E5DCED',height:50,borderRadius:16,backgroundColor:'#F2F2F2',justifyContent:'center',alignContent:'center'}}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text
                                bold
                                fontSize={12}
                                textAlign={'center'}
                                color={'#9A46DB'}>
                                Mark all as Satisfactory
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                    {loadingState.loading ? (
                        <Spinner color={'my.h3'} />
                    ) : inspectionData?.areas &&
                      inspectionData?.areas[page].items?.length > 0 ? (
                        inspectionData?.areas[page].items.map((item, i) => (
                            <AreaCard
                                key={i}
                                Data={item}
                                inspectionId={inspectionData?.id}
                                page={page}
                                onItemUpdate={updateItemStatus}
                                isRenterUser={false}
                            />
                        ))
                    ) : (
                        <Text
                            mx={'auto'}
                            bold
                            mt={2}
                            fontSize={'lg'}
                            color={'my.td'}>
                            No Items
                        </Text>
                    )}

                    {keyboardVisible && (
                        <HStack
                            style={styles.footer}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            w={'full'}
                            mt={3}>
                            {/* <HStack
                                justifyContent={'center'}
                                alignItems={'center'}
                                flex={1}>
                                <Text
                                    ml={2}
                                    color={'my.td'}
                                    bold
                                    fontSize={'lg'}>{`${
                                    page + 1
                                }/${count}`}</Text>
                            </HStack> */}
                            <Box style={{flexDirection: 'row'}}>
                                {page > 0 && (
                                    <Button
                                        isLoading={
                                            loadingState.bLoading &&
                                            loadingState.nLoading
                                                ? false
                                                : loadingState.bLoading
                                        }
                                        isDisabled={loadingState.nLoading}
                                          style={{
                                        backgroundColor: '#9A46DB',
                                        width:'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                        mr={2}
                                        onPress={() => {
                                            handleNavigation('prev');
                                        }}>
                                        Back
                                    </Button>
                                )}
                                {page >= count - 1 ? (
                                    <Button
                                           style={{
                                        backgroundColor: '#9A46DB',
                                        width:'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                        onPress={() =>
                                            navigation.navigate(
                                                'Agreement',
                                                insId,
                                            )
                                        }>
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        isLoading={
                                            loadingState.nLoading &&
                                            loadingState.bLoading
                                                ? false
                                                : loadingState.nLoading
                                        }
                                        isDisabled={loadingState.bLoading}
                                          style={{
                                        backgroundColor: '#9A46DB',
                                        width:'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                        onPress={() => {
                                            handleNavigation('next');
                                        }}>
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </HStack>
                    )}
                </KeyboardAwareScrollView>
                {!keyboardVisible && (
                    <HStack
                        style={styles.footer}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        w={'full'}
                        mt={2}
                        >
                        {/* <HStack
                            justifyContent={'center'}
                            alignItems={'center'}
                            flex={1}>
                            <Text
                                ml={2}
                                color={'my.td'}
                                bold
                                fontSize={'lg'}>{`${page + 1}/${count}`}</Text>
                        </HStack> */}
                        <Box style={{flexDirection: 'row',justifyContent: page > 0 ? 'space-between':'center',width:'100%',paddingBottom: Platform.OS == "ios" ? 20 :40 }}>
                            {page > 0 && (
                                <Button
                                    isLoading={
                                        loadingState.bLoading &&
                                        loadingState.nLoading
                                            ? false
                                            : loadingState.bLoading
                                    }
                                    isDisabled={loadingState.nLoading}
                                     style={{
                                        backgroundColor: '#9A46DB',
                                        width:'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                    mr={2}
                                    onPress={() => {
                                        handleNavigation('prev');
                                    }}>
                                    Back
                                </Button>
                            )}
                            {page >= count - 1 ? (
                                <Button
                                    style={{
                                        backgroundColor: '#9A46DB',
                                        width:'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                    onPress={() =>
                                        navigation.navigate('Agreement', insId)
                                    }>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    isLoading={
                                        loadingState.nLoading &&
                                        loadingState.bLoading
                                            ? false
                                            : loadingState.nLoading
                                    }
                                    isDisabled={loadingState.bLoading}
                                    style={{
                                        backgroundColor: '#9A46DB',
                                        width:page > 0 ? '45%':'45%',
                                        alignSelf:'center',
                                        height:60,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        borderRadius:50,
                                    }}
                                    onPress={() => {
                                        handleNavigation('next');
                                    }}>
                                    Next
                                </Button>
                            )}
                        </Box>
                    </HStack>
                )}
            </>
        </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        // padding: 20,
        backgroundColor: '#F2F2F2',
        minHeight: '100%',
        marginHorizontal:20
    },
    backIcon: {
        height: 50,
        width: 50,
        // marginTop: 20,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        elevation: 3,
    },
    footer: {
        backgroundColor: 'transparent',
    },
    dot: {
        width: 7,
        height: 7,
        backgroundColor: 'rgba(217,217,217,1.0)',
        borderRadius: 50,
        marginLeft: 5,
    },
    active: {
        width: 10,
        height: 10,
        backgroundColor: 'rgba(10,113,189,0.9)',
        borderRadius: 50,
        marginLeft: 5,
    },
    modalOptions: {
        flex: 1,
        padding: 5,
        borderRadius: 10,
        height: 40,
    },
    modalButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: 80,
    },
});

export default React.memo(Areas);
