import React, {useEffect, useState} from 'react';
import {
    Linking,
    Platform,
    StyleSheet,
    View,
    TouchableOpacity,
    ImageBackground,
    FlatList,
    SafeAreaView,
    Image,
    Dimensions,
} from 'react-native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
    Text,
    Box,
    HStack,
    VStack,
    ScrollView,
    Button,
    Checkbox,
    Modal,
} from 'native-base';
import {useAppSelector, useAppDispatch} from '../../state/hooks';
import {
    apiGetSpecificProperty,
    apiInspectionList,
    apiInspectionlistById,
    apiGetInspectionStatus
} from '../../apis/property';
import {propertyGet, InspectionGet,} from '../../services/types';
import SideBar from '@/components/SideBar';
import CommonInspectionCard from '@/components/CommonInspectionCard';
import {handleBedroomAndBathroomCount} from '@/constant/customHooks';
import {HomeProps} from '@/constant/SideBarRoutes';
import _header from '@/components/_header';
import _actionCard from '@/components/HomeCard/_actionCard';
import {setSideBar} from '../../state/propertyDataSlice';
import cacheService from '@/services/CacheServices';
import LinearGradient from 'react-native-linear-gradient';

// icon

import Inspect from '@/assets/icon/property.png';
import Camera from '@/assets/icon/CameraNew.png';
import Tnt from '@/assets/icon/renter-icon.png';
import User from '@/assets/icon/user.png';
import moveIn from '@/assets/icon/moveIn.png';
import moveOut from '@/assets/icon/moveOut.png';
import Calendar from '@/assets/icon/calendarnew.png';
import hourGlass from '@/assets/icon/hourglass.png';
import Edit from '@/assets/icon/edit-text.png';
import Delete from '@/assets/icon/bin.png';
const screenHeight = Dimensions.get('window').height;
interface Tenant {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Property {
    id: number;
    type: string;
    name: string;
    longitude: number;
    location: string;
    latitude: number;
}

interface DataState {
    upcoming: InspectionItem[];
    overdue: InspectionItem[];
    recent: InspectionItem[];
    inProcess: InspectionItem[];
}

interface InspectionItem {
    id: number;
    activity: string;
    inspection_date: string;
    inspection_type: string;
    status: string;
    property: {
        id: number;
        name: string;
    };
    tenants: {
        id: number;
        first_name: string;
        last_name: string;
    }[];
}

const Details = ({navigation}: any): React.JSX.Element => {
    const userData = useAppSelector(state => state.auth.userData);
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const dispatch = useAppDispatch();
    const [propertyData, setPropertyData] = useState<propertyGet | any>(null);
    const [progress, setProgress] = useState<InspectionGet[]>([]);
    const [loading, setLoading] = useState(true);
    // const [sideBar, setSideBarShow] = useState(false);
    const [set, setSet] = useState(false);
    const [ins, setIns] = useState(true);
    const isFocused = useIsFocused();
    const route = useRoute();
    const pId: any = route.params;
    const routeName = route.name;
    console.log('🚀 ~ Details ~ routeName:', pId);
    const [showPopup, setShowPopup] = useState(false);
    const [ack, setAck] = useState(false);
    const [insId, setInsId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const Inspection = [
        {
            title: 'Move In',
            route: 'InspectionDetails',
            icon: moveIn,
            carry: {id: pId, type: 'MOVE_IN'},
        },
        {
            title: 'Move Out',
            route: 'InspectionDetails',
            icon: moveOut,
            carry: {id: pId, type: 'MOVE_OUT'},
        },
        {
            title: 'Intermittent',
            route: 'InspectionDetails',
            icon: hourGlass,
            carry: {id: pId, type: 'INTERMITTENT_INSPECTION'},
        },
        {
            title: 'Manager',
            route: 'InspectionDetails',
            icon: User,
            carry: {id: pId, type: 'MANAGER_INSPECTION'},
        },
    ];
    const [dataResult, setData] = useState<DataState>({
        upcoming: [],
        overdue: [],
        recent: [],
        inProcess: [],
    });
    const inspectionOptions = [
        {label: 'Move-In', value: 'MOVE_IN'},
        {label: 'Move-Out', value: 'MOVE_OUT'},
        {label: `Periodic${'\n'}Inspection`, value: 'INTERMITTENT_INSPECTION'},
        {label: `General${'\n'}Inspection`, value: 'MANAGER_INSPECTION'},
    ];
    const setting =
        userData?.type === 'OWNER' || userData?.type === 'MANAGER'
            ? [
                  {
                      title: 'Add Inspection',
                      route: null,
                      icon: Inspect,
                      carry: null,
                      subRoutes: [
                          {
                              title: 'Move In',
                              route: 'InspectionDetails',
                              icon: moveIn,
                              carry: {id: pId, type: 'MOVE_IN'},
                          },
                          {
                              title: 'Move Out',
                              route: 'InspectionDetails',
                              icon: moveOut,
                              carry: {id: pId, type: 'MOVE_OUT'},
                          },
                          {
                              title: 'Intermittent',
                              route: 'InspectionDetails',
                              icon: hourGlass,
                              carry: {id: pId, type: 'INTERMITTENT_INSPECTION'},
                          },
                          {
                              title: 'Manager',
                              route: 'InspectionDetails',
                              icon: User,
                              carry: {id: pId, type: 'MANAGER_INSPECTION'},
                          },
                      ],
                  },
                  {
                      title: 'Renter',
                      route: 'TenantHome',
                      icon: Tnt,
                      carry: propertyData?.id,
                  },
                  {
                      title: 'Quick Action',
                      route: 'NewPictureCamera',
                      icon: Camera,
                      carry: propertyData?.id,
                  },
                  {
                      title: 'View History',
                      route: 'Timeline',
                      icon: Calendar,
                      carry: pId,
                  },
                  {
                      title: 'Update Property',
                      route: 'EditRoot',
                      icon: Edit,
                      carry: propertyData,
                  },
                  {
                      title: 'Delete Property',
                      route: 'propertyDelete',
                      icon: Delete,
                      carry: {id: propertyData?.id},
                  },
              ]
            : [
                  {
                      title: 'Quick Photo',
                      route: 'NewPictureCamera',
                      icon: Camera,
                      carry: propertyData?.id,
                  },
              ];

    const getDetails = async () => {
        setLoading(true);
        try {
            const online = await cacheService.checkIsOnline();
            if (online) {
                const response = await apiGetSpecificProperty(pId);

                if (response.status) {
                    setPropertyData(null);

                    setPropertyData(response.result);
                }
            } else {
                const response = await cacheService.makeOfflineResponse(
                    '@propertyData',
                    {screen: 'details property', id: pId},
                );
                if (response.status) {
                    setPropertyData(null);
                    setPropertyData(response.result);
                    console.log(
                        '🚀 ~ getDetails ~ response.result:',
                        response.result,
                    );
                }
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const getProgress = async () => {
        try {
            const response: any = await apiInspectionlistById(pId);
            if (response.status) {
                setData(response.result.data);
            }
        } catch (error) {
            console.log('🚀 ~ getProgress ~ error:', error);
        }
    };
    // const getProgress = async () => {
    //     const online = await cacheService.checkIsOnline();
    //     if (online) {
    //         const response: any = await apiInspectionList({ per_page: 20, property_id: pId, is_completed: 0 });
    //         const asynchronous: any[] | null = await cacheService.getAsyncItem('@inspectionS');
    //         let filteredProp = response.result.data;
    //         // {"data": {"final_comments": "", "inspection_id": 310, "optional_comments": ""}, "name": "apiCompleteInspection"}
    //         if (asynchronous && asynchronous.length > 0) {
    //             const filteredAPi = asynchronous.filter(item => item.name === 'apiCompleteInspection');

    //             if (filteredAPi.length > 0) {
    //                 const inspectionIds = new Set(filteredAPi.map(item => item.data.inspection_id));

    //                 filteredProp = response.result.data.filter((item: any) =>
    //                     !inspectionIds.has(item.id)
    //                 );

    //             }
    //         }
    //         if (response.status) {
    //             setProgress([]);
    //             setProgress(filteredProp);
    //         }
    //     } else {
    //         const response: any = await cacheService.makeOfflineResponse('@inspectionData', {screen: 'details inspection', id: pId});
    //         if (response.status) {
    //             setProgress([]);
    //             setProgress(response.result.data);
    //         }
    //     }
    // };

    const openMaps = async (lat: any, lng: any, name: any) => {
        const scheme = Platform.select({
            ios: 'maps://0,0?q=',
            android: 'geo:0,0?q=',
        });
        const latLng = `${lat},${lng}`;
        const label = name;
        const url: any = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });
        Linking.openURL(url);
    };

    const {bedroom, bathroom} = handleBedroomAndBathroomCount(propertyData);
    useEffect(() => {
        (async () => {
            if (isFocused) {
                getDetails();
                getProgress();
                // getAllInspection('details');
            }
        })();
    }, [isFocused]);
    useEffect(() => {}, [progress]);
    const sideBarHide = () => {
        dispatch(setSideBar(!sideBarStatus));
    };
    const renderItem = ({item}: {item: InspectionItem}) => {
        console.log('🚀 ~ renderItem ~ item:', item);
        return (
            <CommonInspectionCard
                data={item}
                showText={false}
                onPress={() => {
                    setShowPopup(true), setInsId(item?.id);
                }}
            />
        );
    };

    const Badge = ({label, color, textColor, name}) => (
        <View style={styles.badgeContainer}>
            <View style={[styles.badgeCircle]}>
                <Text style={[styles.badgeLabel, {color: textColor}]}>
                    {label}
                </Text>
            </View>
            <Text style={styles.badgeName}>{name}</Text>
        </View>
    );

    const inspectionCreate = async (action: string) => {
        setModalVisible(false);

        navigation.navigate('InspectionDetails', {
            id: null,
            type: action,
        });
    };

    const selectCheckBox = async()=>{
        try{
            let res = await apiGetInspectionStatus(insId)
            console.log("res.status==========>",res)
            if(res.status){
            }
        }catch(error){
        console.log("🚀 ~ selectCheckBox ~ error:===>", error)

        }
    }
    return (
        <>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}

            <SafeAreaView style={{flex: 1}}>
                <ScrollView style={styles.container}>
                    <View style={styles.mainContainer}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 10,
                                justifyContent: 'space-between',
                                marginTop: Platform.OS === 'ios' ? 0 : 30,
                            }}>
                            <TouchableOpacity
                                style={styles.backIcon}
                                onPress={() => {
                                    navigation.navigate('Home');
                                }}>
                                <Image
                                    alt="back"
                                    source={require('../../assets/icon/back.png')}
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
                                Property Details
                            </Text>
                            <View style={{width: 40}}></View>
                        </View>
                        <View style={styles.card}>
                            <ImageBackground
                                source={
                                    propertyData?.cover_image
                                        ? {uri: propertyData?.cover_image}
                                        : require('../../assets/icon/banner.png')
                                }
                                style={styles.propertyImage}
                                resizeMode="contain"></ImageBackground>
                        </View>
                        <View style={styles.inspectionRow}>
                            <TouchableOpacity
                                style={styles.menuBtn}
                                onPress={() => {
                                    navigation.openDrawer();
                                }}>
                                <Image
                                    source={require('../../assets/icon/menu_2.png')} // Change image
                                    style={{width: 16, height: 16}}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.inspectionBtn}
                                disabled={
                                    userData?.type === 'OWNER' ||
                                    userData?.type === 'MANAGER'
                                        ? false
                                        : true
                                }
                                onPress={() => {
                                    setSet(false);
                                    setIns(true);
                                    setModalVisible(true);
                                    // dispatch(setSideBar(!sideBarStatus))
                                }}>
                                <Text style={styles.inspectionText}>
                                    New Inspection
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title1}>{propertyData?.name}</Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                // alignItems: 'center',
                                marginTop: 5,
                            }}
                            onPress={() =>
                                openMaps(
                                    propertyData.latitude,
                                    propertyData.longitude,
                                    propertyData.name,
                                )
                            }>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    height: 22,
                                    alignItems: 'center',
                                }}>
                                <Image
                                    source={require('../../assets/icon/location_3.png')}
                                    style={{width: 13, height: 13}}
                                    resizeMode="contain"
                                />
                                <Text
                                    style={[
                                        styles.location,
                                        {
                                            paddingLeft: 5,
                                            fontSize: 13,
                                            color: '#250959',
                                            fontWeight: '600',
                                        },
                                    ]}>
                                    Location:
                                </Text>
                            </View>
                            <View style={{width: wp('60%')}}>
                                <Text
                                    style={[
                                        styles.location,
                                        {
                                            paddingLeft: 5,
                                            flexWrap: 'wrap',
                                        },
                                    ]}>
                                    {propertyData?.location}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.infoRow}>
                            {propertyData?.areas?.slice(0, 3).map((val, index) => {
                                return (
                                    <View style={styles.badge}>
                                        <Image
                                            source={require('../../assets/icon/bed_2.png')}
                                            style={{width: 10, height: 10}}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.badgeText}>
                                            1 {val.title}
                                        </Text>
                                    </View>
                                );
                            })}

                            {/* <View style={styles.badge}>
                                <Image
                                    source={require('../../assets/icon/bath_2.png')}
                                    style={{width: 10, height: 10}}
                                    resizeMode="contain"
                                />
                                <Text style={styles.badgeText}>2 Baths</Text>
                            </View> */}

                            {/* <View style={styles.badge}>
                                                           <Text style={styles.badgeText}>1 Garage</Text>
                                                       </View> */}
                        </View>
                        <View
                            style={{
                                width: '70%',
                                height: 1,
                                backgroundColor: '#D9D9D9',
                                alignSelf: 'center',
                                marginTop: 20,
                            }}
                        />
                        {dataResult?.upcoming.length > 0 && (
                            <Text style={styles.title}>Pending</Text>
                        )}
                        <FlatList
                            data={dataResult?.upcoming}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingVertical: 10}}
                        />
                        {/* <View
                        style={{
                            width: '70%',
                            height: 1,
                            backgroundColor: '#D9D9D9',
                            alignSelf: 'center',
                            marginTop: 20,
                        }}
                    /> */}
                        {dataResult?.inProcess.length > 0 && (
                            <Text style={styles.title}>In-Progress</Text>
                        )}
                        <FlatList
                            data={dataResult?.inProcess}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingVertical: 10}}
                        />
                        {/* <View
                        style={{
                            width: '70%',
                            height: 1,
                            backgroundColor: '#D9D9D9',
                            alignSelf: 'center',
                            marginTop: 20,
                        }}
                    /> */}
                        {dataResult?.overdue.length > 0 && (
                            <Text style={styles.title}>Overdue</Text>
                        )}
                        <FlatList
                            data={dataResult?.overdue}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingVertical: 10}}
                        />
                        {/* <View
                        style={{
                            width: '70%',
                            height: 1,
                            backgroundColor: '#D9D9D9',
                            alignSelf: 'center',
                            marginTop: 20,
                        }}
                    /> */}
                        {dataResult?.recent.length > 0 && (
                            <Text style={styles.title}>Completed</Text>
                        )}
                        <FlatList
                            data={dataResult?.recent}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingVertical: 10}}
                        />
                        {/* <View
                        style={{
                            width: '70%',
                            height: 1,
                            backgroundColor: '#D9D9D9',
                            alignSelf: 'center',
                            marginTop: 20,
                        }}
                    /> */}

                        {/* main content Area */}
                        {/* <VStack mt={5} mb={2} space={2}>
                 
                 
                    <VStack mt={8} space={2}>
                        <Text bold fontSize="3xl" color={'rgba(51,57,139,0.9)'}>In-Progress</Text>
                        <VStack space={1}>
                            {progress.length != 0 ? progress?.map((item, i) => {
                                return (
                                    <Progress key={i} item={item} navigation={navigation} insId={item.id} getProgress={getProgress} />
                                );
                            })
                                :
                                <Text bold fontSize="xs" color={'my.tl'} p={3} style={styles.text3}>No Pending Progress</Text>
                            }
                        </VStack>
                    </VStack>

                </VStack> */}
                        <View style={{height: 90}} />
                    </View>
                </ScrollView>
                <Modal
                    isOpen={showPopup}
                    // transparent
                    // animationType="fade"
                    onClose={() => setShowPopup(false)}>
                    <View style={styles.overlay}>
                        <View style={styles.popupContainer}>
                            <View style={styles.handleBar} />
                            <ScrollView
                                contentContainerStyle={{
                                    paddingBottom: 40,
                                    paddingHorizontal: 20,
                                }}
                                showsVerticalScrollIndicator={false}>
                                {/* Title */}
                                <Text style={styles.title2}>
                                    BEFORE YOU BEGIN
                                </Text>

                                <Text style={styles.desc}>
                                    This inspection records the condition of the
                                    property. It may be used when reviewing the
                                    security deposit. Please be accurate and
                                    honest.
                                </Text>

                                {/* How to complete section */}
                                <Text style={styles.subTitle}>
                                    How to complete the inspection:
                                </Text>

                                <Text style={styles.bulletText}>
                                    • Tap the{' '}
                                    <Text style={styles.bold}>
                                        “Mark as Satisfactory”
                                    </Text>{' '}
                                    button at the top right corner of each
                                    section.
                                </Text>

                                <Text style={styles.bulletText}>
                                    • Review each item and adjust as needed
                                    using:
                                </Text>

                                {/* Badge Rows */}
                                <View style={styles.badgeRow}>
                                    <Badge
                                        label="N"
                                        color="#D9D9F5"
                                        textColor="#34b4eb"
                                        name="New"
                                    />
                                    <Badge
                                        label="!"
                                        color="#FFF3CF"
                                        textColor="#CD3223"
                                        name="Needs Attention"
                                    />
                                </View>

                                <View style={styles.badgeRow}>
                                    <Badge
                                        label="S"
                                        color="#DFF7E3"
                                        textColor="#22B14B"
                                        name="Satisfactory"
                                    />
                                    <Badge
                                        label="N/A"
                                        color="#FCE3E3"
                                        textColor="#E78922"
                                        name="Not Available"
                                    />
                                </View>

                                <View style={styles.badgeRow}>
                                    <Badge
                                        label="D"
                                        color="#F8D6DE"
                                        textColor="#EEBD34"
                                        name="Existing Damage"
                                    />
                                </View>
                                <Text style={styles.bulletText}>
                                    • All items marked{' '}
                                    <Text style={styles.bold}>"Damaged"</Text>{' '}
                                    or{' '}
                                    <Text style={styles.bold}>
                                        “Needs Attention”
                                    </Text>{' '}
                                    must have an associated photo before moving
                                    on to the next section.
                                </Text>
                                {/* Note */}
                                <View style={styles.noteBox}>
                                    <Text style={styles.noteTitle}>
                                        Notice:
                                    </Text>
                                    <Text style={styles.noteText}>
                                        By completing and submitting this
                                        inspection, you acknowledge that the
                                        information provided reflects your
                                        good-faith assessment of the property’s
                                        condition…
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 20,
                                    }}>
                                    <View style={styles.checkboxRow}>
                                        <TouchableOpacity
                                            style={styles.checkbox}
                                            onPress={() =>{selectCheckBox(), setAck(!ack)}}>
                                            {ack && (
                                                <Image
                                                    source={require('../../assets/icon/tick.png')}
                                                    style={{
                                                        width: 10,
                                                        height: 7,
                                                    }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                        {/* <Checkbox value="test" accessibilityLabel="This is a dummy checkbox" /> */}
                                        <Text style={styles.ackText}>
                                            Acknowledge
                                        </Text>
                                    </View>

                                    {/* Begin Button */}
                                    <TouchableOpacity
                                        disabled={!ack}
                                        style={[
                                            styles.beginBtn,
                                            {opacity: ack ? 1 : 0.4},
                                        ]}
                                        onPress={() => {
                                            setShowPopup(false),
                                                navigation.navigate('Areas', {
                                                    id: insId,
                                                });
                                        }}>
                                        <Text style={styles.beginText}>
                                            Begin
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {/* <View style={{height:20}}/> */}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

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
                                source={require('../../assets/icon/close_2.png')}
                                style={{
                                    width: 16,
                                    height: 16,
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
                                Inspection Type
                            </Text>
                        </Modal.Header>

                        <Modal.Body style={{marginTop: 15}}>
                            <VStack space={4}>
                                <HStack justifyContent="space-between">
                                    {inspectionOptions
                                        .slice(0, 2)
                                        .map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                onPress={() => {
                                                    setSelectedType(
                                                        option.value,
                                                    );
                                                    inspectionCreate(
                                                        option.value,
                                                    );
                                                }}
                                                style={{
                                                    width: '48%',
                                                    backgroundColor:
                                                        selectedType ===
                                                        option.value
                                                            ? '#F2F2F2'
                                                            : '#F2F2F2',
                                                    borderRadius: 20,
                                                    borderWidth:
                                                        selectedType ===
                                                        option.value
                                                            ? 1.5
                                                            : 0,
                                                    borderColor:
                                                        selectedType ===
                                                        option.value
                                                            ? '#9A46DB'
                                                            : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: 70,
                                                    flexDirection: 'row',
                                                }}>
                                                <Text
                                                    style={{
                                                        color:
                                                            selectedType ===
                                                            option.value
                                                                ? '#9A46DB'
                                                                : '#250959',
                                                        fontSize: 15,
                                                        fontWeight: '600',
                                                    }}>
                                                    {option.label}
                                                </Text>
                                                <Image
                                                    source={require('../../assets/icon/info_2.png')}
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        marginLeft: 6,
                                                        position: 'absolute',
                                                        top: 10,
                                                        right: 10,
                                                    }}
                                                    resizeMode="contain"
                                                    tintColor={'#250959'}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                </HStack>

                                <HStack justifyContent="space-between">
                                    {inspectionOptions
                                        .slice(2, 4)
                                        .map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                onPress={() => {
                                                    setSelectedType(
                                                        option.value,
                                                    );
                                                    inspectionCreate(
                                                        option.value,
                                                    );
                                                }}
                                                style={{
                                                    width: '48%',
                                                    backgroundColor:
                                                        selectedType ===
                                                        option.value
                                                            ? '#FFF'
                                                            : '#F2F2F2',
                                                    borderRadius: 20,
                                                    borderWidth:
                                                        selectedType ===
                                                        option.value
                                                            ? 1.5
                                                            : 0,
                                                    borderColor:
                                                        selectedType ===
                                                        option.value
                                                            ? '#9A46DB'
                                                            : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: 70,
                                                    flexDirection: 'row',
                                                }}>
                                                <Text
                                                    style={{
                                                        color:
                                                            selectedType ===
                                                            option.value
                                                                ? '#9A46DB'
                                                                : '#250959',
                                                        fontSize: 15,
                                                        fontWeight: '600',
                                                    }}>
                                                    {option.label}
                                                </Text>
                                                <Image
                                                    source={require('../../assets/icon/info_2.png')}
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        // tintColor:'#9A46DB',

                                                        marginLeft: 6,
                                                        position: 'absolute',
                                                        top: 10,
                                                        right: 10,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        ))}
                                </HStack>
                            </VStack>
                        </Modal.Body>
                    </Modal.Content>
                </Modal>
            </SafeAreaView>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        // paddingTop: 20,
    },
    mainContainer: {
        marginHorizontal: 10,
    },
    btnBox: {
        borderWidth: 5,
        borderColor: '#fff',
        borderRadius: 100,
    },
    imageContainer: {
        marginLeft: -20,
        marginRight: -20,
        backgroundColor: '#000000',
        height: 220,
        // width: '100%',
    },
    image: {
        resizeMode: 'contain',
        height: 220,
        width: '100%',
        alignSelf: 'center',
    },
    mainContentContainer: {
        padding: 10,
    },
    items: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245,244,249,1.0)',
        width: '100%',
        height: hp('10%'),
        borderRadius: 25,
        padding: 20,
    },
    text1: {
        flexWrap: 'wrap',
        width: wp('60%'),
        color: 'rgba(10,113,189,0.9)',
    },
    text2: {
        flexWrap: 'wrap',
        width: wp('50%'),
        height: 50,
    },
    text3: {
        flexWrap: 'wrap',
        backgroundColor: 'rgba(245,244,249,1.0)',
        borderRadius: 10,
    },
    btnArea: {
        height: '100%',
        width: '80%',
        backgroundColor: 'rgba(10,123,189,0.9)',
    },
    btnDisabled: {
        height: '100%',
        width: '80%',
        backgroundColor: 'rgba(163,229,94,0.9)',
    },
    cardBody: {
        backgroundColor: 'rgba(1,111,189,0.9)',
    },
    textType: {
        fontSize: 12,
    },
    textDate: {
        fontSize: 10,
    },
    icon: {
        height: 20,
        width: 20,
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
    card: {
        width: '89%',
        height: 180,
        borderRadius: 20,
        marginBottom: 15,
        alignSelf: 'center',
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
        // overflow:'hidden'
        // justifyContent: 'space-between',
    },
    propertyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        alignSelf: 'center',
    },
    inspectionRow: {
        alignSelf: 'center',
        // position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // paddingVertical: 15,
        // bottom: -30,
        // zIndex: 999,
    },
    menuBtn: {
        width: 45,
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    inspectionBtn: {
        width: '70%',
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#9A46DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inspectionText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    title1: {
        marginTop: 18,
        fontSize: 20,
        fontWeight: '700',
        color: '#250959',
    },
    location: {
        fontSize: 12,
        color: '#6A6A6A',
    },
    infoRow: {
        flexDirection: 'row',
        marginTop: 18,
    },
    badge: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    badgeText: {
        color: '#250959',
        fontWeight: '600',
        fontSize: 12,
        paddingLeft: 5,
    },
    title: {
        marginTop: 18,
        fontSize: 18,
        fontWeight: '600',
        color: '#250959',
    },
    //Pop up styles
    overlay: {
        flex: 1,
        backgroundColor: '#9A46DB80',
        justifyContent: 'flex-end',
    },
    popupContainer: {
        width: '100%',
        maxHeight: screenHeight * 0.8,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        alignItems: 'center',
    },
    topGradient: {
        height: 60,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    handleBar: {
        width: 60,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000000',
        marginTop: 10,
    },
    title2: {
        fontSize: 18,
        fontWeight: '600',
        color: '#250959',
        marginTop: 15,
    },
    desc: {
        color: '#250959',
        marginTop: 10,
        lineHeight: 20,
        fontSize: 14,
    },
    subTitle: {
        marginTop: 20,
        fontWeight: '700',
        fontSize: 14,
        color: '#250959',
    },
    bulletText: {
        marginTop: 10,
        color: '#250959',
    },
    bold: {
        fontWeight: '700',
        color: '#250959',
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 20,
    },
    badgeContainer: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        padding: 10,
        borderRadius: 15,
        marginTop: 10,
    },
    badgeCircle: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#CCC',
    },
    badgeLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    badgeName: {
        marginLeft: 10,
        color: '#250959',
        fontWeight: '600',
        fontSize: 12,
    },
    noteBox: {
        padding: 15,
        borderRadius: 15,
        backgroundColor: '#F7F3FF',
        marginTop: 20,
    },
    noteTitle: {
        fontWeight: '700',
        marginBottom: 6,
        color: '#7D4CDB',
    },
    noteText: {
        color: '#666',
        lineHeight: 18,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
    },
    ackText: {
        marginLeft: 10,
        color: '#250959',
        fontWeight: '600',
    },
    beginBtn: {
        width: '45%',
        height: 60,
        marginTop: 20,
        backgroundColor: '#9A46DB',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    beginText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#E5DCED',
        backgroundColor: '#F2F2F2',
    },
});

export default Details;
