import React, {useEffect, useState, useMemo} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import {
    Text,
    Box,
    HStack,
    ScrollView,
    Divider,
    Button,
    Modal,
    VStack,
    Spinner,
    Alert,
} from 'native-base';
import {HomeProps} from '@/constant/SideBarRoutes';
import {useAppSelector, useAppDispatch} from '../../state/hooks';
import {setSideBar} from '../../state/propertyDataSlice';
// https://www.npmjs.com/package/react-native-calendars
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {CalendarResult} from '../../services/types';
import {apiGetCalendar} from '../../apis/calendar';
import _header from '@/components/_header';
import SideBar from '@/components/SideBar';
import {useIsFocused} from '@react-navigation/native';
import {
    eventNames,
    formatDate,
    formateInspectionName,
    warningTimer,
} from '@/constant/customHooks';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import DrawerIcon from '@/assets/icon/cal_1.png';
import SearchIcon from '@/assets/icon/cal_3.png';
import NotificationIcon from '@/assets/icon/cal_2.png';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CommonInspectionCard from '@/components/CommonInspectionCard';
// icons
import Cal from '@/assets/icon/Cal.png';
import Btn from '@/assets/icon/btn.png';
import {
    background,
    backgroundColor,
    borderColor,
    borderRadius,
} from 'styled-system';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import {apiGetPropertyList, apiInspectionListData} from '@/apis/property';
import moment from 'moment';
LocaleConfig.locales['custom'] = {
    monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    monthNamesShort: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ],
    // 👇 Only first letters for weekdays
    dayNames: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ],
    dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};
LocaleConfig.defaultLocale = 'custom';

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

const CalendarHome = ({navigation}: any): React.JSX.Element => {
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const {navigate} = useNavigation<NativeStackNavigationProp<any>>();
    const userData = useAppSelector(state => state.auth.userData);
    const [selected, setSelected] = useState('');
    console.log('🚀 ~ CalendarHome ~ selected:', selected);
    const [calendarData, setCalendarData] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const isFocused = useIsFocused();
    const dispatch = useAppDispatch();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const inspectionOptions = [
        {label: 'Move-In', value: 'MOVE_IN'},
        {label: 'Move-Out', value: 'MOVE_OUT'},
        {label: `Periodic${'\n'}Inspection`, value: 'INTERMITTENT_INSPECTION'},
        {label: `General${'\n'}Inspection`, value: 'MANAGER_INSPECTION'},
    ];

    const [dataResult, setData] = useState<DataState>({
        upcoming: [],
        overdue: [],
        recent: [],
        inProcess: [],
    });

    const sideBarHide = () => {
        dispatch(setSideBar(!sideBarStatus));
    };
    const getCalendarData = async (events: any) => {
        setLoading(true);
        try {
            const response = await apiGetCalendar(events);
            // console.log(JSON.stringify(response));
            if (response.status) {
                setCalendarData(response.result);
                // setCalendarData(null);
            } else {
                setCalendarData(null);
                console.log(response.message);
            }
        } catch (error) {
            console.log('API Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDate = async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const start_date = new Date(year, month, 1);
        const end_date = new Date(year, month + 1, 0);

        const event = {
            start_date: formateDate(start_date),
            end_date: formateDate(end_date),
        };
        getCalendarData(event);
    };

    const markedDates = useMemo(() => {
        const marks = {};

        // 1️⃣ Add event dots
        if (calendarData) {
            Object.keys(calendarData).forEach(date => {
                if (calendarData[date]?.length > 0) {
                    marks[date] = {
                        marked: true,
                        // dotColor: 'green',
                        customStyles: {
                            container: {
                                borderWidth: 1,
                                borderColor: '#ffffff',
                                borderRadius: 50,
                                background: 'green',
                            },
                            text: {color: '#CDB8FF'},
                        },
                    };
                }
            });
        }

        // 2️⃣ Selected date (today or any user click)
        if (selected) {
            marks[selected] = {
                ...marks[selected],
                selected: true,
                disableTouchEvent: true,
                customStyles: {
                    container: {
                        borderWidth: 1,
                        borderColor: '#CDB8FF',
                        borderRadius: 50,
                        backgroundColor: '#9A46DB',
                    },
                    text: {
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                },
            };
        }

        return marks;
    }, [calendarData, selected]);

    // useEffect(() => {
    //     (() => {
    //         if (isFocused) {
    //             getDate();
    //         }
    //     })();
    // }, [isFocused]);

    const formateDate = (value: any) => {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const checkCompleted = (id: number, complete: number) => {
        const route =
            complete === 0
                ? userData?.type !== 'TENANT'
                    ? 'Areas'
                    : 'TenantAreas'
                : 'CompletedView';
        navigation.navigate(route, id);
    };

    const isSameDate = (date1: any, date2: any): boolean => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        ) {
            return true;
        }
        if (
            d1.getFullYear() === d2.getFullYear() &&
            (d1.getMonth() < d2.getMonth() ||
                (d1.getMonth() === d2.getMonth() &&
                    d1.getDate() < d2.getDate()))
        ) {
            return true;
        }

        return false;
    };
    const activityData: any = {
        MOVE_IN: styles2.invite,
        MOVE_OUT: styles2.invite,
        MANAGER_INSPECTION: styles2.scheduled,
        INTERMITTENT_INSPECTION: styles2.scheduled,
    };
    const handleActivity = (
        status: any,
        completed: any,
        inspection_date: any,
    ) => {
        if (isSameDate(inspection_date, new Date())) {
            return completed == 1
                ? styles2.completed
                : activityData[status] || status;
        } else {
            return styles2.scheduled;
        }
    };

    const HandleRenterName = (tenants: any, activity: any): string => {
        if (
            activity !== 'INTERMITTENT_INSPECTION' &&
            activity !== 'MANAGER_INSPECTION'
        ) {
            if (tenants?.length > 0) {
                const names = tenants
                    .map((name: any) => `${name.first_name} ${name.last_name}`)
                    .join(tenants.length === 1 ? '' : ', ');
                return `Renter: ${names}`;
            }
        }
        return '';
    };

    const events = () => {
        if (selected != null && calendarData != null) {
            const filteredData = calendarData[selected];
            // console.log('selected: ', JSON.stringify(selected));
            if (filteredData != null && filteredData.length > 0) {
                return filteredData?.map((e: any, i: number) => {
                    console.log('calendar:data:--', e.data.activity);
                    return (
                        <Pressable
                            key={i}
                            onPress={() => {
                                checkCompleted(e.data.id, e.data.is_completed);
                            }}>
                            <HStack
                                style={styles2.cardBody}
                                justifyContent={'space-between'}
                                alignItems={'center'}>
                                <HStack
                                    justifyContent={'flex-start'}
                                    space={5}
                                    alignItems={'center'}>
                                    <VStack
                                        ml={1}
                                        mr={-2}
                                        padding={2}
                                        borderRadius={'full'}
                                        style={handleActivity(
                                            e.data.activity,
                                            e.data.is_completed,
                                            e.data.inspection_date,
                                        )}>
                                        <Image
                                            source={Cal}
                                            style={styles2.icon}
                                            alt="btn"
                                        />
                                    </VStack>
                                    <VStack style={{width: '79%'}}>
                                        <Text
                                            bold
                                            style={styles2.textType}
                                            mb={-1}>
                                            {`Inspection Type: ${formateInspectionName(
                                                e.data.activity,
                                            )}`}
                                        </Text>
                                        <Text bold style={styles2.textType}>
                                            {e.data.name}
                                        </Text>
                                        <Text
                                            fontSize={'xs'}
                                            mt={-1}
                                            style={styles2.textDate}>
                                            Event Date:{' '}
                                            {formatDate(
                                                e.data.inspection_date,
                                                '/',
                                            )}
                                        </Text>
                                        <Text
                                            fontSize={'xs'}
                                            lineHeight={13}
                                            style={
                                                HandleRenterName(
                                                    e.data.tenants,
                                                    e.data.activity,
                                                ) == ''
                                                    ? {
                                                          ...styles2.textDate,
                                                          marginTop: -1,
                                                      }
                                                    : {
                                                          ...styles2.textDate,
                                                          marginTop: -1,
                                                          marginBottom: 5,
                                                      }
                                            }>
                                            {HandleRenterName(
                                                e.data.tenants,
                                                e.data.activity,
                                            )}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack
                                    space={2}
                                    alignSelf={'center'}
                                    justifyContent={'center'}>
                                    <Pressable
                                        onPress={() => {
                                            checkCompleted(
                                                e.data.id,
                                                e.data.is_completed,
                                            );
                                        }}>
                                        <Box
                                            style={styles2.btnBox}
                                            justifyContent={'center'}
                                            alignItems={'center'}>
                                            <Image
                                                source={Btn}
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    resizeMode: 'stretch',
                                                }}
                                                alt="btn"
                                            />
                                        </Box>
                                    </Pressable>
                                </HStack>
                            </HStack>
                        </Pressable>
                    );
                });
            }
        }
        return null;
    };

    const inspectionCreate = async (action: string) => {
        setModalVisible(false);

        if (selected) {
            navigation.navigate('InspectionDetails', {
                id: null,
                type: action,
                date: selected,
            });
        } else {
            setErrMsg({
                msg: 'Please Select A Date First!',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
        }
    };

    useEffect(() => {
        getAllInspectionData();
    }, []);

    const getAllInspectionData = async () => {
        try {
            const response = await apiInspectionListData();
            console.log('🚀 ~ getAllInspectionData ~ response:', response);
            if (response.status) {
                const {data} = response.result;
                setData(data);
            }
        } catch (error) {
            console.log('🚀 ~ getAllInspectionData ~ error:', error);
        }
    };
    const renderItem = ({item}: {item: InspectionItem}) => (
        <CommonInspectionCard
            data={item}
            showText={false}
            onPress={() => navigation.navigate('Areas', {id: item.id})}
        />
    );
    return (
        <>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}
            <View style={styles.mainContainer}>
                <View
                    style={{
                        flex: 2.8,
                        backgroundColor: '#321863',
                        borderBottomLeftRadius: 30,
                        borderBottomRightRadius: 30,
                    }}>
                    <View
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 35,
                            alignSelf: 'center',
                        }}>
                        <TouchableOpacity
                            onPress={() => navigation.openDrawer()}>
                            <Image
                                source={DrawerIcon}
                                alt="icon"
                                style={{
                                    height: 40,
                                    width: 40,
                                    resizeMode: 'contain',
                                }}
                            />
                        </TouchableOpacity>
                        <Text
                            style={{
                                color: '#ffffff',
                                fontSize: 14,
                                fontWeight: '700',
                                textTransform: 'capitalize',
                            }}>
                            Calendar
                        </Text>
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigate('SearchTab');
                                }}>
                                <Image
                                    source={SearchIcon}
                                    alt="icon"
                                    style={{
                                        height: 40,
                                        width: 40,
                                        resizeMode: 'contain',
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigate('Notification')}>
                                <Image
                                    source={NotificationIcon}
                                    alt="icon"
                                    style={{
                                        height: 40,
                                        width: 40,
                                        resizeMode: 'contain',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            style={{
                                position: 'absolute',
                                top: '15%',
                                zIndex: 2,
                            }}
                            status={errMsg.error ? 'danger' : 'success'}
                            my={2}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.600'}>
                                {errMsg.msg}
                            </Text>
                        </Alert>
                    )}

                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={new Date().toISOString().split('T')[0]}
                            hideExtraDays
                            firstDay={1}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#FFFFFF',
                                monthTextColor: '#FFFFFF',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                                dayTextColor: '#CDB8FF',
                                arrowColor: '#CDB8FF',
                                todayTextColor: '#FFFFFF',
                            }}
                            markedDates={markedDates}
                            markingType={'custom'}
                            onDayPress={(day: any) =>
                                setSelected(day.dateString)
                            }
                            onMonthChange={(date: any) => {
                                const currDate = new Date(date.dateString);
                                const year = currDate.getFullYear();
                                const month = currDate.getMonth();
                                const start_date = new Date(year, month, 1);
                                const end_date = new Date(year, month + 1, 0);

                                const event = {
                                    start_date: formateDate(start_date),
                                    end_date: formateDate(end_date),
                                };

                                getCalendarData(event);
                            }}
                        />
                    </View>
                    <View
                        style={{
                            height: 60,
                            width: '85%',
                            position: 'absolute',
                            bottom: -35,
                            alignSelf: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            style={{
                                width: '55%',
                                height: 50,
                                backgroundColor: '#9A47DB',
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#9A47DB',
                                borderWidth: 1,
                            }}>
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}>
                                Schedule Inspection
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: '40%',
                                height: 50,
                                backgroundColor: '#ffffff',
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#9A47DB',
                                borderWidth: 1,
                            }}>
                            <Text
                                style={{
                                    color: '#9A47DB',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}>
                                Add Task
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    height={'15%'}
                    mb={20}
                    my={5}
                    mt={10}
                    style={{backgroundColor: '#F2F2F2'}}>
                    {/* <View style={{...StyleSheet.absoluteFillObject}}>
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="light"
                            blurAmount={20}
                        />

                   
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(154, 70, 219, 0.3)', // #9A46DB + opacity
                            }}
                        />
                    </View> */}

                    <View style={{backgroundColor: '#F2F2F2'}}>
                        <FlatList
                            data={dataResult.inProcess}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingVertical: 10}}
                        />
                    </View>
                </ScrollView>
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
                                                        tintColor:
                                                            selectedType ===
                                                            option.value
                                                                ? '#9A46DB'
                                                                : '#B6AACF',
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
                            </VStack>
                        </Modal.Body>
                    </Modal.Content>
                </Modal>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        minHeight: '100%',
        backgroundColor: '#F2F2F2',
    },
    eventContainer: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 10,
        padding: 5,
        paddingTop: 15,
        minHeight: '100%',
    },
    content: {
        backgroundColor: 'rgba(155, 155, 155,0.1)',
        height: 80,
        borderRadius: 20,
        padding: 5,
        width: widthPercentageToDP('95%'),
    },
    text1: {
        fontSize: 12,
    },
    text2: {
        fontSize: 10,
    },
    text3: {
        fontSize: 10,
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 10,
        alignItems: 'center',
    },
    markContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 15,
        width: 15,
        borderRadius: 100,
    },
    markContainer2: {
        height: 10,
        width: 10,
        borderRadius: 100,
        backgroundColor: '#ffffff',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 30,
        backgroundColor: 'rgba(125,125,125,0.4)',
    },
    modalButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        // width: 80,
    },
});

const styles2 = StyleSheet.create({
    cardBody: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(200,200,200,0.6)',
    },
    modalButton: {
        backgroundColor: 'rgba(100,100,130,0.9)',
        height: 45,
        width: 80,
    },
    btnBox: {
        borderWidth: 3,
        borderColor: 'rgba(200,200,200,0.6)',
        borderRadius: 100,
        position: 'absolute',
        right: 7,
        top: -11,
    },
    textType: {
        fontSize: 12,
    },
    invite: {
        backgroundColor: 'rgba(255,110,7,0.9)',
    },
    scheduled: {
        backgroundColor: 'rgba(0,113,189,0.9)',
    },
    completed: {
        backgroundColor: 'rgba(15,152,0,0.9)',
    },
    textDate: {
        fontSize: 10,
        flexWrap: 'wrap',
        flex: 1,
    },
    icon: {
        height: 20,
        width: 20,
    },
    calendarContainer: {
        width: '90%',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 20,
    },
    mainView: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#F2F2F2',
    },
});

export default CalendarHome;
