import React, {useEffect, useState, useRef} from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native';
import {
    Text,
    Button,
    Box,
    Image,
    HStack,
    VStack,
    FormControl,
    Input,
    Alert,
    Select,
    Switch,
    Modal,
} from 'native-base';
import {useRoute} from '@react-navigation/native';
import BackIcon from '@/assets/icon/btnBack.png';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {warningTimer} from '@/constant/customHooks';
import {apiUpdateManager, apiGetUserById} from '@/apis/user';
import {useAppDispatch} from '@/state/hooks';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import CommanButton from '@/components/CommanButton';
import RBSheet from 'react-native-raw-bottom-sheet';
import {apiGetMyProperties} from '@/apis/property';
import {propertyGet} from '@/services/types';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import PhoneInputField from '@/components/PhoneInputField';
import {ImageBaseUrl} from '@/constant/constant';
import {showLoader, hideLoader} from '@/state/loaderSlice';
const Edit = ({navigation}: any): React.JSX.Element => {
    const route = useRoute();
    const RoutePrams: any = route.params;
    const dispatch = useAppDispatch();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [status, setStatus] = useState('');
    const [cpass, setCpass] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<boolean>(false);
    const [view1, setView1] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState(false);
    const [propertyData, setPropertyData] = useState<propertyGet | any>(null);
    const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [propertyImage, setPropertyImage] = useState<any>({
        uri: '',
    });

    const [property, setProperty] = useState('');
    const refRBSheet = useRef();
    const secondSheetRef = useRef(null);
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });
    const defaultStatus = [
        {label: 'Active', value: 'ACTIVE'},
        {label: 'Inactive', value: 'INACTIVE'},
    ];
    const [all_accesss, setAll_Access] = useState('all');
    const [other, setOther] = useState('');

    const rolesData: string[] = [
        'Property Owner',
        'Manager',
        'Maintenance',
        'office staff',
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
        setSelectedPermissions(
            JSON.stringify(defaultPermissions).replace(/, /g, ','),
        );
    }, [role]);

    useEffect(() => {
        dispatch(showLoader());
        getUserById();
    }, [RoutePrams]);
    const getUserById = async () => {
        try {
            const response = await apiGetUserById(RoutePrams.id);
            if (response.status) {
                const data = response.result;
                setFirstName(data?.first_name);
                setLastName(data?.last_name);
                setEmail(data?.email);
                setPhone(data?.phone);
                setRole(data?.custom_role);
                setStatus(data?.status);
                setPropertyImage({uri: `${ImageBaseUrl}${data?.dp}`});
                setAll_Access(
                    data?.user_permissions.access_all_properties == 1
                        ? 'all'
                        : 'selected',
                );
                setSelectedProperties(data?.assign_properties);
                // FIX: Convert string to array if needed
                let perms = data?.user_permissions?.permissions;

                if (typeof perms === 'string') {
                    try {
                        perms = JSON.parse(perms);
                    } catch (e) {
                        perms = [];
                    }
                }

                setSelectedPermissions(perms || []);

                setCountryCode(data?.country_code);
            }
            dispatch(hideLoader());
        } catch (error) {
            console.log('🚀 ~ getUserById ~ error:', error);
            dispatch(hideLoader());
        }
    };

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key],
        );
    };
    // const EditManager = async () => {
    //     setIsLoading(true);
    //     const data = {
    //         id: RoutePrams.id,
    //         first_name: firstName.trim(),
    //         last_name: lastName.trim(),
    //         email: email.toLowerCase().trim(),
    //         status: isChecked ? 'ACTIVE' : 'INACTIVE',
    //         custom_role: role == 'Other' ? other : role.trim(),
    //         phone: phone.trim(),
    //         type: role,
    //         access_all_properties: all_accesss == 'all' ? 1 : 0,
    //         dp: propertyImage.name ? propertyImage : null,
    //         permissions: selectedPermissions.join(','),
    //         assign_properties: selectedProperties.join(','),
    //         country_code: countryCode,
    //     };

    //     const response = await apiUpdateManager(data);
    //     if (response.status) {
    //         navigation.goBack(null);
    //     } else {
    //         setIsLoading(false);
    //         setErrMsg({
    //             message: 'Something Went Wrong.',
    //             error: true,
    //             show: true,
    //         });
    //         const timer = await warningTimer(3);
    //         timer && setErrMsg({message: '', error: false, show: false});
    //     }
    // };


    const EditManager = async () => {
    // Define an array of fields that are mandatory
    const requiredFields = [
        firstName,
        lastName,
        email,
        phone,
    ];

    // Check if any required text field is empty
    const isRequiredFieldMissing = requiredFields.some(field => field.trim() === '');
    
    // Check if the custom role is mandatory and missing (handles 'Other' role)
    const isRoleMissing = role === 'Other' ? other.trim() === '' : role.trim() === '';


    const isPermissionMissing = selectedPermissions.length === 0;

    // --- Validation Logic ---

    if (isRequiredFieldMissing || isRoleMissing || isPermissionMissing) {
        let message = '';

        if (isRequiredFieldMissing || isRoleMissing) {
            message = 'Please fill all mandatory fields (Name, Email, Phone, Role).';
        } else if (isPermissionMissing) {
            message = 'Please select at least one permission.';
        }

        setErrMsg({
            message: message,
            error: true,
            show: true,
        });
        
        // Use the warning timer logic
        const timer = await warningTimer(3);
        timer && setErrMsg({message: '', error: false, show: false});

        setIsLoading(false); // Stop loading if validation fails
        return; // Exit the function if validation fails
    }

    setIsLoading(true);
    const data = {
        id: RoutePrams.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        status: isChecked ? 'ACTIVE' : 'INACTIVE',
        custom_role: role == 'Other' ? other : role.trim(),
        phone: phone.trim(),
        type: role,
        access_all_properties: all_accesss == 'all' ? 1 : 0,
        // Only send the image if a new one was selected (i.e., propertyImage has a name property)
        dp: propertyImage.name ? propertyImage : null, 
        permissions: selectedPermissions.join(','),
        assign_properties: selectedProperties.join(','),
        country_code: countryCode,
    };

    const response = await apiUpdateManager(data);
    if (response.status) {
        navigation.goBack(null);
    } else {
        setIsLoading(false);
        setErrMsg({
            message: response.message || 'Something Went Wrong.', // Display specific message if available
            error: true,
            show: true,
        });
        const timer = await warningTimer(3);
        timer && setErrMsg({message: '', error: false, show: false});
    }
};
    useEffect(() => {
        if (RoutePrams.status == 'ACTIVE') {
            setIsChecked(true);
        }
    }, [RoutePrams]);

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

    const allKeysForRole = getPermissionsByRole('other');
    console.log("🚀 ~ Edit ~ allKeysForRole:", allKeysForRole)

    const isAllSelected =
        allKeysForRole.length > 0 &&
        allKeysForRole.every(key => selectedPermissions.includes(key));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedPermissions([]);
        } else {
            console.log("############======>")
            setSelectedPermissions([...new Set(allKeysForRole)]);
        }
    };
    return (
        <SafeAreaView style={{flex: 1}}>
            <View
                style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
                    justifyContent: 'space-between',
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        flex: 1,
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        textAlign: 'center',
                    }}>
                    Edit User
                </Text>
                <View style={{width: 40}} />
            </View>
            <ScrollView style={{flex: 1}}>
                <View style={styles.mainContainer}>
                    <TextInputField
                        placeholder="Enter your name"
                        value={firstName}
                        onChangeText={setFirstName}
                        url={require('../../../assets/icon/user_3.png')}
                        label={'First Name*'}
                    />
                    <TextInputField
                        placeholder="Enter your last name"
                        value={lastName}
                        onChangeText={setLastName}
                        url={require('../../../assets/icon/user_3.png')}
                        label={'Last Name*'}
                    />

                    <TextInputField
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        url={require('../../../assets/icon/email.png')}
                        label={'Email*'}
                        isDisable={true}
                    />
                    {/* <TextInputField
                        placeholder="Enter your phone"
                        value={phone}
                        onChangeText={setPhone}
                        url={require('../../../assets/icon/phone_2.png')}
                        label={'Phone*'}
                    /> */}
                    <PhoneInputField
                        placeholder="Enter your phone"
                        value={phone}
                        label={'Phone'}
                        onChangeText={setPhone}
                        onCallBack={(txt: any) => setCountryCode(txt)}
                    />
                    {/* <TextInputField
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
                    /> */}
                    <TextInputField
                        placeholder="Enter your Role"
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
                    <View style={styles.status}>
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
                                }}>
                                Active
                            </Text>
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
                            onPress={() => {setAll_Access('all'),setSelectedProperties([])}}>
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
                    {selectedProperties.length > 0 && (
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
                                        onPress={() => removeSelected(item.id)}>
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
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.500'}>
                                {errMsg.message}
                            </Text>
                        </Alert>
                    )}

                    <View
                        style={{
                            // position: 'absolute',
                            width: '100%',
                            bottom: Platform.OS == 'ios' ? 0 : 0,
                        }}>
                        <CommanButton
                            label={'Update'}
                            isLoading={isLoading}
                            onCkick={EditManager}
                        />
                    </View>
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
            </ScrollView>
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
        width: '60%',
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
export default Edit;
