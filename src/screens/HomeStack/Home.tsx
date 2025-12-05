import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    FlatList,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    ImageBackground,
    SafeAreaView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
    Text,
    Box,
    ScrollView,
    Pressable,
    HStack,
    VStack,
    Spinner,
} from 'native-base';
import {HomeProps} from '@/constant/SideBarRoutes';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setSideBar} from '@/state/propertyDataSlice';
import {apiGetPropertyList, apiInspectionListData} from '@/apis/property';
import {apiGetAction} from '@/apis/home';
import {propertyList} from '@/services/types';
import {actionType} from '@/services/types';
import {useIsFocused} from '@react-navigation/native';
import {apiGetProfile} from '@/apis/auth';
import {setProfile} from '@/state/authSlice';
import {getAllInspection} from '@/constant/customHooks';
import HeaderHome from '@/components/headerHome';
import _actionCard from '@/components/HomeCard/_actionCard';
import _propertyCard from '@/components/HomeCard/_propertyCard';
import SideBar from '@/components/SideBar';
import cacheService from '@/services/CacheServices';
// icon
import All from '@/assets/icon/SettingIco.png';
import Cal from '@/assets/icon/Cal.png';
import Tnt from '@/assets/icon/renter-icon.png';
import location from '@/assets/icon/location_3.png';
import bed from '@/assets/icon/bed_2.png';
import bath from '@/assets/icon/bath_2.png';
import garage from '@/assets/icon/garage_2.png';
import Heart from '@/assets/icon/heart_2.png';
import Tick from '@/assets/icon/tick_2.png';
import task from '@/assets/icon/tasks.png';
import ImageCover from '@/assets/icon/image_3.png';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import {style} from 'styled-system';
const {width} = Dimensions.get('window');

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

interface InspectionItem {
    id: number;
    property_id: number;
    created_by: number;
    created_by_name: string;
    is_signed: number;
    signed_at: string | null;
    activity: string;
    inspection_date: string;
    is_completed: number;
    created_at: string;
    updated_at: string | null;
    property: Property;
    tenants: Tenant[];
}

interface DataState {
    upcoming: InspectionItem[];
    overdue: InspectionItem[];
    recent: InspectionItem[];
    inProcess: InspectionItem[];
    awaitingReview: InspectionItem[];
    taskview: InspectionItem[];
}
const Home = ({navigation}: any): React.JSX.Element => {
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const homeModeStatus: boolean = useAppSelector(
        state => state.property.homeMode,
    );

    const userData = useAppSelector(state => state.auth.userData);
    const profileData = useAppSelector(state => state.auth.profileData);
    const [actionList, setActionList] = useState<actionType | null>(null);
    const [listData, setListData] = useState([]);
    const [page, setPage] = useState<number>(1);
    const [actionActive, setActionActive] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [pLoading, setPLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const [dataResult, setData] = useState<DataState>({
        upcoming: [],
        overdue: [],
        recent: [],
        inProcess: [],
        awaitingReview: [],
        taskview: [],
    });

    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();

    const sideBarHide = () => {
        dispatch(setSideBar(!sideBarStatus));
    };

    const bottom = () => {
        if (page < totalPage) {
            setPage(prevPage => prevPage + 1);
        }
    };

    useEffect(() => {
        getList();
    }, [isFocused]);

    const getList = async () => {
        // dispatch(showLoader())
        const response = await apiGetPropertyList({
            per_page: 10,
            page_no: page,
        });

        // dispatch(hideLoader())
        if (response.status) {
            setListData(response.result.data);
            if (response.result.data.length <= 0) {
                setIsEmpty(true);
            }
            // setTotalPage(response.result.meta_info.total_pages);
        }
    };

    const getAllInspectionData = async () => {
        try {
            const response = await apiInspectionListData();
            console.log("🚀 ~ getAllInspectionData ~ response:", response)
            if (response.status) {
                const {data} = response.result;

                setData(data);
            }
        } catch (error) {
            console.log('🚀 ~ getAllInspectionData ~ error:', error);
        }
    };

    const getAction = async () => {
        setPLoading(true);
        try {
            const response = await apiGetAction();
            if (!response.status) {
                return setPLoading(false);
            }

            const cal = response.result.inspection.length
                ? handleRecords(response.result.inspection)
                : null;
            const tnt = response.result.lease.length
                ? handleRecords(response.result.lease)
                : null;
            const prt = response.result.property.length
                ? handleRecords(response.result.property)
                : null;
            const all = [cal, tnt, prt];

            setActionList(cal || tnt || prt ? {...response.result, all} : null);
        } catch (error) {
        } finally {
            setPLoading(false);
        }
    };

    const handleRecords = (data: any) => {
        const currentDate: any = new Date();
        let closestInspection: any = null;
        let closestDifference = Infinity;

        data != null &&
            data.length != 0 &&
            data.find((element: any) => {
                const recordDate: any = new Date(
                    element.type === 'inspection'
                        ? element.inspection_date
                        : element.type === 'lease'
                        ? element.movein_disable_on
                        : element.created_at,
                );
                const difference: any = Math.abs(currentDate - recordDate);
                if (difference < closestDifference) {
                    closestDifference = difference;
                    closestInspection = element;
                }

                return difference < closestDifference;
            });

        return closestInspection;
    };
    const renderHandle: any = {
        1: actionList?.all || [],
        2: actionList?.inspection || [],
        3: actionList?.lease || [],
        4: actionList?.property || [],
    };
    const renderData = () => {
        let dataToRender: any[] = [];
        dataToRender = renderHandle[actionActive] || [];
        if (dataToRender.length > 0) {
            return dataToRender?.map(
                (item: any, i: number) =>
                    item && item.id && <_actionCard key={i} item={item} />,
            );
        } else {
            return (
                <Text mx={'auto'} my={'auto'}>
                    No Data Found
                </Text>
            );
        }
    };

    useEffect(() => {
        (async () => {
            if (isFocused) {
                const online = await cacheService.checkIsOnline();

                getAllInspectionData();
                setListData([]);
                setLoading(true);
                const response = await apiGetPropertyList({
                    per_page: 50,
                    page_no: page,
                });
                setLoading(false);
                if (response.status) {
                    setLoading(false);
                    setListData(response.result.data);
                    if (response.result.data.length <= 0) {
                        setIsEmpty(true);
                    }
                    setTotalPage(response.result.meta_info.total_pages);
                }
                getAction();
                if (profileData == null && online) {
                    const res = await apiGetProfile({});
                    if (res.status) {
                        dispatch(setProfile(res.result));
                    }
                }
                getAllInspection();
            }
        })();
    }, []);

    useEffect(() => {
        getAllInspectionData();
    }, [isFocused]);
    useEffect(() => {
        (async () => {
            const online = await cacheService.checkIsOnline();
            if (page != 1 && online) {
                getList();
            }
        })();
    }, [page]);

    useEffect(() => {}, [listData]);
    const properties = [
        {
            id: 1,
            title: 'Redwood Villas',
            location: 'Mississauga, ON',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            details: '3 Beds  •  2 Baths  •  1 Garage',
        },
        {
            id: 2,
            title: 'Davis Residence',
            location: 'Toronto, ON',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            details: '3 Beds  •  2 Baths  •  1 Garage',
        },
    ];

    const data = [
        {
            title: 'Recently',
            subtitle: 'Completed',
            type: 'recent',
            color: '#9EF7AE',
            icon: require('@/assets/icon/Completed.png'),
            subicon: require('@/assets/icon/tick_2.png'),
            count: dataResult.recent.length,
        },
        {
            title: 'Upcoming',
            subtitle: 'Inspections',
            type: 'upcoming',
            color: '#C1A7FF',
            icon: require('@/assets/icon/U_Inspections.png'),
            subicon: require('@/assets/icon/Union_2.png'),
            count: dataResult.upcoming.length,
        },
        {
            title: 'Overdue',
            subtitle: 'Inspections',
            type: 'overdue',
            color: '#FF758F',
            icon: require('@/assets/icon/Inspections.png'),
            subicon: require('@/assets/icon/ins.png'),
            count: dataResult?.overdue.length,
        },
        {
            title: 'My',
            subtitle: 'Tasks',
            type: 'recent',
            color: '#7EE7FF',
            icon: require('@/assets/icon/tasks.png'),
            subicon: require('@/assets/icon/my_task.png'),
            count: 0,
        },
        {
            title: 'In',
            subtitle: 'Progress',
            type: 'in_process',
            color: '#FFC45A',
            icon: require('@/assets/icon/Progress.png'),
            subicon: require('@/assets/icon/pro.png'),
            count: dataResult?.inProcess.length,
        },
        {
            title: 'Awaiting',
            subtitle: 'Review',
            type: 'awaiting_review',
            color: '#9EB4FF',
            icon: require('@/assets/icon/Awaiting.png'),
            subicon: require('@/assets/icon/Union_3.png'),
            count: dataResult?.awaitingReview.length,
        },
    ];

    const SectionCard = ({
        title1,
        title,
        color,
        iconColor,
        data,
        iconBgColor,
        sideIconColor,
        leftIcon,
    }) => {
        return (
            <View style={styles.sectionContainer}>
                <View style={[styles.sectionHeader, {backgroundColor: color}]}>
                    <View style={styles.sectionHeaderLeft}>
                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 8,
                                backgroundColor: iconBgColor,
                            }}>
                            <Image
                                source={leftIcon}
                                style={{
                                    width: 20,
                                    height: 20,
                                    tintColor: iconColor,
                                }}
                            />
                        </TouchableOpacity>
                        <Text
                            style={[
                                styles.sectionHeaderTitle,
                                {color: iconColor},
                            ]}>
                            {title}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            backgroundColor: iconBgColor,
                        }}>
                        <Image
                            source={require('../../assets/icon/menu_4.png')}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: iconColor,
                            }}
                        />
                    </TouchableOpacity>
                    {/* <Icon name="menu-outline" size={22} color={iconColor} /> */}
                </View>

                <View style={styles.sectionBody}>
                    {data?.length == 0 && (
                        <>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    marginTop: 20,
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#2E004F',
                                }}>
                                Nothing to see here yet.
                            </Text>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: '#757575',
                                }}>
                                Once you add data, your charts will come alive.
                            </Text>
                        </>
                    )}
                    {data?.slice(0, 3).map((item: any) => (
                        <View key={item.id} style={styles.itemBox}>
                            <View
                                style={{
                                    width: 2,
                                    height: 30,
                                    backgroundColor: sideIconColor,
                                }}
                            />
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.itemAddress}>
                                    {item?.property.name}
                                </Text>
                                <Text style={styles.itemSub}>
                                    {item?.property.location?.slice(0, 30)}
                                    {item?.property?.location?.length > 30
                                        ? '...'
                                        : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={{
                            width: '66%',
                            height: 40,
                            backgroundColor: '#EEE5F5',
                            alignSelf: 'center',
                            marginTop: 10,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}
                        onPress={() =>
                            navigation.navigate('RecentlyCompleted', {
                                title: {type :title1},
                            })
                        }>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={{flex: 1}}>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}
            <View
                style={{
                    marginHorizontal: 18,
                    marginTop: Platform.OS == 'ios' ? 0 : 19,
                    paddingBottom: 5,
                }}>
                <HeaderHome location={'home'} navigation={navigation} />
            </View>

            {!homeModeStatus ? (
                <ScrollView
                    nestedScrollEnabled={true}
                    onScrollEndDrag={bottom}
                    style={{flex: 1, backgroundColor: '#F2F2F2'}}>
                    <View style={styles.mainContainer}>
                        {/* <View style={{height: 35}} /> */}
                        <FlatList
                            key={2}
                            data={data}
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                            columnWrapperStyle={{
                                justifyContent: 'space-between',
                            }}
                            renderItem={({item}) => {
                                return (
                                    <TouchableOpacity
                                        style={styles.card21}
                                        disabled={item.subtitle == 'Tasks' ? true :false}
                                        onPress={() =>
                                            navigation.navigate(
                                                'RecentlyCompleted',
                                                {
                                                    title: item,
                                                },
                                            )
                                        }>
                                        <ImageBackground
                                            source={item.icon} // your background image
                                            style={{
                                                flex: 1,
                                                borderRadius: 20,
                                                padding: 10,
                                            }} // flex:1 to cover the card
                                            imageStyle={{borderRadius: 20}} // to round the corners of the image
                                        >
                                            <Text style={styles.title}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.title}>
                                                {item.subtitle}
                                            </Text>
                                            <Text style={styles.title}>
                                                {item.count}
                                            </Text>
                                            <View style={styles.iconBox}>
                                                <Image
                                                    source={item.subicon}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        tintColor: '#250959',
                                                    }}
                                                />
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </ScrollView>
            ) : (
                <ScrollView
                    nestedScrollEnabled={true}
                    onScrollEndDrag={bottom}
                    style={{flex: 1, backgroundColor: '#F2F2F2'}}>
                    {listData.length <= 0 && isEmpty ? (
                        <View
                            style={{
                                marginTop: 60,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#F3F3F3', // light grey background like screenshot
                                paddingHorizontal: 25,
                            }}>
                            <Image
                                source={require('../../assets/icon/empty.png')} // replace with your icon
                                style={styles.icon}
                                resizeMode="contain"
                            />

                            <Text style={styles.title1}>Oops!</Text>

                            <Text style={styles.subTitle}>
                                Nothing to see here yet.
                            </Text>

                            <Text style={styles.description}>
                                Once you add data, your charts will come alive.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.mainContainer1}>
                                {/* <HeaderHome location={'home'} navigation={navigation} /> */}

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        // marginTop: 20,
                                        marginBottom: 10,
                                        // marginHorizontal:20
                                    }}>
                                    <Text style={styles.sectionTitle}>
                                        Properties
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate(
                                                'PropertyListScreen',
                                            )
                                        }>
                                        <Text style={styles.sectionTitle1}>
                                            View More
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {loading ? (
                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: 200,
                                        }}>
                                        <ActivityIndicator
                                            size="large"
                                            color="#9A46DB"
                                        />
                                    </View>
                                ) : (
                                    <FlatList
                                        data={listData?.slice(0, 10)}
                                        keyExtractor={item =>
                                            item.id.toString()
                                        }
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{
                                            paddingHorizontal: 14,
                                        }}
                                        renderItem={({item}) => {
                                            return (
                                                <TouchableOpacity
                                                    style={styles.card}
                                                    onPress={() => {
                                                        navigation.navigate(
                                                            'Details',
                                                            item?.id,
                                                        );
                                                    }}>
                                                    <Image
                                                        source={
                                                            item?.cover_image
                                                                ? {
                                                                      uri: item?.cover_image,
                                                                  }
                                                                : ImageCover
                                                        }
                                                        style={styles.cardImage}
                                                    />
                                                    <TouchableOpacity
                                                        style={{
                                                            // width: '36%',
                                                            position:
                                                                'absolute',
                                                            top: 15,
                                                            left: 15,
                                                            backgroundColor:
                                                                '#FFFFFF',
                                                            padding: 6,
                                                            paddingHorizontal: 10,
                                                            borderRadius: 50,
                                                            alignItems:
                                                                'center',
                                                        }}>
                                                        <Text
                                                            style={{
                                                                color: '#250959',
                                                                fontSize: 12,
                                                            }}>
                                                            {item.type.replace('_',' ')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            top: 15,
                                                            right: 15,
                                                            borderRadius: 50,
                                                        }}>
                                                        <Image
                                                            source={Heart}
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                            }}
                                                            // tintColor={'#ffffff'}
                                                        />
                                                    </TouchableOpacity>
                                                    <Text
                                                        style={
                                                            styles.cardTitle
                                                        }>
                                                        {/* {item?.name} */}
                                                        {item?.name?.slice(
                                                            0,
                                                            22,
                                                        )}
                                                        {item?.name?.length > 22
                                                            ? '...'
                                                            : ''}
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
                                                            marginHorizontal: 10,
                                                            marginTop: 4,
                                                            marginBottom: 2,
                                                        }}>
                                                        <Image
                                                            source={location}
                                                            resizeMode="contain"
                                                            style={{
                                                                width: 11,
                                                                height: 11,
                                                            }}
                                                        />
                                                        <Text
                                                            style={
                                                                styles.cardSub
                                                            }>
                                                            {item?.location?.slice(
                                                                0,
                                                                30,
                                                            )}
                                                            {item?.location
                                                                ?.length > 30
                                                                ? '...'
                                                                : ''}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
                                                            marginTop: 4,
                                                            marginBottom: 2,
                                                        }}>
                                                        {item?.areas.map(
                                                            (area, index) => {
                                                                // Added index for key and renamed item to area for clarity
                                                                return (
                                                                    // <--- ADD THE RETURN KEYWORD HERE
                                                                    <View
                                                                        key={
                                                                            index
                                                                        }
                                                                        style={
                                                                            styles.boxView
                                                                        }>
                                                                        <Image
                                                                            source={
                                                                                bed
                                                                            }
                                                                            resizeMode="contain"
                                                                            tintColor={
                                                                                '#9A46DB'
                                                                            }
                                                                            style={{
                                                                                width: 10,
                                                                                height: 10,
                                                                            }}
                                                                        />
                                                                        <Text
                                                                            style={
                                                                                styles.cardSub
                                                                            }>
                                                                            1
                                                                            {area.title}
                                                                        </Text>
                                                                    </View>
                                                                ); // <--- Make sure to close with a semicolon (optional)
                                                            },
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                )}
                            </View>

                            <View
                                style={{
                                    backgroundColor: '#ffffff',
                                    flex: 1,
                                    borderTopLeftRadius: 40,
                                    borderTopRightRadius: 40,
                                    padding: 20,
                                    elevation: 2,
                                    // height:hp('30%')
                                }}>
                                {/* Recently Completed */}

                                <SectionCard
                                    leftIcon={require('../../assets/icon/tick_2.png')}
                                    title="Recently Completed"
                                    color="#97E37A"
                                    iconColor="#2E7D32"
                                    iconBgColor="#b3eb9d"
                                    data={dataResult?.recent}
                                    sideIconColor={'#97E37A'}
                                    title1={'recent'}
                                />

                                <SectionCard
                                    leftIcon={require('../../assets/icon/Union_2.png')}
                                    title="Upcoming Inspections"
                                    color="#CE8CF9"
                                    iconColor="#6A1B9A"
                                    data={dataResult?.upcoming}
                                    iconBgColor={'#ddaefb'}
                                    sideIconColor={'#9A46DB'}
                                    title1={'upcoming'}
                                />

                                <SectionCard
                                    leftIcon={require('../../assets/icon/ins.png')}
                                    title="Overdue Inspections"
                                    color="#FF7396"
                                    iconColor="#250959"
                                    data={dataResult?.overdue}
                                    iconBgColor={'#ff9db5'}
                                    sideIconColor={'#FF7396'}
                                    title1={'overdue'}
                                />

                                <SectionCard
                                    leftIcon={require('../../assets/icon/pro.png')}
                                    title="In Progress"
                                    color="#FFB674"
                                    iconColor="#250959"
                                    data={dataResult?.inProcess}
                                    iconBgColor={'#ffcc9d'}
                                    sideIconColor={'#FFB674'}
                                    title1={'in_process'}
                                />

                                <SectionCard
                                    leftIcon={require('../../assets/icon/Union_3.png')}
                                    title="Awaiting Review"
                                    color="#8CABF9"
                                    iconColor="#250959"
                                    data={dataResult?.awaitingReview}
                                    iconBgColor={'#aec4fb'}
                                    sideIconColor={'#8CABF9'}
                                    title1={'awaiting_review'}
                                />
                                <SectionCard
                                    leftIcon={require('../../assets/icon/my_task.png')}
                                    title="MyTasks"
                                    color="#75E9F9"
                                    iconColor="#250959"
                                    data={dataResult?.taskview}
                                    iconBgColor={'#baf4fc'}
                                    sideIconColor={'#75E9F9'}
                                    title1={'recent'}
                                />
                                <View style={{height: 100}} />
                            </View>
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        // paddingBottom: 80,
        width: wp('100%'),
        // minHeight: hp('100%'),
        backgroundColor: '#F2F2F2',
    },
    mainContainer1: {
        paddingHorizontal: 20,
        // padding: 20,
        // paddingBottom: 80,
        width: wp('100%'),
        // minHeight: hp('100%'),
        backgroundColor: '#F2F2F2',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#250959',
    },

    sectionTitle1: {
        fontSize: 10,
        fontWeight: '500',
        marginVertical: 10,
        color: '#9A46DB',
    },
    card: {
        width: width * 0.7,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginRight: 16,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        height: 260,
        marginBottom: 20,
    },
    cardImage: {
        width: '94%',
        height: 140,
        borderRadius: 15,
        alignSelf: 'center',
        marginTop: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
        marginHorizontal: 10,
        color: '#2E004F',
    },
    cardSub: {
        fontSize: 13,
        color: '#757575',
        marginHorizontal: 2,
    },
    cardDetails: {
        fontSize: 12,
        color: '#757575',
        marginHorizontal: 10,
        marginTop: 4,
    },
    boxView: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 4,
        marginTop: 4,
        marginBottom: 2,
        padding: 6,
        borderRadius: 35,
        backgroundColor: '#F8F8F8',
        elevation: 1,
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 9,
        marginTop: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderColor: '#B598CB4D',
    },
    sectionHeader: {
        margin: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 15,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionHeaderTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },
    sectionBody: {backgroundColor: '#fff', borderRadius: 20},
    itemBox: {
        flexDirection: 'row',
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        alignItems: 'center',
        marginHorizontal: 18,
    },
    itemAddress: {
        fontWeight: '600',
        color: '#2E004F',
        fontSize: 13,
    },
    itemSub: {
        fontSize: 12,
        color: '#757575',
    },
    viewAll: {
        textAlign: 'center',
        color: '#9A46DB',
        fontWeight: '600',
        marginTop: 8,
    },
    card21: {
        width: '48%',
        height: 179,
        borderRadius: 20,
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    title: {
        paddingLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#250959',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#250959',
    },
    iconBox: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 10,
        borderRadius: 10,
    },
    //

    icon: {
        width: 80,
        height: 80,
        marginBottom: 25,
    },
    title1: {
        fontSize: 30,
        fontWeight: '700',
        color: '#9A46DB',
        marginBottom: 6,
        padding: 10,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1446',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#8C8C8C',
        textAlign: 'center',
        width: '75%',
    },
});

export default Home;
