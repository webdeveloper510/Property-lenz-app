import React, {useEffect, useState, useRef} from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    Linking,
} from 'react-native';
import {
    Text,
    Button,
    Box,
    HStack,
    ScrollView,
    VStack,
    Input,
    Alert,
    FormControl,
    Switch,
    CloseIcon,
    Modal,
} from 'native-base';
import {
    heightPercentageToDP,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {apiAddManager} from '@/apis/user';
import {warningTimer} from '@/constant/customHooks';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import CommanButton from '@/components/CommanButton';
import RBSheet from 'react-native-raw-bottom-sheet';
import {apiGetMyProperties} from '@/apis/property';
import {propertyGet} from '@/services/types';
// icons
import BackIcon from '@/assets/icon/btnBack.png';
import Hide from '@/assets/icon/hide.png';
import Show from '@/assets/icon/view.png';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import PhoneInputField from '@/components/PhoneInputField';
const AddManagers = ({navigation}: any): React.JSX.Element => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [cpass, setCpass] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<boolean>(false);
    const [view1, setView1] = useState<boolean>(false);
    const [all_accesss, setAll_Access] = useState('all');
    const [other, setOther] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [propertyData, setPropertyData] = useState<propertyGet | any>(null);
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
    const [property, setProperty] = useState('');
    const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );
    console.log('🚀 ~ AddManagers ~ selectedPermissions:', selectedPermissions);
    const [modalVisible, setModalVisible] = useState(false);
    const [propertyImage, setPropertyImage] = useState<any>('');
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });
    const [isChecked, setIsChecked] = useState(true);
    const refRBSheet = useRef();
    const secondSheetRef = useRef(null);
    const rolesData: string[] = [
        'Property Owner',
        'Manager',
        'Maintenance',
        'Office Staff',
        'Other',
    ];
    const USER_PERMISSIONS = {
        ADD_PROPERTY: 'ADD_PROPERTY',
        UPDATE_PROPERTY: 'UPDATE_PROPERTY',
        CREATE_INSPECTION: 'CREATE_INSPECTION',
        PERFORM_INSPECTION: 'PERFORM_INSPECTION',
        VIEW_INSPECTION_REPORT: 'VIEW_INSPECTION_REPORT',
        DELETE_INSPECTION: 'DELETE_INSPECTION',
        MANAGE_RENTER_CONNECTION: 'MANAGE_RENTER_CONNECTION',
        MANAGE_TEMPLATES: 'MANAGE_TEMPLATES',
        MANAGE_USERS: 'MANAGE_USERS',
    };

    const USER_PERMISSIONS_LABELS = {
        ADD_PROPERTY: 'Add Property',
        UPDATE_PROPERTY: 'Update Property',
        CREATE_INSPECTION: 'Create Inspection',
        PERFORM_INSPECTION: 'Perform Inspection',
        VIEW_INSPECTION_REPORT: 'View Inspection Reports',
        DELETE_INSPECTION: 'Delete Inspection',
        MANAGE_RENTER_CONNECTION: 'Manage Renter Connection',
        MANAGE_TEMPLATES: 'Manage Templates',
        MANAGE_USERS: 'Manage Users',
    };

    // === ROLE-WISE PERMISSIONS ===
    const USER_PERMISSIONS_LABELS_PROPERTY_OWNER = {
        PERFORM_INSPECTION: 'Perform Inspection',
    };

    const USER_PERMISSIONS_LABELS_MAINTENANCE = {
        PERFORM_INSPECTION: 'Perform Inspection',
        VIEW_INSPECTION_REPORT: 'View Inspection Reports',
    };

    const USER_PERMISSIONS_LABELS_FRONT_OFFICE = {
        ADD_PROPERTY: 'Add Property',
        UPDATE_PROPERTY: 'Update Property',
        CREATE_INSPECTION: 'Create Inspection',
        VIEW_INSPECTION_REPORT: 'View Inspection Reports',
        MANAGE_RENTER_CONNECTION: 'Manage Renter Connection',
    };

    const getPermissionsByRole = (role: string) => {
        switch (role) {
            case 'Property Owner':
                return Object.keys(USER_PERMISSIONS_LABELS_PROPERTY_OWNER);
            case 'Maintenance':
                return Object.keys(USER_PERMISSIONS_LABELS_MAINTENANCE);
            case 'office staff':
                return Object.keys(USER_PERMISSIONS_LABELS_FRONT_OFFICE);
            case 'Manager':
                // Manager has all permissions
                return Object.keys(USER_PERMISSIONS_LABELS);
            default:
                return Object.keys(USER_PERMISSIONS_LABELS);
        }
    };

    useEffect(() => {
        const defaultPermissions = getPermissionsByRole(role);
        setSelectedPermissions(defaultPermissions);
    }, [role]);

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key],
        );
    };

    const allKeysForRole = getPermissionsByRole('other');

    const isAllSelected =
        allKeysForRole.length > 0 &&
        allKeysForRole.every(key => selectedPermissions.includes(key));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...new Set(allKeysForRole)]);
        }
    };

    // const AddManager = async () => {
    //     if (
    //         email === '' ||
    //         password === '' ||
    //         cpass === '' ||
    //         firstName === '' ||
    //         lastName === '' ||
    //         role == 'Other' ? other === '' : role.trim() === '' 
    //     ) {
    //         if (password !== cpass) {
    //             setErrMsg({
    //                 message: "Password Does'nt Match.",
    //                 error: true,
    //                 show: true,
    //             });
    //             const timer = await warningTimer(3);
    //             timer && setErrMsg({message: '', error: false, show: false});
    //         } else {
    //             setErrMsg({
    //                 message: 'please fill all fields.',
    //                 error: true,
    //                 show: true,
    //             });
    //             const timer = await warningTimer(3);
    //             timer && setErrMsg({message: '', error: false, show: false});
    //         }
    //     } else {
    //         setIsLoading(true);
    //         const data = {
    //             first_name: firstName.trim(),
    //             last_name: lastName.trim(),
    //             email: email.toLowerCase().trim(),
    //             phone: phone.trim(),
    //             countryCode: countryCode,
    //             custom_role: role == 'Other' ? other : role.trim(),
    //             password: password.trim(),
    //             access_all_properties: all_accesss == 'all' ? 1 : 0,
    //             confirm_password: cpass.trim(),
    //             dp: propertyImage,
    //             status: 'Active',
    //             permissions: selectedPermissions.join(','),
    //             assign_properties: selectedProperties.join(','),
    //         };
    //         console.log('🚀 ~ AddManager ~ data:', data);
    //         const response = await apiAddManager(data);
    //         if (response.status) {
    //             navigation.goBack(null);
    //         } else {
    //             console.log('################=====>', response.message);
    //             setIsLoading(false);
    //             setErrMsg({message: response.message, error: true, show: true});
    //             const timer = await warningTimer(5);
    //             timer && setErrMsg({message: '', error: false, show: false});
    //         }
    //     }
    // };


    const AddManager = async () => {
    // 1. Check for basic required fields
    const isBasicInfoMissing =
        email === '' ||
        password === '' ||
        cpass === '' ||
        firstName === '' ||
        lastName === '' ||
        (role == 'Other' ? other === '' : role.trim() === '');
    
    // 2. Check for missing permissions
    const isPermissionMissing = selectedPermissions.length === 0;

    if (isBasicInfoMissing || isPermissionMissing) {
        
        if (isBasicInfoMissing) {
             // Handle missing fields first
            setErrMsg({
                message: 'Please fill all required fields.',
                error: true,
                show: true,
            });
        } else if (isPermissionMissing) {
            // New: Handle missing permissions
            setErrMsg({
                message: 'Please select at least one permission.',
                error: true,
                show: true,
            });
        }
        
    } else if (password !== cpass) {
        // Handle password mismatch separately and correctly
        setErrMsg({
            message: "Password Doesn't Match.",
            error: true,
            show: true,
        });
    } else {
        // Validation passed - proceed to API call
        setIsLoading(true);
        const data = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            countryCode: countryCode,
            custom_role: role == 'Other' ? other : role.trim(),
            password: password.trim(),
            access_all_properties: all_accesss == 'all' ? 1 : 0,
            confirm_password: cpass.trim(),
            dp: propertyImage,
            status: 'Active',
            permissions: selectedPermissions.join(','),
            assign_properties: selectedProperties.join(','),
        };
        console.log('🚀 ~ AddManager ~ data:', data);
        const response = await apiAddManager(data);
        if (response.status) {
            navigation.goBack(null);
        } else {
            console.log('################=====>', response.message);
            setIsLoading(false);
            setErrMsg({message: response.message, error: true, show: true});
            const timer = await warningTimer(5);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    }
    
    // Timer logic cleanup (applied to all error paths)
    if (isBasicInfoMissing || isPermissionMissing || password !== cpass) {
        const timer = await warningTimer(3);
        timer && setErrMsg({message: '', error: false, show: false});
    }
};
    useEffect(() => {
        getAllProperty();
    }, []);
    const getAllProperty = async () => {
        try {
            const response: any = await apiGetMyProperties();
            if (response.status) {
                setPropertyData(response.result);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedProperties(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id],
        );
    };

    const removeSelected = (id: number) => {
        console.log('🚀 ~ removeSelected ~ id:', id);

        setSelectedProperties(prev => prev.filter(item => item !== id));
    };
    const selectedItems = propertyData?.filter(item =>
        selectedProperties.includes(item.id),
    );

    const handleDocumentSelection = async () => {
        let options: any = {
            selectionLimit: 1,
            type: 'photo',
            quality: 0.7,
        };
        try {
            setModalVisible(false);
            const result: any = await launchImageLibrary(options, () => {});
            setPropertyImage({
                name: 'img.jpg',
                type: result.assets[0].type,
                size: result.assets[0].fileSize,
                uri:
                    Platform.OS === 'ios'
                        ? result.assets[0].uri.replace('file://', '')
                        : result.assets[0].uri,
            });
        } catch (err) {}
    };
    const handelCamera = async () => {
        let options: any = {
            cameraType: 'back',
            saveToPhotos: false,
            quality: 0.7,
        };
        try {
            const result: any = await launchCamera(options, () => {});
            if (result?.didCancel == true) {
                return;
            } else {
                setPropertyImage({
                    name: 'img.jpg',
                    type: result.assets[0].type,
                    size: result.assets[0].fileSize,
                    uri:
                        Platform.OS === 'ios'
                            ? result.assets[0].uri.replace('file://', '')
                            : result.assets[0].uri,
                });
            }
        } catch (err) {}
    };

    const cameraPermission = async () => {
        setModalVisible(false);
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

    return (
        <SafeAreaView>
            <View
                style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
                    justifyContent: 'space-between',
                    paddingBottom: 5,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    Add User
                </Text>
                <View></View>
            </View>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                enableAutomaticScroll={Platform.OS === 'ios'}
                keyboardShouldPersistTaps="handled"
                extraScrollHeight={100}
                extraHeight={20}>
                <View style={styles.mainContainer}>
                    <TextInputField
                        placeholder="Enter your name"
                        value={firstName}
                        onChangeText={setFirstName}
                        url={require('../../../assets/icon/user_2.png')}
                        label={'First Name'}
                    />
                    <TextInputField
                        placeholder="Enter your last name"
                        value={lastName}
                        onChangeText={setLastName}
                        url={require('../../../assets/icon/user_2.png')}
                        label={'Last Name'}
                    />

                    <TextInputField
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        url={require('../../../assets/icon/email.png')}
                        label={'Email'}
                    />
                    <PhoneInputField
                        placeholder="Enter your phone"
                        value={phone}
                        label={'Phone'}
                        onChangeText={setPhone}
                        onCallBack={(txt: any) => setCountryCode(txt)}
                    />
                    {/* <TextInputField
                        placeholder="Enter your phone"
                        value={phone}
                        onChangeText={setPhone}
                        url={require('../../../assets/icon/phone_2.png')}
                        label={'Phone'}
                    /> */}

                    <TextInputField
                        placeholder="* * * * * * * * *"
                        value={password}
                        onChangeText={setPassword}
                        url={require('../../../assets/icon/lock.png')}
                        label={'Password'}
                        secureTextEntry={view ? false : true}
                        isEye={true}
                        onClick={() => setView(!view)}
                        rightIcon={require('../../../assets/icon/eye_2.png')}
                    />
                    <TextInputField
                        placeholder="* * * * * * * * *"
                        value={cpass}
                        onChangeText={setCpass}
                        url={require('../../../assets/icon/lock.png')}
                        label={'Confirm Password'}
                        secureTextEntry={view1 ? false : true}
                        isEye={true}
                        onClick={() => setView1(!view1)}
                        rightIcon={require('../../../assets/icon/eye_2.png')}
                    />
                    <TextInputField
                        placeholder="Select your Role"
                        value={role}
                        onChangeText={setRole}
                        url={require('../../../assets/icon/role.png')}
                        label={'Role'}
                        isEye={true}
                        isDisable={true}
                        rightIcon={require('../../../assets/icon/drop_2.png')}
                        onClick={() => refRBSheet.current.open()}
                    />
                    {role == 'Other' && (
                        <TextInputField
                            placeholder="Enter other role"
                            value={other}
                            onChangeText={setOther}
                            url={require('../../../assets/icon/role.png')}
                            label={'Other Role'}
                        />
                    )}
                    {/* <View style={styles.status}>
                        <Text
                            style={{
                                fontSize: 16,
                                color: '#250959',
                                fontWeight: '600',
                            }}>
                            Status
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#250959',
                                    fontWeight: '400',
                                    paddingRight: 10,
                                }}>
                                Inactive
                            </Text>
                            <Switch
                                size={Platform.OS == 'ios' ? 'sm' : 'lg'}
                                offTrackColor={'#e1d0ee'}
                                offThumbColor={'#FFFFFF'}
                                onTrackColor={'#9A46DB'}
                                onThumbColor={'#FFFFFF'}
                                isChecked={isChecked}
                                onChange={() => {
                                    setIsChecked(!isChecked);
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#250959',
                                    fontWeight: '400',
                                    paddingLeft: 10,
                                }}>
                                Active
                            </Text>
                        </View>
                    </View> */}
                    <View
                        style={{
                            width: '90%',
                            height: 2,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                            marginVertical: 10,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#250959',
                            fontFamily: 'Gilroy',
                            fontWeight: '600',
                            padding: 20,
                        }}>
                        Profile Picture
                    </Text>
                    <View
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            marginBottom: 20,
                        }}>
                        <View style={{width: '45%', alignItems: 'center'}}>
                            <View
                                style={{
                                    width: 146,
                                    height: 146,
                                    borderWidth: 1,
                                    borderColor: '#2509594D',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <FastImage
                                    source={
                                        propertyImage.uri
                                            ? {uri: propertyImage?.uri}
                                            : require('../../../assets/icon/profile_2.png')
                                    }
                                    style={{
                                        width: 89,
                                        height: 89,
                                    }}
                                />
                            </View>
                        </View>
                        <View
                            style={{
                                width: '45%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            {!propertyImage.uri && (
                                <Text
                                    style={{
                                        color: '#2509594D',
                                        fontSize: 15,
                                        paddingBottom: 10,
                                    }}>
                                    No File Chosen
                                </Text>
                            )}

                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={{
                                    width: '100%',
                                    height: 41,
                                    borderWidth: 1,
                                    borderColor: '#2509594D',
                                    borderRadius: 10,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Image
                                    source={require('../../../assets/icon/upload_3.png')}
                                    style={{
                                        width: 13,
                                        height: 13,
                                        resizeMode: 'contain',
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: '#250959',
                                        paddingLeft: 5,
                                        fontFamily: 'Gilroy',
                                        fontWeight: '600',
                                    }}>
                                    Choose File
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={{
                            width: '90%',
                            height: 2,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                            marginVertical: 10,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#250959',
                            fontFamily: 'Gilroy',
                            fontWeight: '600',
                            padding: 20,
                        }}>
                        Property Access
                    </Text>
                    <View style={styles.radioButtonView}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => {
                                setAll_Access('all'), setSelectedProperties([]);
                            }}>
                            {all_accesss == 'all' && (
                                <View
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 50,
                                        backgroundColor: '#9A46DB',
                                    }}
                                />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.radioTitle}>
                            Access All Properties
                        </Text>
                    </View>
                    <View style={styles.radioButtonView}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setAll_Access('selected')}>
                            {all_accesss == 'selected' && (
                                <View
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 50,
                                        backgroundColor: '#9A46DB',
                                    }}
                                />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.radioTitle}>
                            Access Selected Properties
                        </Text>
                    </View>
                    {all_accesss == 'selected' && (
                        <TextInputField
                            placeholder="Select prorerty"
                            value={property}
                            isDisable={true}
                            url={require('../../../assets/icon/city_2.png')}
                            label={'prorerty'}
                            isEye={true}
                            rightIcon={require('../../../assets/icon/drop_2.png')}
                            onClick={() => secondSheetRef.current.open()}
                        />
                    )}
                    {selectedProperties.length > 0 &&
                        all_accesss == 'selected' && (
                            <View
                                style={{
                                    width: '90%',
                                    alignSelf: 'center',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                }}>
                                {selectedItems.map((item, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            width: '30%',
                                            height: 30,
                                            borderWidth: 1,
                                            borderColor: '#BF56FF',
                                            borderRadius: 10,
                                            justifyContent: 'center',
                                            margin: 5,
                                            // position: 'relative',
                                        }}>
                                        <TouchableOpacity
                                            style={styles.closeIcon}
                                            onPress={() =>
                                                removeSelected(item.id)
                                            }>
                                            <Image
                                                source={require('../../../assets/icon/close_2.png')}
                                                style={{width: 10, height: 10}}
                                            />
                                        </TouchableOpacity>
                                        <Text style={{textAlign: 'center'}}>
                                            {item.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    <View
                        style={{
                            width: '90%',
                            height: 2,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                            marginVertical: 10,
                            marginTop: 20,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#250959',
                            fontFamily: 'Gilroy',
                            fontWeight: '600',
                            padding: 20,
                        }}>
                        Permissions
                    </Text>
                    <View style={styles.radioButtonView}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={toggleSelectAll}>
                            {isAllSelected && (
                                <View
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: '#9A46DB',
                                        backgroundColor: '#9A46DB',
                                    }}
                                />
                            )}
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: isAllSelected ? '#250959' : '#555',
                                fontWeight: '500',
                                paddingLeft: 20,
                            }}>
                            Select All
                        </Text>
                    </View>

                    {Object.entries(USER_PERMISSIONS_LABELS).map(
                        ([key, label]) => {
                            const isSelected =
                                selectedPermissions.includes(key);
                            return (
                                <View key={key} style={styles.radioButtonView}>
                                    <TouchableOpacity
                                        style={styles.radioButton}
                                        onPress={() => togglePermission(key)}>
                                        {isSelected && (
                                            <View
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: 9,
                                                    borderWidth: 2,
                                                    borderColor: '#9A46DB',

                                                    backgroundColor: '#9A46DB',
                                                }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            color: isSelected
                                                ? '#250959'
                                                : '#555',
                                            fontWeight: '500',
                                            paddingLeft: 20,
                                        }}>
                                        {label}
                                    </Text>
                                </View>
                            );
                        },
                    )}
                    <VStack mt={3} space={3}>
                        {errMsg.show && (
                            <Alert
                                w="100%"
                                status={errMsg.error ? 'danger' : 'success'}>
                                <Text
                                    fontSize="md"
                                    color={
                                        errMsg.error ? 'red.500' : 'green.500'
                                    }>
                                    {errMsg.message}
                                </Text>
                            </Alert>
                        )}
                    </VStack>
                    <CommanButton
                        label={'Submit'}
                        isLoading={isLoading}
                        onCkick={AddManager}
                    />
                </View>
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
                            backgroundColor={'#ffffff'}
                            py={10}>
                            <Button
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderWidth: 1,
                                    borderRadius: 32,
                                    borderColor: '#9A46DB',
                                    height: 55,
                                    width: 120,
                                }}
                                onPress={handleDocumentSelection}>
                                <Text style={{color: '#9A46DB'}}> Gallery</Text>
                            </Button>
                            <Button
                                px={8}
                                py={2}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderWidth: 1,
                                    borderRadius: 32,
                                    borderColor: '#9A46DB',
                                    height: 55,
                                    width: 120,
                                }}
                                onPress={cameraPermission}>
                                <Text style={{color: '#9A46DB'}}>Camera</Text>
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                    {/* <Modal.Content>
                    <Modal.CloseButton />
                    <Modal.Body>
                        <Text fontSize={'lg'}>Photo From</Text>
                    </Modal.Body>
                    <Modal.Footer justifyContent={'space-around'}>
                        <Button
                            style={styles.modalButton}
                            onPress={handleDocumentSelection}>
                            Gallery
                        </Button>
                        <Button
                            style={styles.modalButton}
                            onPress={cameraPermission}>
                            Camera
                        </Button>
                    </Modal.Footer>
                </Modal.Content> */}
                </Modal>
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
                        {rolesData.map((item: string, index: number) => (
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('###########=====>', item);
                                    setRole(item),
                                        //   setPropertyType(item.id),
                                        refRBSheet.current.close();
                                }}>
                                <Text
                                    key={index}
                                    style={{padding: 10, color: '#9A46DB'}}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </RBSheet>
                <RBSheet
                    ref={secondSheetRef}
                    height={250}
                    openDuration={250}
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
                    <ScrollView>
                        {propertyData?.map((item: any, index: number) => {
                            const isSelected = selectedProperties.includes(
                                item.id,
                            );
                            return (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '60%',
                                    }}
                                    key={item.id}
                                    onPress={() => toggleSelection(item.id)}>
                                    <Text key={index} style={{padding: 5}}>
                                        {item?.name}
                                    </Text>
                                    {isSelected && (
                                        <Image
                                            source={require('../../../assets/icon/tick.png')}
                                            style={{
                                                width: 15,
                                                height: 10,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </RBSheet>
                <View style={{height: 105}} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        minHeight: heightPercentageToDP('100%'),
        alignSelf: 'center',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    passFormControl: {
        justifyContent: 'center',
        height: 'auto',
        width: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(210,210,210,0.4)',
    },
    passFormControlInner: {
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 'auto',
        width: '100%',
        borderWidth: 0,
    },
    formControl: {
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 'auto',
        width: '100%',
        borderRadius: 8,
    },
    passInput: {
        flex: 1,
        paddingLeft: 20,
        color: 'black',
        height: 45,
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        paddingLeft: 20,
        color: 'black',
        height: 45,
    },
    icon: {
        height: 20,
        width: 20,
        marginRight: 10,
    },
    loginButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        width: '50%',
        height: 55,
        borderRadius: 10,
    },
    status: {
        width: '90%',
        height: 65,
        borderRadius: 70,
        elevation: 3,
        backgroundColor: '#ffffff',
        alignSelf: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    radioButtonView: {
        width: '90%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#B598CB4D',
        height: 60,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: '#E0D7E6',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,
    },
    radioTitle: {
        color: '#250959',
        paddingLeft: 20,
        fontFamily: 'Gilroy',
        fontWeight: '600',
    },
    closeIcon: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: 'BF56FF',
        borderRadius: 20,
        position: 'absolute',
        top: -12,
        right: -12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default AddManagers;
