import React, {useEffect, useState, useRef} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {
    Text,
    Button,
    Box,
    HStack,
    VStack,
    ScrollView,
    Alert,
    Modal,
    Switch,
} from 'native-base';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {eventNames, warningTimer} from '@/constant/customHooks';
import {useAppSelector} from '@/state/hooks';
import {
    apiInspectionAdd,
    apiGetSpecificProperty,
    apiGetMyProperties,
    apiInspectionCheck,
} from '@/apis/property';
import {propertyGet} from '@/services/types';
import {apiAllStaff} from '@/apis/user';
import {apiGetLease} from '@/apis/lease';

// icon

import BackButton from '@/components/BackButton';
import RBSheet from 'react-native-raw-bottom-sheet';
import DropDwonModal from '@/components/DropDwonModal';
import CommanButton from '@/components/CommanButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import TextInputField from '@/components/TextInputField';
import moment from 'moment';
interface TenantInterface {
    id: number;
    tenant_id: number;
    tenant_last_name: string;
    tenant_first_name: string;
}
interface SelectedTenant {
    id: number;
    first_name: string;
    last_name: string;
}

const InspectionDetails = ({navigation}: any): React.JSX.Element => {
    const userData: any = useAppSelector(state => state.auth.userData);

    const [propertyData, setPropertyData] = useState<propertyGet | any>(null);

    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
    const [selectedPropertyname, setSelectedPropertyName] = useState<any>('');
    const [isVisable, setIsVisible] = useState(false);
    const [isVisable1, setIsVisible1] = useState(false);
    const [is_renter_self_led, setIs_renter_self_led] = useState(false);
    const [is_renter_present, setIs_renter_present] = useState(false);
    console.log(
        '🚀 ~ InspectionDetails ~ is_renter_present:',
        is_renter_present,
    );
    const [tenant, setTenant] = useState<SelectedTenant[] | any[]>([]);
    const [inspector, setInspector] = useState<any>({});

    const isFocused = useIsFocused();
    const [propertyType, setPropertyType] = useState<string>('');
    // console.log('🚀 ~ InspectionDetails ~ tenant:', tenant);
    const [tenantData, setTenantData] = useState<TenantInterface[] | any[]>([]);
    const [ispectorData, setInspectorData] = useState<any[]>([]);
    const [date, setDate] = useState(new Date());
    const [dueDate, setDueDate] = useState('');
    const [checkErr, setCheckErr] = useState({
        message: '',
        error: false,
        info: false,
        show: false,
    });
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });
    const [modalVisible, setModalVisible] = useState(false);

    const refRBSheet = useRef();

    const Name = (): string => {
        return `${userData?.first_name} ${
            userData?.last_name ? userData?.last_name : ''
        }`;
    };

    const [date1, setDate1] = useState(new Date());

    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const route = useRoute();
    const pId: any = route.params;
    const pIdFromRoute = route.params?.id;
    console.log('🚀 ~ InspectionDetails ~ pId:', pIdFromRoute);

    const getDetails = async () => {
        const response = await apiGetSpecificProperty(pId?.id);
        if (response.status) {
            setPropertyData(response.result);
            setLoading(false);
        }
    };

    const getAllInspector = async () => {
        try {
            const response: any = await apiAllStaff();
            if (response.status) {
                setInspectorData(response.result.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllProperty = async () => {
        try {
            const response: any = await apiGetMyProperties();
            if (response.status) {
                setPropertyData(response.result);
                if (response.result?.length > 0 && pIdFromRoute) {
                    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@===>');
                    const initialProperty = response.result.find(
                        property => property.id === pIdFromRoute,
                    );
                    if (initialProperty) {
                        console.log(
                            'Property found and set from route:',
                            initialProperty.name,
                        );
                        setSelectedProperty(initialProperty.id);
                        setSelectedPropertyName(initialProperty.name);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const inspectionCheck = async () => {
        let tenantIds = tenant.map((t: any) => t.id);
        const data = {
            property_id: pId.id ? propertyData?.id : selectedProperty,
            tenant_id: tenantIds[tenantIds.length - 1],
        };

        const response: any = await apiInspectionCheck(data);
        if (response.status) {
            if (
                response.result.lease == true &&
                response.result.multiTenant == false
            ) {
            } else if (
                response.result.multiTenant == true &&
                response.result.lease == false
            ) {
                setModalVisible(true);
            } else if (
                response.result.lease == false &&
                response.result.multiTenant == false
            ) {
                let pID = pId.id ? propertyData?.id : selectedProperty;
                setCheckErr({
                    message: 'Please Create A Renter Connection First!',
                    error: true,
                    info: false,
                    show: true,
                });
                const timer = await warningTimer(1);
                timer && setErrMsg({message: '', error: false, show: false});
                timer && navigation.navigate('TenantHome', pID);
            }
        } else {
            setErrMsg({
                message: 'Something Went Wrong',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };
    const getTenantViaLease = async () => {
        if (pId?.id == null && selectedProperty == null) {
            setCheckErr({
                message: 'Please Select A Property First',
                error: true,
                info: false,
                show: true,
            });
            const timer = await warningTimer(3);
            timer &&
                setCheckErr({
                    message: '',
                    error: false,
                    info: false,
                    show: false,
                });
            return;
        }
        setLoading(true);
        const response = await apiGetLease(
            pId?.id ? pId?.id : selectedProperty,
        );

        if (response.status) {
            setTenantData([]);
            // const filteredData = Object.values(
            //     response.result.data.reduce((acc: any, item: any) => {
            //         acc[item.tenant_id] = item;
            //         return acc;
            //     }, {}),
            // );

            setTenantData(response.result.data || []);
            setLoading(false);
        }
    };

    const inspectionAdd = async () => {
        if (
            is_renter_present &&
            pId.type !== 'INTERMITTENT_INSPECTION' &&
            pId.type !== 'MANAGER_INSPECTION' &&
            tenant.length == 0
        ) {
            setErrMsg({
                message: 'Please Select A Renter',
                error: true,
                show: true,
            });
            const timer = await warningTimer(3);
            timer && setErrMsg({message: '', error: false, show: false});
            return;
        }

        if (!inspector || !inspector.id) {
            setErrMsg({
                message: 'Please select an Inspector',
                error: true,
                show: true,
            });

            const timer = await warningTimer(3);
            timer && setErrMsg({message: '', error: false, show: false});
            return; // 🚫 Stop execution
        }
        setIsLoading(true);
        console.log(
            '###############################123',
            selectedProperty,
            pId,
        );
        let tenantIds = tenant.map((t: any) => t.id);
        console.log('🚀 ~ inspectionAdd ~ tenantIds:', tenantIds);
        let body = {
            property_id: selectedProperty,
            activity: pId.type,
            tenant_id: tenantIds,
            inspected_by: inspector.id,
            is_renter_self_led: is_renter_self_led ? 1 : 0,
            is_renter_present: is_renter_present ? 1 : 0,
            inspection_date: moment(date).format('YYYY-MM-DD'),
            inspection_due_date: moment(date1).format('YYYY-MM-DD'),
        };
        console.log('🚀 ~ inspectionAdd ~ body:', body);

        const response = await apiInspectionAdd(body);
        console.log('🚀 ~ inspectionAdd ~ response:', response);
        if (response.status) {
            // navigation.navigate('Home', response.result.property_id);
            navigation.navigate('Details', response.result.property_id);

            setIsLoading(false);
        } else {
            setIsLoading(false);
            setErrMsg({message: response.message, error: true, show: true});
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };

    // useEffect(() => {
    //     if (propertyData?.length > 0 && pIdFromRoute) {
    //         console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@===>")
    //         const initialProperty = propertyData.find(
    //             (property) => property.id === pIdFromRoute
    //         );
    //         if (initialProperty) {
    //             console.log('Property found and set from route:', initialProperty.name);
    //             setSelectedProperty(initialProperty.id);
    //             setSelectedPropertyName(initialProperty.name);
    //         }
    //     }
    // }, [propertyData, pIdFromRoute]);

    useEffect(() => {
        getAllInspector();

        getAllProperty();

        // const currentDate = new Date();
        // const formattedDate = currentDate.toISOString().split('T')[0];
        // pId?.date == null ? setDate(formattedDate) : setDate(pId.date);
    }, []);

    useEffect(() => {
        let baseDate;

        if (pId?.date) {
            // Convert pId.date ("2025-11-27") to Date object
            baseDate = new Date(pId.date);
        } else {
            // Use current date
            baseDate = new Date();
        }

        // Set main date
        setDate(baseDate);

        // Create copy for grace date
        const graceDate = new Date(baseDate);
        graceDate.setDate(graceDate.getDate() + 3);

        setDate1(graceDate);
    }, [pId]);

    useEffect(() => {
        if (selectedProperty != null) {
            getTenantViaLease();
        }
    }, [selectedProperty]);
    useEffect(() => {
        if (isFocused && pId?.id) {
            getTenantViaLease();
        }
        setCheckErr({message: '', error: false, info: false, show: false});
    }, [isFocused]);

    useEffect(() => {
        if (tenant.length > 0) {
            inspectionCheck();
        }
    }, [tenant]);

    const onTenantSet = (data: TenantInterface) => {
        const valueToAdd = {
            id: data.tenant_id,
            first_name: data.tenant_first_name,
            last_name: data.tenant_last_name,
        };
        setTenant(prevTenant => {
            const exists = prevTenant.some(t => t.id === data.tenant_id);
            return exists ? prevTenant : [...prevTenant, valueToAdd];
        });
    };
    const onTenantRemove = (ID: number) => {
        setTenant(tenant.filter(item => item.id !== ID));
    };
    const toggleModal = () => {
        setTenant(prevTenants => prevTenants.slice(0, -1));
        setModalVisible(!modalVisible);
    };
    const handlePropertyError = async () => {
        // onClose();
        if (pId?.id == null && selectedProperty == null) {
            setCheckErr({
                message: 'Please Select A Property First',
                error: true,
                info: false,
                show: true,
            });
            const timer = await warningTimer(3);
            timer &&
                setCheckErr({
                    message: '',
                    error: false,
                    info: false,
                    show: false,
                });
            return;
        }
        navigation.navigate('TenantAdd', {
            PropertyId: pId?.id ? pId?.id : selectedProperty,
        });
    };

    const onChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setOpen(false); // close on cancel
            return;
        }
        const currentDate = selectedDate || date;
        // setOpen(Platform.OS === 'ios');
        setOpen(false);
        setDate(currentDate);
        const grace = new Date(currentDate);
        grace.setDate(grace.getDate() + 3);
        setDate1(grace);
    };
    const onChange1 = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setOpen1(false); // close on cancel
            return;
        }

        const currentDate = selectedDate || date;
        setOpen1(false);
        setDate1(currentDate);
    };
    return (
        <SafeAreaView>
            <View
                style={{
                    width: '90%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    alignSelf: 'center',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
                    paddingBottom: 5,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    {eventNames(pId.type)}
                </Text>
                <View></View>
            </View>
            <ScrollView
                style={{height: hp('100%'), backgroundColor: '#F2F2F2'}}>
                <Box style={styles.mainContainer}>
                    <Modal
                        isOpen={modalVisible}
                        onClose={() => {
                            toggleModal();
                        }}
                        justifyContent="center"
                        size="xl">
                        <Modal.Content>
                            <Modal.CloseButton />
                            <Modal.Header>Associate This Tenant?</Modal.Header>
                            <Modal.Body>
                                <Text>
                                    If You Want To Associate This Renter You
                                    Have Make Renter Connection For this Renter!
                                </Text>
                            </Modal.Body>
                            <Modal.Footer justifyContent={'space-around'}>
                                <Button
                                    style={{
                                        ...styles.modalButton,
                                        backgroundColor: 'rgba(225,20,40,0.9)',
                                    }}
                                    onPress={() => {
                                        toggleModal();
                                    }}>
                                    No
                                </Button>
                                <Button
                                    style={{
                                        ...styles.modalButton,
                                        width: 'auto',
                                    }}
                                    onPress={() => {
                                        navigation.navigate(
                                            'TenantHome',
                                            pId.id
                                                ? propertyData?.id
                                                : selectedProperty,
                                        );
                                        setModalVisible(false);
                                    }}>
                                    Create Connection
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>

                    <>
                        <TextInputField
                            placeholder="Choose Property"
                            value={selectedPropertyname}
                            isDisable={true}
                            url={require('../../../assets/icon/home_2.png')}
                            label={'Property'}
                            isEye={true}
                            onClick={() => {
                                // if (!propertyData || propertyData.length === 0)
                                //     return;
                                refRBSheet.current.open();
                            }}
                            rightIcon={require('../../../assets/icon/drop_2.png')}
                            uppercase={true}
                        />
                        <HStack space={3} style={styles.continer21}>
                            <Text
                                bold
                                color={'#250959'}
                                pl={3}
                                style={{fontSize: 16}}>
                                Completed{'\n'} by
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
                                    User
                                </Text>
                                <Switch
                                    size={Platform.OS == 'ios' ? 'sm' : 'lg'}
                                    onTrackColor={'#9A46DB'}
                                    onThumbColor={'#ffffff'}
                                    offTrackColor="#B598CB"
                                    onChange={() => {
                                        setIs_renter_self_led(
                                            !is_renter_self_led,
                                        );
                                        setIs_renter_present(true);
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '400',
                                        paddingLeft: 10,
                                    }}>
                                    Renter
                                </Text>
                            </HStack>
                        </HStack>

                        <View style={{height: 12}} />
                        <HStack space={3} style={styles.continer21}>
                            <Text
                                bold
                                color={'#250959'}
                                pl={3}
                                style={{fontSize: 16}}>
                                Renter{'\n'}Present
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
                                    No
                                </Text>
                                <Switch
                                    size={Platform.OS == 'ios' ? 'sm' : 'lg'}
                                    onTrackColor={'#9A46DB'}
                                    onThumbColor={'#ffffff'}
                                    offTrackColor="#B598CB"
                                    isChecked={is_renter_present}
                                    onChange={() => {
                                        if (is_renter_self_led) {
                                            setIs_renter_present(true);
                                        } else {
                                            setIs_renter_present(
                                                !is_renter_present,
                                            );
                                        }
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '400',
                                        paddingLeft: 10,
                                    }}>
                                    Yes
                                </Text>
                            </HStack>
                        </HStack>

                        <TextInputField
                            placeholder="Select Inspector Name"
                            value={`${
                                inspector.first_name
                                    ? inspector.first_name +
                                      ' ' +
                                      inspector.last_name
                                    : ''
                            }`}
                            isDisable={true}
                            url={require('../../../assets/icon/user_2.png')}
                            label={'Inspector Name'}
                            isEye={true}
                            onClick={() => {
                                setIsVisible1(true);
                            }}
                            rightIcon={require('../../../assets/icon/drop_2.png')}
                        />
                        <TextInputField
                            placeholder="Search and select renter"
                            value={`${tenant
                                .map(
                                    (t: any) =>
                                        `${t.first_name} ${t.last_name}`,
                                )
                                .join(', ')}`}
                            isDisable={true}
                            url={require('../../../assets/icon/user_2.png')}
                            label={'Renter Name'}
                            isEye={true}
                            onClick={() => {
                                setIsVisible(true);
                            }}
                            rightIcon={require('../../../assets/icon/drop_2.png')}
                        />
                        <TextInputField
                            placeholder="mm/dd/yyyy"
                            value={moment(date).format('MM/DD/YYYY')}
                            isDisable={true}
                            url={require('../../../assets/icon/calender_3.png')}
                            label={'Inspection Date'}
                            isEye={true}
                            onClick={() => {
                                setOpen(true);
                            }}
                            rightIcon={require('../../../assets/icon/right_2.png')}
                        />
                        {open && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChange}
                            />
                        )}
                        <TextInputField
                            placeholder="mm/dd/yyyy"
                            value={moment(date1).format('MM/DD/YYYY')}
                            isDisable={true}
                            url={require('../../../assets/icon/calender_3.png')}
                            label={'Grace Period'}
                            isEye={true}
                            onClick={() => {
                                setOpen1(true);
                            }}
                            rightIcon={require('../../../assets/icon/right_2.png')}
                        />

                        {open1 && (
                            <DateTimePicker
                                value={date1}
                                mode="date"
                                display="default"
                                onChange={onChange1}
                            />
                        )}
                        {/* <VStack space={1} style={styles.formContainer}>
                                <TouchableOpacity
                                    style={styles.dropdownView}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (pId?.id) return;
                                        if (
                                            !propertyData ||
                                            propertyData.length === 0
                                        )
                                            return;
                                        refRBSheet.current.open();
                                    }}>
                                    <Text style={styles.label}>
                                        Property Name
                                    </Text>

                                    <View style={styles.row}>
                                        <Text style={styles.valueText}>
                                            {pId?.id
                                                ? propertyData?.find(
                                                      item =>
                                                          item.id === pId.id,
                                                  )?.name || '---'
                                                : propertyData?.length == 0
                                                ? 'No Property Found'
                                                : selectedPropertyname ||
                                                  'Choose Property'}
                                        </Text>

                                        {!pId?.id &&
                                            propertyData?.length > 0 && (
                                                <Image
                                                    source={require('../../../assets/icon/drop_2.png')}
                                                    style={styles.icon}
                                                    resizeMode="contain"
                                                />
                                            )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownView}
                                    activeOpacity={0.8}
                                    onPress={() => setIsVisible(true)}>
                                    <Text style={styles.label}>
                                        Renter Name
                                    </Text>

                                    <View style={styles.row}>
                                        <Text style={styles.valueText}>
                                            {tenant
                                                ? `${tenant.tenant_first_name} ${tenant.tenant_last_name}`
                                                : 'Choose Renter'}
                                        </Text>

                                        <Image
                                            source={require('../../../assets/icon/drop_2.png')}
                                            style={styles.icon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownView}
                                    activeOpacity={0.8}>
                                    <Text style={styles.label}>
                                        Inspection Date
                                    </Text>

                                    <View style={styles.row}>
                                        <Text style={styles.valueText}>
                                            {formatDate(date, '/') ?? ''}
                                        </Text>

                                        <Image
                                            source={require('../../../assets/icon/calender.png')}
                                            style={styles.icon}
                                            resizeMode="contain"
                                            tintColor={'#250959'}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownView}
                                    activeOpacity={0.8}
                                    onPress={() => setIsVisible1(true)}>
                                    <Text style={styles.label}>
                                        Inspector Name
                                    </Text>

                                    <View style={styles.row}>
                                        <Text style={styles.valueText}>
                                            Choose Inspector
                                        </Text>

                                        <Image
                                            source={require('../../../assets/icon/drop_2.png')}
                                            style={styles.icon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </VStack> */}
                    </>

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
                    <View style={{height: 20}} />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            width: '90%',
                        }}>
                        <CommanButton
                            width={'48%'}
                            label={'Cancel'}
                            onCkick={() => navigation.goBack()}
                            color={'#ffffff'}
                            titleColor={'#9945DA'}
                        />
                        <CommanButton
                            width={'48%'}
                            label={'Create Inspection'}
                            isLoading={isLoading}
                            onCkick={() => inspectionAdd()}
                        />
                    </View>

                    <View style={{height: Platform.OS == 'ios' ? 100 : 60}} />
                </Box>

                {isVisable && (
                    <DropDwonModal
                        visible={isVisable}
                        label="Renter Name"
                        placeholder="Choose Renter"
                        listType="Renters List"
                        data={tenantData}
                        isRanter={true}
                        onSelect={item => onTenantSet(item)}
                        onClose={() => setIsVisible(false)}
                        onClear={() => setIsVisible(false)}
                        onCreate={() => {
                            handlePropertyError(), setIsVisible(false);
                        }}
                    />
                )}
                {isVisable1 && (
                    <DropDwonModal
                        label="Inspector Name"
                        placeholder="Choose Inspector"
                        listType="Staff List"
                        visible={isVisable1}
                        isRanter={false}
                        data={ispectorData}
                        onSelect={(item: any) => setInspector(item)}
                        onClose={() => setIsVisible1(false)}
                        onClear={() => setIsVisible1(false)}
                        onApply={() => setIsVisible1(false)}
                    />
                )}
                <RBSheet
                    ref={refRBSheet}
                    useNativeDriver={false}
                    draggable={true}
                    customStyles={{
                        wrapper: {
                            backgroundColor: 'transparent',
                        },
                        draggableIcon: {
                            backgroundColor: '#000',
                        },
                        container: {
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 16,
                            backgroundColor: '#ffffff',
                        },
                    }}
                    customModalProps={{
                        animationType: 'slide',
                        statusBarTranslucent: true,
                    }}
                    customAvoidingViewProps={{
                        enabled: false,
                    }}>
                    <View
                        style={{
                            flex: 1,
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                        }}>
                        <ScrollView>
                            {propertyData?.length > 0
                                ? propertyData?.map((item: any, i: number) => {
                                      return (
                                          <TouchableOpacity
                                              key={i}
                                              onPress={() => {
                                                  setSelectedProperty(item.id),
                                                      refRBSheet.current.close(),
                                                      setSelectedPropertyName(
                                                          item.name,
                                                      );
                                              }}
                                              style={{padding: 10}}>
                                              <Text
                                                  style={{
                                                      color: '#9A46DB',
                                                      textTransform:
                                                          'uppercase',
                                                  }}>
                                                  {item.name}
                                              </Text>
                                          </TouchableOpacity>
                                      );
                                  })
                                : null}
                        </ScrollView>
                    </View>
                </RBSheet>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        paddingBottom: 0,
        backgroundColor: '#F2F2F2',
        minHeight: hp('100%'),
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    formContainer: {
        borderWidth: 1,
        borderColor: '#BF56FF',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 20,
        paddingBottom: 10,
    },
    inputContiner: {
        alignItems: 'center',
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: '#fff',
        borderRadius: 0,
        minHeight: 45,
    },
    select: {
        flex: 1,
        width: '100%',
    },
    textAreaMain: {
        backgroundColor: 'rgba(235,235,235,0.7)',
        borderRadius: 10,
    },
    textInputContiner: {
        justifyContent: 'flex-start',
    },
    textInput: {
        width: '100%',
        borderWidth: 0,
        borderColor: 'none',
    },
    textArea: {
        width: '100%',
        borderWidth: 0,
        borderColor: 'transparent',
        height: 50,
    },
    modalOptions: {
        flex: 1,
        padding: 5,
        borderRadius: 10,
        height: 40,
    },
    modalButton: {
        // backgroundColor: 'rgba(10,129,189,0.7)',
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: 80,
    },
    footer: {
        marginLeft: -20,
        marginRight: -20,
        height: 100,
        backgroundColor: 'rgba(10,113,199,0.9)',
        position: 'relative',
    },
    footerShadow: {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundColor: 'rgba(10,113,199,0.9)',
        padding: 5,
        elevation: 3,
    },
    footerBtn: {
        backgroundColor: '#fff',
        width: '40%',
        height: 50,
        borderRadius: 10,
    },
    continer21: {
        backgroundColor: '#E9DDF0',
        padding: 10,
        height: 80,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
    },
    dropdownView: {
        backgroundColor: '#F3F3F5',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginHorizontal: 10,
        marginTop: 10,
    },
    label: {
        fontSize: 10,
        color: '#250959',
        marginBottom: 4,
        fontWeight: '400',
        fontFamily: 'Gilroy-Regular',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        color: '#250959',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Gilroy-SemiBold',
    },
    icon: {
        width: 10,
        height: 10,
        tintColor: '#250959',
        position: 'absolute',
        right: 0,
        top: -12,
    },
    boxView: {
        flexDirection: 'row', // Arrange children horizontally
        alignItems: 'center', // Vertically align items in the center
        backgroundColor: '#fff', // White background for the item
        borderRadius: 12, // Rounded corners for the entire item
        paddingVertical: 12, // Vertical padding
        paddingHorizontal: 10, // Horizontal padding
        // Spacing from screen edges
        marginVertical: 5, // Spacing between multiple items if in a list
        // Optional: Add shadow for iOS
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Optional: Add elevation for Android (simulates shadow)
        elevation: 2,
        borderColor: '#eee', // A light grey border to match the image
        borderWidth: 1,
    },
    iconContainer: {
        width: 40, // Fixed width for the rounded icon
        height: 40, // Fixed height for the rounded icon
        borderRadius: 12, // Half of width/height to make it a circle
        backgroundColor: '#f0f0f0', // Light grey background for the icon circle
        justifyContent: 'center', // Center content (the letter) horizontally
        alignItems: 'center', // Center content (the letter) vertically
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#E5DCED', // Space between the icon and the text
    },
    iconText: {
        fontSize: 18,
        fontWeight: 'bold', // Deep purple color for the 'N'
    },
    descriptionText: {
        fontSize: 13,
        color: '#250959',
        fontFamily: 'Gilroy',
        fontWeight: '500',
    },
    CalenderView: {
        width: '99%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginVertical: 10,
        justifyContent: 'space-between',
        height: 66,
        borderRadius: 15,
        padding: 10,
    },
});

export default InspectionDetails;
