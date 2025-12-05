import React, {useEffect, useState, useRef} from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Linking,
    View,
    ScrollView,
    TextInput,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import {
    Text,
    Input,
    Box,
    Image,
    Alert,
    HStack,
    Switch,
    Select,
    VStack,
    Modal,
    Button,
    Spinner,
} from 'native-base';
import BackIcon from '@/assets/icon/btnBack.png';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {key} from './key';
import {apiGetTemplates, apiGetTemplatesAllAreas} from '@/apis/areas';
import CustomDropdown from '@/components/CustomDropDown';
import {warningTimer} from '@/constant/customHooks';
import _header from '@/components/_header';
import Upload from '@/assets/icon/upload.png';
import FastImage from 'react-native-fast-image';
import {addProperty, detailsData, NewAreas, Templates} from '@/services/types';
// https://www.npmjs.com/package/react-native-image-picker
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// https://www.npmjs.com/package/react-native-permissions
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {apiAddMyProperties, apiAddMySingleProperties} from '@/apis/property';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import RBSheet from 'react-native-raw-bottom-sheet';
import CommanButton from '@/components/CommanButton';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import {useAppDispatch} from '@/state/hooks';
const {height: windowHeight} = Dimensions.get('window');
const AddProperty = ({navigation}: any): React.JSX.Element => {
    const dispatch = useAppDispatch();
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [location, setLocation] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [address_2, setAddress_2] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [country, setCountry] = useState<string>('');
    const [postal, setPostal] = useState<string>('');
    const [longitude, setLongitude] = useState<number>(0);
    const [latitude, setLatitude] = useState<number>(0);
    const [propertyName, setPropertyName] = useState<string>('');
    const [propertyType, setPropertyType] = useState<string>('');
    const [propertyTypeValue, setPropertTypeValue] = useState<string>('');
    const [notes, setNotes] = useState('');

    const [propertyImage, setPropertyImage] = useState<any>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSingle, setIsSingle] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateData, setTemplateData] = useState<Templates | null>(null);
    const refRBSheet = useRef();
    // amenities
    const [bedRoom, setBedRoom] = useState<any>(null);
    const [bathRoom, setBathroom] = useState<any>(null);
    const [selectedAreas, setSelectedAreas] = useState<any[]>([]);
    // For multiple units data
    const [unitList, setUnitList] = useState([
        {
            id: 1,
            unit: '',
            bedrooms: '',
            bathrooms: '',
            officeSpaces: '',
            room: '',
            restroom: '',
            selectedAreas: [],
        },
    ]);
  

    const [selectedColor, setSelectedColor] = useState(null);
    const options = [
        {label: 'Red', value: 'red'},
        {label: 'Blue', value: 'blue'},
        {label: 'Green', value: 'green'},
        {label: 'Yellow', value: 'yellow'},
        {label: 'Purple', value: 'purple'},
        {label: 'Orange', value: 'orange'},
        {label: 'Black', value: 'black'},
        {label: 'White', value: 'white'},
    ];
    const handleAddUnit = () => {
        setUnitList(prev => {
            // If no previous items, create the first empty one
            if (prev.length === 0) {
                return [
                    {
                        id: 1,
                        unit: '',
                        bedrooms: '',
                        bathrooms: '',
                        selectedAreas: [],
                    },
                ];
            }

            // Copy last item
            const lastItem = prev[prev.length - 1];

            return [
                ...prev,
                {
                    id: prev.length + 1,
                    unit: '',
                    bedrooms: '',
                    bathrooms: '',
                    selectedAreas: [],
                },
            ];
        });
    };

    // Update a single unit’s field
    // const handleUpdateUnit = (index,id, key, value) => {
    //     setUnitList(prev =>
    //         prev.map(unit => (unit.id === id ? {...unit, [key]: value} : unit)),
    //     );
    // };
    const handleUpdateUnit = (index, id, key, value) => {
        setUnitList(prev =>
            prev.map((unit, i) =>
                i === index ? {...unit, [key]: value} : unit,
            ),
        );
    };

    // Update amenities toggles for each unit
    // const handleToggleArea = (unitId, area) => {
    //     setUnitList(prev =>
    //         prev.map(unit => {
    //             if (unit.id === unitId) {
    //                 const isSelected = unit.selectedAreas.find(
    //                     a => a.id === area.id,
    //                 );
    //                 const updatedAreas = isSelected
    //                     ? unit.selectedAreas.filter(a => a.id !== area.id)
    //                     : [...unit.selectedAreas, area];
    //                 return {...unit, selectedAreas: updatedAreas};
    //             }
    //             return unit;
    //         }),
    //     );
    // };

    const handleToggleArea = (unitId, area) => {
        setUnitList(prev =>
            prev.map(unit => {
                if (unit.id === unitId) {
                    const isSelected = unit.selectedAreas.some(
                        a => a.id === area.id,
                    );

                    let updatedAreas;

                    if (isSelected) {
                        // ❌ Remove if already selected
                        updatedAreas = unit.selectedAreas.filter(
                            a => a.id !== area.id,
                        );
                    } else {
                        // ✅ Add area (NO LIMIT)
                        updatedAreas = [...unit.selectedAreas, area];
                    }

                    return {...unit, selectedAreas: updatedAreas};
                }
                return unit;
            }),
        );
    };

    useEffect(() => {
        if (!templateData) return;

        const commonAreas = templateData.areas.filter(a => a.is_common === 1);

        // RESET all units with new is_common areas when property type changes
        setUnitList(prev =>
            prev.map(unit => ({
                ...unit,
                selectedAreas: [...commonAreas],
            })),
        );
    }, [templateData]);

    useEffect(() => {
        (async () => {
            if (propertyType && propertyType != '') {
                console.log(
                    '##############################propertyType',
                    propertyType,
                );
                const response: any = await apiGetTemplatesAllAreas({
                    type: propertyType,
                });
                console.log(
                    '🚀 ~ AddProperty ~ response:',
                    response.result.areas,
                );

                if (response.status) {
                    setTemplateData(response.result);

                    setSelectedAreas(
                        response.result.areas.filter(
                            (area: NewAreas) => area.is_common === 1,
                        ),
                    );
                }
            }
        })();
    }, [propertyType]);

    useEffect(() => {
        // fetch templates
        (async () => {
            const response: any = await apiGetTemplates();

            if (response.status) {
                setTemplates(response.result.data);
            }
        })();


    }, []);


    useEffect(() => {
    // This code runs when the component mounts (initially)

    return () => {
        // This function is the "cleanup" phase.
        // It runs right before the component unmounts (is destroyed).
        handleClearForm();
        
        // Optional: If you use Redux and need to specifically clear 
        // a Redux-managed error message when the screen closes:
        // dispatch(clearPropertyError()); 
    };
}, [])
    const handleClearForm = () => {
        console.log("##############===>")
        // 1. Reset Property Details
        setPropertyName('');
        setPropertyType('');
        setPropertTypeValue('');
        setNotes('');
        setPropertyImage('');
        setErrMsg(null);
        setSelectedColor(null);

        // 2. Reset Location/Address Data
        setLocation('');
        setAddress('');
        setAddress_2('');
        setCity('');
        setState('');
        setCountry('');
        setPostal('');
        setLongitude(0);
        setLatitude(0);

        // 3. Reset Amenities and Units to initial state
        setIsSingle(false);
        setBedRoom(null);
        setBathroom(null);
        setSelectedAreas([]); // For common amenities (though it gets updated by useEffect)
        
        // Reset unitList to its single, default initial state
        setUnitList([
            {
                id: 1,
                unit: '',
                bedrooms: '',
                bathrooms: '',
                officeSpaces: '',
                room: '',
                restroom: '',
                selectedAreas: [],
            },
        ]);
        
        // Reset Template data if necessary (to trigger re-fetch/reset logic)
        setTemplateData(null); 
    };

    const fillLocationDetails = (details: detailsData) => {
        details.address_components.map(component => {
            if (component.types && component.types.includes('street_number')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('route')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('neighborhood')) {
                setAddress(
                    prevAddress =>
                        prevAddress + ' ' + component.long_name + ',',
                );
            }
            if (component.types && component.types.includes('locality')) {
                setCity(component.long_name);
            }
            if (
                component.types &&
                component.types.includes('administrative_area_level_1')
            ) {
                setState(component.long_name);
            }
            if (component.types && component.types.includes('country')) {
                setCountry(component.long_name);
            }
            if (component.types && component.types.includes('postal_code')) {
                setPostal(component.long_name);
            }
        });
        setLocation(details.formatted_address);
        setAddress(details.formatted_address);
        // setAddress_2(details.formatted_address);
        setLongitude(details.geometry.location.lng);
        setLatitude(details.geometry.location.lat);
    };

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

    const handleCreateProperty = async () => {
        try {
            if (!propertyType) {
                setErrMsg('Please select property type');
                dispatch(hideLoader());
                return;
            }

            if (!propertyName?.trim()) {
                setErrMsg('Please enter property name');
                dispatch(hideLoader());
                return;
            }

            if (!location?.trim()) {
                setErrMsg('Please select location');
                dispatch(hideLoader());
                return;
            }

            if (!address?.trim()) {
                setErrMsg('Please enter address');
                dispatch(hideLoader());
                return;
            }

            if (!country) {
                setErrMsg('Please select country');
                dispatch(hideLoader());
                return;
            }

            if (!city) {
                setErrMsg('Please select city');
                dispatch(hideLoader());
                return;
            }

            if (!state) {
                setErrMsg('Please select state');
                dispatch(hideLoader());
                return;
            }

            if (!postal?.trim()) {
                setErrMsg('Please enter postal/zip code');
                dispatch(hideLoader());
                return;
            }

            // if (isSingle == false) {
            //     if (unitList[0].selectedAreas.length <= 0) {
            //         setErrMsg('Please select at least one Amenity1');
            //         dispatch(hideLoader());
            //         return;
            //     }
            // }

            if (isSingle) {
            // Check quantity for each unit entry in the unitList
            const isMissingUnitCount = unitList.some(unit => {
                const count = Number(unit.unit);
                // The 'unit' must be present and greater than 0
                return !unit.unit || isNaN(count) || count <= 0; 
            });

            if (isMissingUnitCount) {
                setErrMsg('Please specify the number of units.');
                dispatch(hideLoader());
                return;
            }
        }

            if (propertyType !== 'COMMERCIAL') {
                // 🏠 RESIDENTIAL VALIDATION
                if (isSingle) {
                    const isNoAmenitySelected = unit => {
                        return (
                            unit.selectedAreas.length < 3 &&
                            Number(unit.bedrooms) <= 0 &&
                            Number(unit.bathrooms) <= 0 
                        );
                    };
                    const anyUnitFailsValidation =
                        unitList.some(isNoAmenitySelected);
                    if (anyUnitFailsValidation) {
                        setErrMsg('At least one amenity should be selected!');
                        dispatch(hideLoader());
                        return;
                    }
                } else {
                    const u = unitList[0];
                    const noAmenitySelected =
                        u.selectedAreas.length < 3 &&
                        Number(u.bedrooms) <= 0 &&
                        Number(u.bathrooms) <= 0;
                    if (noAmenitySelected) {
                        setErrMsg('At least one amenity should be selected!');
                        dispatch(hideLoader());
                        return;
                    }
                }
            } else {
                if (isSingle) {
                    // unitList.forEach((unit, index) => {
                    //     console.log(`Unit [${index}] RAW Data:`);
                    //     console.log(
                    //         `  selectedAreas.length: ${unit.selectedAreas?.length}`,
                    //     );
                    //     console.log(`  officeSpaces: '${unit.officeSpaces}'`);
                    //     console.log(`  room: '${unit.room}'`);
                    //     console.log(`  restroom: '${unit.restroom}'`);
                    // });
                    const isNoAmenitySelected = unit => {
                        const officeSpacesCount =
                            parseInt(unit.officeSpaces) || 0;
                        const roomCount = parseInt(unit.room) || 0;
                        const restroomCount = parseInt(unit.restroom) || 0;

                        // 2. The unit fails validation if ALL conditions are met:
                        return (
                            // Areas are empty
                            unit.selectedAreas.length <= 0 &&
                            // Office spaces count is 0
                            officeSpacesCount <= 0 &&
                            // Room count is 0
                            roomCount <= 0 &&
                            // Restroom count is 0
                            restroomCount <= 0
                        );
                    };

                    const anyUnitFailsValidation =
                        unitList.some(isNoAmenitySelected);
                    if (anyUnitFailsValidation) {
                        setErrMsg('At least one amenity should be selected!');
                        dispatch(hideLoader());
                        return;
                    }
                } else {
                    const isNoAmenitySelected = unit => {
                        // Safely parse the count fields, defaulting to 0 if the value is
                        // empty, null, undefined, or the string 'undefined'.
                        const officeSpacesCount =
                            parseInt(unit.officeSpaces) || 0;
                        const roomCount = parseInt(unit.room) || 0;
                        const restroomCount = parseInt(unit.restroom) || 0;

                        // A unit fails validation if ALL of these conditions are true:
                        return (
                            // 1. No areas selected
                            unit.selectedAreas.length <= 0 &&
                            // 2. Office spaces count is 0 (Now correctly handles 'undefined' as 0)
                            officeSpacesCount <= 0 &&
                            // 3. Room count is 0 (Now correctly handles 'undefined' as 0)
                            roomCount <= 0 &&
                            // 4. Restrooms count is 0 (Now correctly handles 'undefined' as 0)
                            restroomCount <= 0
                        );
                    };

                    // Check if ANY unit in unitList fails the validation
                    const anyUnitFailsValidation =
                        unitList.some(isNoAmenitySelected);

                    if (anyUnitFailsValidation) {
                        setErrMsg('At least one amenity must be selected!');
                        dispatch(hideLoader());
                        return;
                    }
                }
            }

            dispatch(showLoader());
            let unitCounter = 1;
            const payload = {
                type: propertyType,
                cover_image: propertyImage,
                properties: [],
            };
            // Loop through each unit in state
            unitList.forEach(unit => {
                const totalUnits = Number(unit.unit) || 1;
                for (let i = 0; i < totalUnits; i++) {
                    let bedroomAreas = [];
                    let bathroomAreas = [];
                    // Bedrooms
                    if (propertyType !== 'COMMERCIAL') {
                        bedroomAreas = Array.from(
                            {length: Number(unit.bedrooms) || 0},
                            (_, idx) => ({
                                title: `Bedroom ${idx + 1}`,
                                area_id: null,
                                type: 'bedroom',
                                sub_title: '',
                            }),
                        );

                        bathroomAreas = Array.from(
                            {length: Number(unit.bathrooms) || 0},
                            (_, idx) => ({
                                title: `Bathroom ${idx + 1}`,
                                area_id: null,
                                type: 'bathroom',
                                sub_title: '',
                            }),
                        );
                    } else {
                        const officeSpaces = Array.from(
                            {length: Number(unit.officeSpaces) || 0},
                            (_, idx) => ({
                                title: `Office Space ${idx + 1}`,
                                area_id: null,
                                type: 'office_space',
                                sub_title: '',
                            }),
                        );
                        const rooms = Array.from(
                            {length: Number(unit.rooms) || 0},
                            (_, idx) => ({
                                title: `room ${idx + 1}`,
                                area_id: null,
                                type: 'room',
                                sub_title: '',
                            }),
                        );
                        const restrooms = Array.from(
                            {length: Number(unit.restrooms) || 0},
                            (_, idx) => ({
                                title: `Restroom ${idx + 1}`,
                                area_id: null,
                                type: 'restroom',
                                sub_title: '',
                            }),
                        );

                        bedroomAreas = [...officeSpaces, ...rooms];
                        bathroomAreas = restrooms;
                    }

                    // Custom selected areas
                    const customAreas = unit.selectedAreas.map(area => ({
                        title: area.title,
                        area_id: area.id,
                        type: detectAreaType(area.title),
                        sub_title: '',
                    }));

                    // Combine all areas
                    const allAreas = [
                        ...bedroomAreas,
                        ...bathroomAreas,
                        ...customAreas,
                    ].filter(a => {
                        const name = a.title.trim().toLowerCase();
                        return name !== 'bedroom' && name !== 'bathroom';
                    });

                    // Add unit property
                    payload.properties.push({
                        type: `${propertyType}`,
                        name: propertyName,
                        location,
                        address: address,
                        country: country,
                        city: city,
                        state: state,
                        zip: postal,
                        latitude: latitude,
                        longitude: longitude,
                        notes: notes,
                        cover_image: propertyImage,
                        areas: allAreas,
                    });

                    unitCounter++;
                }
            });

            setErrMsg(null);
            setTimeout(() => {
                dispatch(hideLoader());
            }, 1000);
            // console.log("payload data===========>",payload?.properties.areas)
            navigation.navigate('AmenitiesEditScreen', {
                data: payload,
            });
            handleClearForm()
        } catch (error) {
            dispatch(hideLoader());
            console.log('🚨 Error creating property:', error);
            // showMessage({ message: 'Network or server error', type: 'danger' });
        }
    };

    // 🔹 Helper function to detect area type
    const detectAreaType = (title = '') => {
        const lower = title.toLowerCase();
        if (lower.includes('bedroom')) return 'bedroom';
        if (lower.includes('bathroom')) return 'bathroom';
        return '';
    };

    const handleRemoveUnit = (index: number) => {
        setUnitList(prev => prev.filter((_, i) => i !== index));
    };

    const onToggleSelectType = () => {
        setIsSingle(!isSingle);
        if (unitList.length > 1) {
            setUnitList([unitList[0]]);
        }
    };

    return (
        <SafeAreaView>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    width: '90%',
                    alignSelf: 'center',
                    marginTop: Platform.OS == 'ios' ? 0 : 28,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    Add Property
                </Text>
                <View></View>
            </View>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                enableAutomaticScroll={Platform.OS === 'ios'}
                keyboardShouldPersistTaps="handled"
                extraScrollHeight={100}
                extraHeight={20}
                nestedScrollEnabled={true}>
                <View style={styles.mainContainer}>
                    {/* <HStack space={5} my={5} justifyContent={'flex-start'} alignItems={'center'}>
					<Pressable onPress={() => { navigation.goBack(null); }} >
						<Image source={BackIcon} alt="Back" height={10} width={10} />
					</Pressable>
					<Text bold fontSize="3xl" color={'my.h4'}>Add Property</Text>
				</HStack> */}

                    {/* <CustomDropdown
                label="Type"
                data={options}
                value={selectedColor}
                placeholder="Select Property Type"
                onSelect={(value, label) => {
                    setSelectedColor(value);
                    console.log(`Selected: ${label} (${value})`);
                }}
            /> */}

                    <TextInputField
                        placeholder="Select Property Type"
                        value={propertyTypeValue}
                        isDisable={true}
                        url={require('../../../assets/icon/home_2.png')}
                        label={'Type'}
                        isEye={true}
                        uppercase={true}
                        onClick={() => refRBSheet.current.open()}
                        rightIcon={require('../../../assets/icon/drop_2.png')}
                    />
                    <TextInputField
                        placeholder="Property Name"
                        value={propertyName}
                        onChangeText={setPropertyName}
                        style={styles.input}
                        label="Property Name"
                        url={require('@/assets/icon/home_2.png')}
                    />

                    <View style={[styles.MainContainer21, {zIndex: 999}]}>
                        <View
                            style={{
                                width: '15%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Image
                                source={require('../../../assets/icon/location_2.png')}
                                style={{width: 19, height: 19}}
                                resizeMode="contain"
                            />
                        </View>

                        <View
                            style={{
                                width: '70%',
                                position: 'relative',
                                zIndex: 999,
                            }}>
                            <Text style={styles.labelStyle}>Address</Text>

                            <GooglePlacesAutocomplete
                                placeholder="Address"
                                fetchDetails={true}
                                query={{
                                    key: key.key,
                                    language: key.language,
                                }}
                                textInputProps={{
                                    InputComp: Input,
                                    placeholderTextColor: '#250959', // ✅ Placeholder color
                                }}
                                styles={{
                                    container: {
                                        flex: 0,
                                        zIndex: 999,
                                    },
                                    textInputContainer: {
                                        height: 45,
                                    },
                                    textInput: {
                                        height: 45,
                                        paddingHorizontal: 0,
                                        borderColor: 'transparent',
                                        borderRadius: 0,
                                        fontSize: 14,
                                        color: '#000',
                                    },
                                    listView: {
                                        position: 'absolute',
                                        top: 50, // ✅ Dropdown appears below input
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#fff',
                                        borderRadius: 8,
                                        elevation: 5, // Android shadow
                                        shadowColor: '#000',
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        zIndex: 999,
                                    },
                                    row: {
                                        paddingVertical: 12,
                                        paddingHorizontal: 10,
                                    },
                                    separator: {
                                        height: 1,
                                        backgroundColor: '#eee',
                                    },
                                }}
                                onPress={(data, details: any) => {
                                    fillLocationDetails(details);
                                }}
                                renderRow={data => (
                                    <Text style={{fontSize: 14, color: '#333'}}>
                                        {data.description}
                                    </Text>
                                )}
                            />
                        </View>
                    </View>

                    {/* <TextInputField
                        placeholder="Street Address 1"
                        value={address}
                        onChangeText={setAddress}
                        style={styles.input}
                        label="Address 1"
                        url={require('@/assets/icon/location_2.png')}
                    /> */}

                    <TextInputField
                        placeholder="Country"
                        value={country}
                        onChangeText={setCountry}
                        style={styles.input}
                        label="Country"
                        url={require('@/assets/icon/world.png')}
                    />
                    <TextInputField
                        placeholder="City"
                        value={city}
                        onChangeText={setCity}
                        style={styles.input}
                        label="City"
                        url={require('@/assets/icon/city_2.png')}
                    />
                    <TextInputField
                        placeholder="Enter State..."
                        value={state}
                        onChangeText={setState}
                        style={styles.input}
                        label="State"
                        url={require('@/assets/icon/state_2.png')}
                    />
                    <TextInputField
                        placeholder="Enter Area Zip Code..."
                        value={postal}
                        onChangeText={setPostal}
                        style={styles.input}
                        label="Zip Code"
                        url={require('@/assets/icon/zip_2.png')}
                    />
                    <TextInputField
                        placeholder="Address Line 2"
                        value={address_2}
                        onChangeText={setAddress_2}
                        style={styles.input}
                        label="Address Line 2"
                        url={require('@/assets/icon/location_2.png')}
                    />
                    <View style={styles.container21}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={styles.input21}
                            placeholder="Type here..."
                            placeholderTextColor="#C4BCD6" // light lavender-gray color
                            multiline
                            textAlignVertical="top"
                            onChangeText={setNotes}
                        />
                    </View>
                    <View
                        style={{
                            width: '92%',
                            height: 2,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                            marginVertical: 30,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 18,
                            color: '#250959',
                            fontFamily: 'Poppins',
                            fontWeight: '600',
                            textAlign: 'center',
                        }}>
                        Cover Image
                    </Text>
                    <TouchableOpacity
                        style={styles.ImageContainer}
                        activeOpacity={0.8}>
                        <View style={styles.iconWrapper}>
                            <FastImage
                                source={
                                    propertyImage?.uri
                                        ? {uri: propertyImage?.uri}
                                        : require('../../../assets/icon/cover_image.png')
                                }
                                style={{
                                    width: 60,
                                    height: 60,
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={{height: 40, justifyContent: 'center'}}>
                        {!propertyImage?.uri && (
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 15,
                                    fontFamily: 'Gilroy',
                                    color: '#2509594D',
                                }}>
                                No File Chosen
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}>
                        <HStack
                            px={3}
                            py={3}
                            space={1}
                            mt={5}
                            style={styles.uploadContainer}
                            justifyContent={'center'}
                            alignItems={'center'}>
                            <Image
                                source={require('../../../assets/icon/upload_3.png')}
                                height={5}
                                width={6}
                                alt="Icon"
                                resizeMode="contain"
                            />
                            <Text bold fontSize={'lg'} color={'#250959'}>
                                Choose File
                            </Text>
                        </HStack>
                    </TouchableOpacity>

                    <View
                        style={{
                            width: '92%',
                            height: 2,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                            marginVertical: 30,
                        }}
                    />
                    <View
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                        <Text
                            style={{
                                fontSize: 24,
                                color: '#250959',
                                fontWeight: '700',
                                fontFamily: 'Gilroy',
                            }}>
                            Amenities
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    paddingRight: 10,
                                    fontSize: 10,
                                    color: '#250959',
                                }}>
                                Single Unit
                            </Text>
                            <Switch
                                size={Platform.OS == 'ios' ? 'sm' : 'lg'}
                                onTrackColor="#9A46DB" // ✅ Track color when ON
                                offTrackColor="#B598CB" // ✅ Track color when OFF
                                thumbColor="#fff"
                                onChange={() => {
                                    onToggleSelectType();
                                }}
                                value={isSingle}
                            />
                            <Text
                                style={{
                                    paddingRight: 10,
                                    fontSize: 10,
                                    color: '#250959',
                                }}>
                                Multi Unit
                            </Text>
                        </View>
                    </View>

                    <>
                        {unitList.map((unit, index) => (
                            <>
                                <View key={unit.id} style={styles.unitCard}>
                                    {isSingle && (
                                        <TextInputField
                                            placeholder="Add Unit"
                                            value={unit.unit}
                                            onChangeText={val =>
                                                handleUpdateUnit(
                                                    index,
                                                    unit.id,
                                                    'unit',
                                                    val,
                                                )
                                            }
                                            style={styles.input}
                                            label="No. of Units"
                                            url={require('@/assets/icon/unit_2.png')}
                                        />
                                    )}
                                    {propertyType === 'COMMERCIAL' ? (
                                        <>
                                            <TextInputField
                                                placeholder="Office Spaces"
                                                value={unit.officeSpaces}
                                                onChangeText={val =>
                                                    handleUpdateUnit(
                                                        index,
                                                        unit.id,
                                                        'officeSpaces',
                                                        val,
                                                    )
                                                }
                                                style={styles.input}
                                                label="No. of Office Spaces (Per Unit)"
                                                url={require('@/assets/icon/bed_2.png')}
                                                keyboardType={true}
                                            />
                                            <TextInputField
                                                placeholder="Choose rooms"
                                                value={unit.rooms}
                                                onChangeText={val =>
                                                    handleUpdateUnit(
                                                        index,
                                                        unit.id,
                                                        'rooms',
                                                        val,
                                                    )
                                                }
                                                style={styles.input}
                                                label="No. of Rooms (Per Unit)"
                                                url={require('@/assets/icon/bath_2.png')}
                                                keyboardType={true}
                                            />
                                            <TextInputField
                                                placeholder="Restrooms"
                                                value={unit.restrooms}
                                                onChangeText={val =>
                                                    handleUpdateUnit(
                                                        index,
                                                        unit.id,
                                                        'restrooms',
                                                        val,
                                                    )
                                                }
                                                style={styles.input}
                                                label="No. of Restrooms (Per Unit)"
                                                url={require('@/assets/icon/bath_2.png')}
                                                keyboardType={true}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <TextInputField
                                                placeholder="Choose Bedrooms"
                                                value={unit.bedrooms}
                                                onChangeText={val =>
                                                    handleUpdateUnit(
                                                        index,
                                                        unit.id,
                                                        'bedrooms',
                                                        val,
                                                    )
                                                }
                                                style={styles.input}
                                                label={
                                                    isSingle
                                                        ? 'No. of Bedroom (Per Unit)'
                                                        : 'No. of Bedroom'
                                                }
                                                url={require('@/assets/icon/bed_2.png')}
                                                keyboardType={true}
                                            />
                                            <TextInputField
                                                placeholder="Choose Bathrooms"
                                                value={unit.bathrooms}
                                                onChangeText={val =>
                                                    handleUpdateUnit(
                                                        index,
                                                        unit.id,
                                                        'bathrooms',
                                                        val,
                                                    )
                                                }
                                                style={styles.input}
                                                label={
                                                    isSingle
                                                        ? 'No. of Bathrooms (Per Unit)'
                                                        : 'No. of Bathrooms'
                                                }
                                                url={require('@/assets/icon/bath_2.png')}
                                                keyboardType={true}
                                            />
                                        </>
                                    )}

                                    {/* Amenities toggles per unit */}
                                    {templateData &&
                                        templateData.areas
                                            .filter(
                                                area =>
                                                    !area.title.startsWith(
                                                        'Bedroom',
                                                    ) &&
                                                    !area.title.startsWith(
                                                        'Bathroom',
                                                    ),
                                            )
                                            .map(area => {
                                                const isSelected =
                                                    unit.selectedAreas.some(
                                                        a => a.id === area.id,
                                                    );

                                                return (
                                                    <View
                                                        key={area.id}
                                                        style={
                                                            styles.switchStyle
                                                        }>
                                                        <View
                                                            style={{
                                                                width: '70%',
                                                            }}>
                                                            <Text
                                                                style={
                                                                    styles.switchTitleStyle
                                                                }>
                                                                {area.title}
                                                            </Text>
                                                        </View>
                                                        <Switch
                                                            size={
                                                                Platform.OS ==
                                                                'ios'
                                                                    ? 'sm'
                                                                    : 'lg'
                                                            }
                                                            // value={isSelected}
                                                            isChecked={
                                                                isSelected
                                                            }
                                                            // defaultIsChecked={
                                                            //     isSelected
                                                            // }
                                                            onChange={() =>
                                                                handleToggleArea(
                                                                    unit.id,
                                                                    area,
                                                                )
                                                            }
                                                            onTrackColor="#9A46DB"
                                                            offTrackColor="#B598CB"
                                                            thumbColor="#fff"
                                                        />
                                                    </View>
                                                );
                                            })}
                                </View>

                                {unitList.length > 1 &&
                                    index < unitList.length - 1 && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() =>
                                                handleRemoveUnit(index)
                                            }>
                                            <Image
                                                source={require('../../../assets/icon/close_2.png')}
                                                style={{
                                                    width: 13,
                                                    height: 13,
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        </TouchableOpacity>
                                    )}
                            </>
                        ))}

                        {/* Add new unit button */}
                        {isSingle && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddUnit}>
                                <Image
                                    source={require('../../../assets/icon/plus.png')}
                                    style={{
                                        width: 13,
                                        height: 13,
                                        resizeMode: 'contain',
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </>

                    {errMsg && (
                        <Alert w="100%" status={'danger'} mb={8} mt={2}>
                            <Text fontSize="md" color={'red.500'}>
                                {errMsg}
                            </Text>
                        </Alert>
                    )}
                    <View style={{width: '100%', height: 80, marginBottom: 40}}>
                        <CommanButton
                            label="Next"
                            // onCkick={handleNext}
                            onCkick={handleCreateProperty}
                            //         onCkick={()=> {
                            //               navigation.navigate('AmenitiesAdd', {
                            //     propertyId: 7,
                            //     propertyType: 'COMMERCIAL',
                            // });
                            //         }}
                            isLoading={isLoading}
                        />
                    </View>
                </View>
                <View style={{height: windowHeight * 0.1}} />
            </KeyboardAwareScrollView>
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
                    <ScrollView>
                        {templates.length > 0
                            ? templates?.map((item: any, i: number) => {
                                  console.log(
                                      '🚀 ~ AddProperty ~ item:',
                                      item.type,
                                  );
                                  return (
                                      <TouchableOpacity
                                          onPress={() => {
                                              setPropertyType(item.type);
                                              setPropertTypeValue(item.title);

                                              //   setPropertyType(item.id),
                                              refRBSheet.current.close();
                                          }}
                                          style={{padding: 5}}>
                                          <Text
                                              style={{
                                                  color: '#9A46DB',
                                                  textTransform: 'uppercase',
                                              }}>
                                              {item.title}
                                          </Text>
                                      </TouchableOpacity>
                                  );
                              })
                            : null}
                    </ScrollView>
                </View>
            </RBSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#F2F2F2',
    },
    input: {
        flex: 1,
        paddingLeft: 20,
        backgroundColor: '#fff',
        borderRadius: 0,
        borderWidth: 0,
        fontSize: 16,
        height: 45,
    },
    amenityContainer: {
        flex: 1,
    },
    selectInput: {
        backgroundColor: '#fff',
        height: 45,
    },
    uploadContainer: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#2509594D',
        height: 50,
        alignSelf: 'center',
        borderRadius: 10,
    },
    switchMain: {
        display: 'flex',
        width: '100%',
        minHeight: 40,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    switchContainer: {
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        height: 60,
        flexWrap: 'wrap',
    },
    footerContainer: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        height: 100,
        marginBottom: -20,
        marginLeft: -20,
        marginRight: -20,
    },
    footerBox: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        elevation: 3,
        height: 5,
    },
    footerBtn: {
        backgroundColor: '#fff',
        width: '30%',
        height: 40,
        borderRadius: 10,
    },
    modalButton: {
        // backgroundColor: 'rgba(10,129,189,0.7)',
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: 80,
    },
    heading1: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Gilroy-SemiBold',
        color: '#250959',
        paddingVertical: 10,
        paddingLeft: 30,
    },
    MainContainer21: {
        width: '90%',
        height: 66,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 70,
        marginVertical: 10,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelStyle: {
        fontSize: 10,
        color: '#250959',
        paddingLeft: 5,
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
    switchStyle: {
        width: '90%',
        height: 66,
        alignSelf: 'center',
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    switchTitleStyle: {
        flexWrap: 'wrap',
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: '#250959',
    },
    container21: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 8,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 5,
        elevation: 2,
        minHeight: 170, // large area for notes
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
    },
    label: {
        color: '#5E4B8B', // soft purple like in your image
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    input21: {
        flex: 1,
        fontSize: 14,
        color: '#000000',
    },
    ImageContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C8C1D9', // soft lavender border
        borderRadius: 20,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 3,
        shadowOffset: {width: 0, height: 1},
        elevation: 1,
        marginTop: 20,
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // multiple unit

    unitCard: {
        width: '90%',
        alignSelf: 'center',
        marginVertical: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#2509594D',
        borderRadius: 40,
        backgroundColor: '#F2F2F2',
    },
    unitTitle: {
        fontSize: 16,
        color: '#250959',
        fontWeight: '600',
        marginBottom: 10,
    },
    addButton: {
        width: '80%',
        height: 55,
        borderRadius: 10,
        backgroundColor: '#F1EAF9',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2509594D',
    },
    addButtonText: {
        padding: 5,
        color: '#9A46DB',
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default AddProperty;
