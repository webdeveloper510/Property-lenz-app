import React, {useEffect, useState, useRef} from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Linking,
    View,
    TextInput,
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
import {
    apiGetTemplates,
    apiGetTemplatesAllAreas,
    apiNewPictureAreas,
} from '@/apis/areas';
import {ScrollView} from 'react-native-gesture-handler';
import {warningTimer} from '@/constant/customHooks';
import _header from '@/components/_header';
import Upload from '@/assets/icon/upload.png';
import {addProperty, detailsData, NewAreas, Templates} from '@/services/types';
// https://www.npmjs.com/package/react-native-image-picker
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// https://www.npmjs.com/package/react-native-permissions
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
    apiAddMyProperties,
    apiGetSpecificProperty,
    apiUpdateProperties,
} from '@/apis/property';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {IsAny} from 'node_modules/@reduxjs/toolkit/dist/tsHelpers';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import RBSheet from 'react-native-raw-bottom-sheet';
import FastImage from 'react-native-fast-image';
import CommanButton from '@/components/CommanButton';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import {useAppDispatch} from '@/state/hooks';
const EditProperty = ({navigation}: any): React.JSX.Element => {
    const route = useRoute();
    const paramData: any = route.params;
    // console.log('🚀 ~ EditProperty ~ paramData:', paramData);
    const propertyId = paramData.propertyId;
    const isFocused = useIsFocused();
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
    const [originalType, setOriginalType] = useState<string>('');
    const [propertyImage, setPropertyImage] = useState<any>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const refRBSheet = useRef();
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateData, setTemplateData] = useState<Templates | null>(null);
    const [notes, setNotes] = useState('');
    const [officeSpaces, setofficeSpaces] = useState<string>('');
    const [rooms, setRooms] = useState<string>('');
    const [restrooms, setRestrooms] = useState<string>('');
    const [propertyTypeValue, setPropertTypeValue] = useState<string>('');
    // amenities
    const [bedRoom, setBedRoom] = useState<any>(null);
    const [bathRoom, setBathroom] = useState<any>(null);
    const [selectedAreas, setSelectedAreas] = useState<any[]>([]);
    const [addressText, setAddressText] = useState('');
    const ref = useRef(null);

    // console.log('Selected areas: ', selectedAreas.map(a => a.title))
    // console.log('Selected areas: ', selectedAreas)

    // useEffect(() => {
    //     // fetch templates
    //     (async () => {
    //         const response: any = await apiGetTemplates();
    //         if (response.status) {
    //             setTemplates(response.result.data);
    //         }
    //     })();
    // }, []);

    useEffect(() => {
        // fetch templates
        (async () => {
            const response: any = await apiGetTemplates();

            if (response.status) {
                setTemplates(response.result.data);
                // if (response.result.data.length > 0) {
                //     setPropertyType(response.result.data[0].type);
                // }
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (propertyType && propertyType != '') {
                const response: any = await apiGetTemplatesAllAreas({
                    type: propertyType,
                });
                if (response.status) {
                    setTemplateData(response.result);
                    if (originalType && originalType !== propertyType) {
                        setSelectedAreas(prev =>
                            prev.filter(area => area.property_id),
                        );
                    }
                }
            }
        })();
    }, [propertyType]);

    useEffect(() => {
        (async () => {
            dispatch(showLoader());
            const response: any = await apiGetSpecificProperty(propertyId);
            if (response.status) {
                const propertyData = response.result;
                setNotes(propertyData.notes || '');
                setPropertyName(propertyData.name || '');
                setLocation(propertyData?.location || '');
                console.log(
                    '🚀 ~ EditProperty ~ propertyData?.location:',
                    propertyData?.location,
                );
                const loadedAddress = propertyData.location || '';
                console.log(
                    '🚀 ~ EditProperty ~ loadedAddress:',
                    loadedAddress,
                );
                setAddress(loadedAddress);
                setAddress_2(propertyData.address_line_2 || '');
                setCity(propertyData.city || '');
                setState(propertyData.state || '');
                setCountry(propertyData.country || '');
                setPostal(propertyData.zip || '');
                setLongitude(propertyData.longitude || 0);
                setLatitude(propertyData.longitude || 0);
                setPropertyImage({uri: propertyData.cover_image || ''});
                if (ref.current) {
                    // Use a short delay to ensure the component is fully mounted/updated
                    // before calling its specific ref method.
                    setTimeout(() => {
                        ref.current.setAddressText(loadedAddress);
                    }, 100); // 100ms is usually enough
                }
                if (propertyData.type !== null) {
                    setPropertTypeValue(propertyData.type || '');
                    setPropertyType(propertyData.type);
                    setOriginalType(propertyData.type);
                } else {
                    setPropertyType('SINGLE_FAMILY');
                }

                const areasResponse: any = await apiNewPictureAreas(propertyId);

                if (areasResponse.status) {
                    const areasData = areasResponse.result;
                    console.log('🚀 ~ EditProperty ~ areasData:', areasData);
                    setSelectedAreas([...areasData]);
                    let officeSpaceCount = 0;
                    let roomCount = 0;
                    let restroomCount = 0;

                    let bedroomCount = 0;
                    let bathroomCount = 0;
                    // if (Array.isArray(areasData)) {
                    //     const bedroomCount = [...areasData].reduce(
                    //         (count, area) => {
                    //             if (
                    //                 area.is_custom === 1 &&
                    //                 area.title.toLowerCase().includes('bedroom')
                    //             ) {
                    //                 if (
                    //                     area.title
                    //                         .toLowerCase()
                    //                         .includes('half')
                    //                 ) {
                    //                     return count + 0.5;
                    //                 }
                    //                 return count + 1;
                    //             }
                    //             return count;
                    //         },
                    //         0,
                    //     );
                    //     const bathroomCount = [...areasData].reduce(
                    //         (count, area) => {
                    //             if (
                    //                 area.is_custom === 1 &&
                    //                 area.title
                    //                     .toLowerCase()
                    //                     .includes('bathroom')
                    //             ) {
                    //                 if (
                    //                     area.title
                    //                         .toLowerCase()
                    //                         .includes('half')
                    //                 ) {
                    //                     return count + 0.5;
                    //                 }
                    //                 return count + 1;
                    //             }
                    //             return count;
                    //         },
                    //         0,
                    //     );
                    //     setBedRoom(bedroomCount.toString());
                    //     setBathroom(bathroomCount.toString());
                    // }

                    areasData.forEach(area => {
                        const title = area.title?.toLowerCase();

                        // ------------ COMMERCIAL COUNT (FIXED) ------------
                        if (title.includes('office space')) {
                            // 'Office Space' is specific and can be separate.
                            officeSpaceCount++;
                        } else if (title.includes('restroom')) {
                            // 🥇 1. Check for the specific term 'restroom' first.
                            restroomCount++;
                        } else if (title.includes('room')) {
                            // 🥈 2. Check for the generic term 'room' only if it's NOT a restroom.
                            roomCount++;
                        }

                        // ------------ RESIDENTIAL COUNT ------------
                        if (area.is_custom === 1 && title.includes('bedroom')) {
                            if (title.includes('half')) bedroomCount += 0.5;
                            else bedroomCount += 1;
                        }

                        if (
                            area.is_custom === 1 &&
                            title.includes('bathroom')
                        ) {
                            if (title.includes('half')) bathroomCount += 0.5;
                            else bathroomCount += 1;
                        }
                    });

                    if (propertyData.type === 'COMMERCIAL') {
                        // Update commercial values
                        console.log('rooms count ================>', roomCount);
                        setofficeSpaces(officeSpaceCount.toString());
                        setRooms(roomCount.toString());
                        setRestrooms(restroomCount.toString());

                        // Reset residential values (edit screen needs fresh values)
                        setBedRoom('0');
                        setBathroom('0');
                        dispatch(hideLoader());
                    } else {
                        // Update residential values
                        setBedRoom(bedroomCount.toString());
                        setBathroom(bathroomCount.toString());

                        // Reset commercial values
                        setofficeSpaces('0');
                        setRooms('0');
                        setRestrooms('0');
                        dispatch(hideLoader());
                    }
                }
            }
        })();
    }, [propertyId, isFocused]);

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
        setAddress_2(details.formatted_address);
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

    // const handleNext = async () => {
    //     if (!templateData || isLoading) {
    //         return;
    //     }

    //     if (templateData.has_bathroom == 1 && !bedRoom) {
    //         setErrMsg('Please fill Bedroom field');
    //         return;
    //     }
    //     if (templateData.has_bathroom == 1 && !bathRoom) {
    //         setErrMsg('Please fill Bathroom field');
    //         return;
    //     }
    //     if (selectedAreas.length === 0) {
    //         setErrMsg('Please select at-least one Amenities');
    //         return;
    //     }
    //     if (!location.trim()) {
    //         setErrMsg('Please Choose Location');
    //         return;
    //     }
    //     if (!propertyName.trim()) {
    //         setErrMsg('Please Give Property Name');
    //         return;
    //     }
    //     if (!propertyType.trim()) {
    //         setErrMsg('Please Select Property Type');
    //         return;
    //     }
    //     // END VALIDATION

    //     const newAreas: any = [];

    //     // Add Bedrooms
    //     for (let i = 1; i <= Math.floor(bedRoom); i++) {
    //         const existingBedroom = selectedAreas.find(
    //             area => area.title === `Bedroom ${i}`,
    //         );
    //         if (existingBedroom) {
    //             newAreas.push(existingBedroom); // Keep existing bedroom with area_id
    //         } else {
    //             newAreas.push({
    //                 title: `Bedroom ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bedroom',
    //                 area_id: null,
    //             });
    //         }
    //     }

    //     const existingHalfBedroom = selectedAreas.find(
    //         area => area.title === `Bedroom (half)`,
    //     );
    //     if (existingHalfBedroom) {
    //         newAreas.push(existingHalfBedroom);
    //     } else if (bedRoom % 1 !== 0) {
    //         newAreas.push({
    //             title: `Bedroom (half)`,
    //             is_common: 0,
    //             is_custom: 1,
    //             type: 'bedroom',
    //             area_id: null,
    //         });
    //     }

    //     for (let i = 1; i <= Math.floor(bathRoom); i++) {
    //         const existingBathroom = selectedAreas.find(
    //             area => area.title === `Bathroom ${i}`,
    //         );
    //         if (existingBathroom) {
    //             newAreas.push(existingBathroom);
    //         } else {
    //             newAreas.push({
    //                 title: `Bathroom ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bathroom',
    //                 area_id: null,
    //             });
    //         }
    //     }

    //     const existingHalfBathroom = selectedAreas.find(
    //         area => area.title === `Bathroom (half)`,
    //     );
    //     if (existingHalfBathroom) {
    //         newAreas.push(existingHalfBathroom);
    //     } else if (bathRoom % 1 !== 0) {
    //         newAreas.push({
    //             title: `Bathroom (half)`,
    //             is_common: 0,
    //             is_custom: 1,
    //             type: 'bathroom',
    //             area_id: null,
    //         });
    //     }

    //     setErrMsg(null);
    //     setIsLoading(true);

    //     const filteredAreas = selectedAreas.filter(
    //         area =>
    //             !area.title.startsWith('Bedroom') &&
    //             !area.title.startsWith('Bathroom'),
    //     );
    //     const allAreas = [...filteredAreas, ...newAreas];
    //     const finalSelectedAreas = allAreas.sort((a, b) => a.order - b.order);

    //     console.log('finalSelectedAreas', finalSelectedAreas);
    //     const finalAreas = finalSelectedAreas.map(area => ({
    //         area_id: area.id || null,
    //         title: area.title,
    //         sub_title: area.sub_title || '',
    //         type: area.type || null,
    //     }));

    //     console.log('finalAreas', finalAreas); // send this to api
    //     const data: any = {
    //         id: propertyId,
    //         type: propertyType,
    //         name: propertyName,
    //         location: location,
    //         address: address,
    //         address_line_2: address_2 ? address_2 : '',
    //         city: city,
    //         state: state,
    //         zip: postal,
    //         country: country,
    //         latitude: latitude,
    //         longitude: longitude,
    //         areas: finalAreas,
    //     };
    //     if (propertyImage?.name) {
    //         data.cover_image = propertyImage;
    //     }
    //     console.log('🚀 ~ handleNext ~ data:', data);
    //     const payload = {
    //         type: propertyType,
    //         cover_image: propertyImage,
    //         properties: [data],
    //     };
    //     navigation.navigate('EditSingleProperty', {
    //         data: payload,
    //     });
    //     setIsLoading(false);

    // };

    // const handleNext = async () => {
    //     if (!templateData || isLoading) return;

    //     // VALIDATION
    //     if (propertyType !== 'COMMERCIAL') {
    //         if (templateData.has_bathroom == 1 && !bedRoom) {
    //             setErrMsg('Please fill Bedroom field');
    //             return;
    //         }
    //         if (templateData.has_bathroom == 1 && !bathRoom) {
    //             setErrMsg('Please fill Bathroom field');
    //             return;
    //         }
    //     }

    //     if (selectedAreas.length === 0) {
    //         setErrMsg('Please select at-least one Amenities');
    //         return;
    //     }

    //     if (!location.trim()) return setErrMsg('Please Choose Location');
    //     if (!propertyName.trim()) return setErrMsg('Please Give Property Name');
    //     if (!propertyType.trim())
    //         return setErrMsg('Please Select Property Type');

    //     const newAreas: any = [];

    //     // -----------------------------------------------------
    //     // ✅ RESIDENTIAL AREA LOGIC
    //     // -----------------------------------------------------
    //     if (propertyType !== 'COMMERCIAL') {
    //         // Bedrooms
    //         for (let i = 1; i <= Math.floor(bedRoom); i++) {
    //             newAreas.push({
    //                 title: `Bedroom ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bedroom',
    //                 area_id: null,
    //             });
    //         }

    //         if (bedRoom % 1 !== 0) {
    //             newAreas.push({
    //                 title: `Bedroom (half)`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bedroom',
    //                 area_id: null,
    //             });
    //         }

    //         // Bathrooms
    //         for (let i = 1; i <= Math.floor(bathRoom); i++) {
    //             newAreas.push({
    //                 title: `Bathroom ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bathroom',
    //                 area_id: null,
    //             });
    //         }

    //         if (bathRoom % 1 !== 0) {
    //             newAreas.push({
    //                 title: `Bathroom (half)`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'bathroom',
    //                 area_id: null,
    //             });
    //         }
    //     }

    //     // -----------------------------------------------------
    //     // ✅ COMMERCIAL AREA LOGIC
    //     // -----------------------------------------------------
    //     if (propertyType === 'COMMERCIAL') {
    //         // Office spaces
    //         for (let i = 1; i <= Number(officeSpaces || 0); i++) {
    //             newAreas.push({
    //                 title: `Office Space ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'office_space',
    //                 area_id: null,
    //             });
    //         }

    //         // Rooms
    //         for (let i = 1; i <= Number(rooms || 0); i++) {
    //             newAreas.push({
    //                 title: `Room ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'room',
    //                 area_id: null,
    //             });
    //         }

    //         // Restrooms
    //         for (let i = 1; i <= Number(restrooms || 0); i++) {
    //             newAreas.push({
    //                 title: `Restroom ${i}`,
    //                 is_common: 0,
    //                 is_custom: 1,
    //                 type: 'restroom',
    //                 area_id: null,
    //             });
    //         }
    //     }

    //     // REMOVE OLD BEDROOM/BATHROOM IF COMMERCIAL
    //     const filteredAreas = selectedAreas.filter(area => {
    //         if (propertyType === 'COMMERCIAL') {
    //             return (
    //                 !area.title.startsWith('Bedroom') &&
    //                 !area.title.startsWith('Bathroom')
    //             );
    //         } else {
    //             return (
    //                 !area.title.startsWith('Office Space') &&
    //                 !area.title.startsWith('Room') &&
    //                 !area.title.startsWith('Restroom')
    //             );
    //         }
    //     });

    //     const finalSelectedAreas = [...filteredAreas, ...newAreas];

    //     const finalAreas = finalSelectedAreas.map(area => ({
    //         area_id: area.id || null,
    //         title: area.title,
    //         sub_title: area.sub_title || '',
    //         type: area.type || null,
    //     }));

    //     // SEND TO API --------------------
    //     const data: any = {
    //         id: propertyId,
    //         type: propertyType,
    //         name: propertyName,
    //         location: location,
    //         address: address,
    //         address_line_2: address_2 || '',
    //         city,
    //         state,
    //         zip: postal,
    //         country,
    //         latitude,
    //         longitude,
    //         areas: finalAreas,
    //     };

    //     if (propertyImage?.name) {
    //         data.cover_image = propertyImage;
    //     }

    //     const payload = {
    //         type: propertyType,
    //         cover_image: propertyImage,
    //         properties: [data],
    //     };

    //     navigation.navigate('EditSingleProperty', {data: payload});
    // };

    const getOrCreateArea = (existingAreas, title, type) => {
        const found = existingAreas.find(a => a.title === title);
        if (found) {
            return {...found, is_custom: 1}; // re-use existing
        }

        return {
            title,
            is_common: 0,
            is_custom: 1,
            type,
            area_id: null,
        };
    };

    const handleNext = () => {
        const existingOfficeSpaces = selectedAreas.filter(a =>
            a.title.toLowerCase().startsWith('office space'),
        ).length;

        const existingRooms = selectedAreas.filter(a =>
            a.title.toLowerCase().startsWith('room'),
        ).length;

        const existingRestrooms = selectedAreas.filter(a =>
            a.title.toLowerCase().startsWith('restroom'),
        ).length;

        const existingBedrooms = selectedAreas.filter(a =>
            a.title.toLowerCase().includes('bedroom'),
        ).length;

        const existingBathrooms = selectedAreas.filter(a =>
            a.title.toLowerCase().includes('bathroom'),
        ).length;
        const newAreas: any[] = [];

        // ---------- RESIDENTIAL ----------
        if (propertyType !== 'COMMERCIAL') {
            // ---- Bedrooms ----
            if (Number(bedRoom) > existingBedrooms) {
                for (let i = existingBedrooms + 1; i <= Number(bedRoom); i++) {
                    newAreas.push({
                        title: `Bedroom ${i}`,
                        is_common: 0,
                        is_custom: 1,
                        type: 'bedroom',
                        area_id: null,
                    });
                }
            }

            // Bathrooms
            if (Number(bathRoom) > existingBathrooms) {
                for (
                    let i = existingBathrooms + 1;
                    i <= Number(bathRoom);
                    i++
                ) {
                    newAreas.push({
                        title: `Bathroom ${i}`,
                        is_common: 0,
                        is_custom: 1,
                        type: 'bathroom',
                        area_id: null,
                    });
                }
            }
        }

        // ---------- COMMERCIAL ----------
        if (propertyType === 'COMMERCIAL') {
            // ---- Office Spaces ----

            if (Number(officeSpaces) > existingOfficeSpaces) {
                for (
                    let i = existingOfficeSpaces + 1;
                    i <= Number(officeSpaces);
                    i++
                ) {
                    newAreas.push({
                        title: `Office Space ${i}`,
                        is_common: 0,
                        is_custom: 1,
                        type: 'office_space',
                        area_id: null,
                    });
                }
            }

            // Rooms
            if (Number(rooms) > existingRooms) {
                for (let i = existingRooms + 1; i <= Number(rooms); i++) {
                    newAreas.push({
                        title: `Room ${i}`,
                        is_common: 0,
                        is_custom: 1,
                        type: 'room',
                        area_id: null,
                    });
                }
            }

            // Restrooms
            if (Number(restrooms) > existingRestrooms) {
                for (
                    let i = existingRestrooms + 1;
                    i <= Number(restrooms);
                    i++
                ) {
                    newAreas.push({
                        title: `Restroom ${i}`,
                        is_common: 0,
                        is_custom: 1,
                        type: 'restroom',
                        area_id: null,
                    });
                }
            }
        }

        // Remove old auto-created areas
        const autoTypes = [
            'bedroom',
            'bathroom',
            'office_space',
            'room',
            'restroom',
        ];

        const filteredAreas = selectedAreas.filter(
            area => !autoTypes.includes(area.type),
        );

        // Add new valid areas
        const finalSelectedAreas = [...filteredAreas, ...newAreas];

        const finalAreas = finalSelectedAreas.map(area => ({
            area_id: area.id || null,
            title: area.title,
            sub_title: area.sub_title || '',
            type: area.type || null,
        }));

        // SEND TO API --------------------
        const data: any = {
            id: propertyId,
            type: propertyType,
            name: propertyName,
            location: location,
            address: address,
            address_line_2: address_2 || '',
            city,
            state,
            zip: postal,
            country,
            latitude,
            longitude,
            areas: finalAreas,
        };

        if (propertyImage?.name) {
            data.cover_image = propertyImage;
        }

        const payload = {
            type: propertyType,
            cover_image: propertyImage,
            properties: [data],
        };

        navigation.navigate('EditSingleProperty', {data: payload});
    };

    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    width: '90%',
                    alignSelf: 'center',
                    marginTop: 28,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    Edit Property
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
                    <TextInputField
                        placeholder="select property type"
                        value={propertyTypeValue}
                        isDisable={true}
                        url={require('../../../assets/icon/home_2.png')}
                        label={'Type'}
                        isEye={true}
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
                                ref={ref}
                                placeholder="Address"
                                fetchDetails={true}
                                query={{
                                    key: key.key,
                                    language: key.language,
                                }}
                                textInputProps={{
                                    InputComp: Input,
                                    placeholderTextColor: '#250959', // ✅ Placeholder color
                                    onChangeText: text => setAddressText(text),
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
                                    setAddressText(data.description);
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
                            value={notes}
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
                    {!propertyImage?.uri && (
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 15,
                                fontFamily: 'Gilroy',
                                color: '#2509594D',
                                paddingTop: 15,
                            }}>
                            No File Chosen
                        </Text>
                    )}

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
                    </View>

                    {templateData && (
                        <VStack
                            space={1}
                            my={3}
                            style={{
                                backgroundColor: '#F2F2F2',
                                padding: 5,
                            }}>
                            {propertyType === 'COMMERCIAL' ? (
                                <>
                                    <TextInputField
                                        placeholder="Office Spaces"
                                        value={officeSpaces}
                                        onChangeText={setofficeSpaces}
                                        style={styles.input}
                                        label="No. of Office Spaces (Per Unit)"
                                        url={require('@/assets/icon/bed_2.png')}
                                        keyboardType={true}
                                    />
                                    <TextInputField
                                        placeholder="Choose rooms"
                                        value={rooms}
                                        onChangeText={setRooms}
                                        style={styles.input}
                                        label="No. of Rooms (Per Unit)"
                                        url={require('@/assets/icon/bath_2.png')}
                                        keyboardType={true}
                                    />
                                    <TextInputField
                                        placeholder="Restrooms"
                                        value={restrooms}
                                        onChangeText={setRestrooms}
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
                                        value={bedRoom}
                                        onChangeText={setBedRoom}
                                        style={styles.input}
                                        label="No. of Bedroom"
                                        url={require('@/assets/icon/bed_2.png')}
                                        keyboardType={true}
                                    />

                                    <TextInputField
                                        placeholder="Choose Bathrooms"
                                        value={bathRoom}
                                        onChangeText={setBathroom}
                                        style={styles.input}
                                        label="No. of Bathrooms"
                                        url={require('@/assets/icon/bath_2.png')}
                                        keyboardType={true}
                                    />
                                </>
                            )}

                            {templateData &&
                                templateData.areas
                                    .filter(
                                        area =>
                                            !area.title.startsWith('Bedroom') &&
                                            !area.title.startsWith('Bathroom'),
                                    )
                                    .map(area => {
                                        const isSelected = selectedAreas.find(
                                            s => s.id === area.id,
                                        )
                                            ? true
                                            : false;

                                        return (
                                            <View
                                                key={area.id}
                                                style={styles.switchStyle}>
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
                                                        Platform.OS == 'ios'
                                                            ? 'sm'
                                                            : 'lg'
                                                    }
                                                    isChecked={isSelected}
                                                    onChange={() => {
                                                        if (isSelected) {
                                                            setSelectedAreas(
                                                                selectedAreas.filter(
                                                                    selectedArea =>
                                                                        selectedArea.id !==
                                                                        area.id,
                                                                ),
                                                            );
                                                        } else {
                                                            setSelectedAreas([
                                                                ...selectedAreas,
                                                                area,
                                                            ]);
                                                        }
                                                    }}
                                                    onTrackColor="#9A46DB"
                                                    offTrackColor="#B598CB"
                                                    thumbColor="#fff"
                                                />
                                            </View>
                                        );
                                    })}
                        </VStack>
                    )}

                    {/* <Box
                        style={styles.switchMain}
                        mb={templateData != null ? 0 : 5}
                        mt={2}>
                        {templateData ? (
                            <>
                                {templateData.areas
                                    .filter(
                                        area =>
                                            !area.title.startsWith('Bedroom') &&
                                            !area.title.startsWith('Bathroom'),
                                    )
                                    .map((area, i) => {
                                        const isSelected = selectedAreas.find(
                                            s => s.id === area.id,
                                        )
                                            ? true
                                            : false;

                                        return (
                                            <Box
                                                key={area.id}
                                                style={styles.switchContainer}>
                                                <Switch
                                                    size={'lg'}
                                                    defaultIsChecked={
                                                        isSelected
                                                    }
                                                    onChange={() => {
                                                        if (isSelected) {
                                                            setSelectedAreas(
                                                                selectedAreas.filter(
                                                                    selectedArea =>
                                                                        selectedArea.id !==
                                                                        area.id,
                                                                ),
                                                            );
                                                        } else {
                                                            setSelectedAreas([
                                                                ...selectedAreas,
                                                                area,
                                                            ]);
                                                        }
                                                    }}
                                                />
                                                <Text
                                                    color={'my.t3'}
                                                    style={{flexWrap: 'wrap'}}
                                                    maxW="55%">
                                                    {area.title}
                                                </Text>
                                            </Box>
                                        );
                                    })}
                            </>
                        ) : null}
                    </Box> */}

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
                            onCkick={handleNext}
                            //         onCkick={()=> {
                            //               navigation.navigate('AmenitiesAdd', {
                            //     propertyId: 7,
                            //     propertyType: 'COMMERCIAL',
                            // });
                            //         }}
                            isLoading={isLoading}
                        />
                    </View>
                    {/* <VStack style={styles.footerContainer}>
                        <Box style={styles.footerBox} />
                        <HStack
                            alignItems={'center'}
                            justifyContent={'center'}
                            style={
                                isLoading
                                    ? {
                                          ...styles.footerBtn,
                                          backgroundColor:
                                              'rgba(265,265,265,0.7)',
                                      }
                                    : styles.footerBtn
                            }
                            my={'auto'}
                            mx={'auto'}>
                            {isLoading && <Spinner color={'my.h3'} />}
                            <Text
                                bold
                                fontSize={'lg'}
                                color={'rgba(10,113,199,0.9)'}
                                onPress={handleNext}>
                                Next
                            </Text>
                        </HStack>
                    </VStack> */}
                </View>
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
                        <ScrollView>
                            {templates.length > 0
                                ? templates?.map((item: any, i: number) => {
                                      return (
                                          <TouchableOpacity
                                              onPress={() => {
                                                  setPropertyType(item.type);
                                                  setPropertTypeValue(
                                                      item.title,
                                                  );
                                                  //   setPropertyType(item.id),
                                                  refRBSheet.current.close();
                                              }}
                                              style={{padding: 5}}>
                                              <Text style={{color: '#9A46DB'}}>
                                                  {item.title}
                                              </Text>
                                          </TouchableOpacity>
                                      );
                                  })
                                : null}
                        </ScrollView>
                    </ScrollView>
                </View>
            </RBSheet>
        </>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#F2F2F2',
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
});

export default EditProperty;
