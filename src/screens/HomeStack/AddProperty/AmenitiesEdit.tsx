import React, {useEffect, useState} from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    ScrollView,
    Platform,
    FlatList,
    TextInput,
    Image,
} from 'react-native';

import {
    Text,
    Box,
    HStack,
    Button,
    Alert,
    Modal,
    Input,
    VStack,
    Divider,
    Switch,
} from 'native-base';
import {useRoute, RouteProp} from '@react-navigation/native';
// https://www.npmjs.com/package/react-native-draggable-flatlist
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import BackIcon from '@/assets/icon/btnBack.png';

import {warningTimer} from '@/constant/customHooks';
import AmenityCard from '@/components/DragAmenityCard/AmenityCard';
import LinearGradient from 'react-native-linear-gradient';
import {apiGetItems, apiNewPictureAreas} from '@/apis/areas';
import {propertyGet} from '@/services/types';
import CommanButton from '@/components/CommanButton';
import BackButton from '@/components/BackButton';
import {apiAddMyProperties, apiAddMySingleProperties} from '@/apis/property';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import {useAppDispatch} from '@/state/hooks';
type AreaItem = {
    title: string;
    type: string;
    area_id: number | null;
    sub_title: string;
};

type PropertyItem = {
    type: string;
    name: string;
    areas: AreaItem[];
};

const AmenitiesEditScreen = ({navigation}: any): React.JSX.Element => {
    const route = useRoute();
    const dispatch = useAppDispatch();
    const propertyList: PropertyItem[] = route.params?.data?.properties ?? [];
    const [properties, setProperties] = useState(propertyList);
    console.log('🚀 ~ AmenitiesEditScreen ~ properties:', properties);
    const [errMsg, setErrMsg] = useState<string | null>(null);
  const updatePropertyTitle = (propertyIndex: number, value: string) => {
    // ❌ Original Bugged Code: updated[propertyIndex].name = value;
    
    // ✅ CORRECTED CODE:
    setProperties(prevProperties =>
        prevProperties.map((property, pIdx) => {
            if (pIdx === propertyIndex) {
                // Create a NEW property object with the updated name
                return { ...property, name: value };
            }
            return property;
        }),
    );
};

  const deleteArea = (propertyIndex: number, areaIndex: number) => {
    // ❌ Original Bugged Code: updated[propertyIndex].areas.splice(areaIndex, 1);
    
    // ✅ CORRECTED CODE:
    setProperties(prevProperties =>
        // 1. Map over the main array (properties)
        prevProperties.map((property, pIdx) => {
            if (pIdx === propertyIndex) {
                
                // 2. Create a NEW areas array, excluding the deleted area
                const updatedAreas = property.areas.filter(
                    (_, aIdx) => aIdx !== areaIndex,
                );
                
                // 3. Create a NEW property object with the new areas array
                return { ...property, areas: updatedAreas };
            }
            return property;
        }),
    );
};
    //  const updateSubTitle = (
    //     propertyIndex: number,
    //     areaIndex: number,
    //     value: string,
    // ) => {
    //     const updated = [...properties];
    //     updated[propertyIndex].areas[areaIndex].sub_title = value;
    //     setProperties(updated);
    // };

    const updateSubTitle = (
    propertyIndex: number,
    areaIndex: number,
    value: string,
) => {
    setProperties(prevProperties =>
        // 1. Map over the main array (PropertyItem)
        prevProperties.map((property, pIdx) => {
            if (pIdx === propertyIndex) {
                // 2. Map over the nested array (AreaItem) to find the one to update
                const updatedAreas = property.areas.map((area, aIdx) => {
                    if (aIdx === areaIndex) {
                        // 3. Create a NEW area object with the updated sub_title
                        return { ...area, sub_title: value };
                    }
                    return area;
                });

                // 4. Create a NEW property object with the new updatedAreas array
                return { ...property, areas: updatedAreas };
            }
            return property;
        }),
    );
};


    const renderUnit = ({item, index}: {item: PropertyItem; index: number}) => {
        // const bedrooms = item.areas.filter(a => a.type === 'bedroom');
        // const bathrooms = item.areas.filter(a => a.type === 'bathroom');

        return (
            <View style={styles.unitContainer}>
                {/* UNIT NUMBER */}
                <View style={styles.unitHeader}>
                    {/* <Text style={styles.unitNumber}>{index + 1}</Text>
                     */}

                    <TextInput
                        placeholder={`${index + 1}`}
                        value={item.name}
                        style={{
                            width: '100%',
                            borderWidth: 1,
                            height: 40,
                            borderRadius: 10,
                            borderColor: '#2509594D',
                            paddingLeft:10
                            // textAlign: 'center',
                        }}
                        onChangeText={(text: string) =>
                            updatePropertyTitle(index, text)
                        }
                    />
                 
                </View>

           
                {item.areas.map((area, idx) => renderArea(index, area, idx))}
          
            </View>
        );
    };


    const updateAreaTitle = (
        propertyIndex: number,
        areaIndex: number,
        value: string,
    ) => {
        setProperties(prevProperties =>
            prevProperties.map((property, pIdx) => {
                if (pIdx === propertyIndex) {
                    const updatedAreas = property.areas.map((area, aIdx) => {
                        if (aIdx === areaIndex) {
                            // Update area.title
                            return { ...area,sub_title:value ? value :'' }; 
                        }
                        return area;
                    });
                    return { ...property, areas: updatedAreas };
                }
                return property;
            }),
        );
    };
    const renderArea = (
        propertyIndex: number,
        area: AreaItem,
        index: number,
    ) => (
        <LinearGradient
            colors={['#B598CB', '#F7F3FF']} // Start color, End color
            start={{x: 0, y: 0.5}} // Gradient starts from the left (0%)
            end={{x: 1, y: 0.5}} // Gradient ends on the right (100%)
            style={styles.gradientContainer} // Apply styles to the gradient view
        >
            {/* Content of your UI element goes inside the gradient */}
            <View style={styles.contentWrapper}>
            <View style={{width: '80%', height: 40}}>
                    <Text style={styles.areaTitle}>{area.title}</Text>
                    <TextInput
                        style={styles.secondaryText}

                        placeholder={"Add name here...."}
                        placeholderTextColor={"#000000"}
                        onChangeText={(text: string) =>
                            updateAreaTitle(propertyIndex, index, text)
                        }
                        // placeholderTextColor="#806CA4" // Darker purple placeholder
                    />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',

                        // backgroundColor:'#ffffff'
                    }}>
                    <View
                        style={{
                            width: 1,
                            height: 39,
                            backgroundColor: '#B8ADCD',
                            marginRight: 10,
                            marginTop:Platform.OS == "ios" ? 0 :12
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            width: 19,
                            height: 19,
                            borderWidth: 1,
                            borderColor: '#B8ADCD',
                            borderRadius: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop:Platform.OS == "ios" ? 0 :12
                        }}
                        onPress={() => deleteArea(propertyIndex, index)}>
                        <Image
                            source={require('../../../assets/icon/close_2.png')}
                            style={{width: 7, height: 7, resizeMode: 'contain'}}
                            tintColor={'#B8ADCD'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Placeholder for the vertical line and close button
            (not included in this specific request, but good to remember placement) */}
            {/* <View style={styles.verticalDivider} />
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeIconText}>×</Text>
        </TouchableOpacity> */}
        </LinearGradient>
    );

   

    const onSubmit = async () => {
        try {
            for (let i = 0; i < properties.length; i++) {
                if (!properties[i].name || properties[i].name.trim() === '') {
                    console.log('############=======>');
                    setErrMsg(`Please enter unit name for Unit ${i + 1}`);
                    return;
                }
            }
            dispatch(showLoader());
            const payload = {
                type: route.params?.data.type,
                cover_image: route.params?.data.cover_image,
                properties: [],
            };
            payload.properties = JSON.stringify(properties);
            const response = await apiAddMySingleProperties(payload);

            if (response.status) {
                dispatch(hideLoader());
                navigation.replace('PropertyListScreen');
            } else {
                dispatch(hideLoader());
                setErrMsg(response.message);
                console.log(response.message);
            }
        } catch (error) {
            console.log('🚀 ~ onSubmit ~ error:', error);
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F2F2F2'}}>
            <View
                style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
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
                <View style={{width: 40}} />
                {/* <TouchableOpacity
                    style={{
                        height: 50,
                        width: 50,
                        // marginTop: 20,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50,
                        elevation: 3,
                    }}>
                  
                </TouchableOpacity> */}
            </View>
            <ScrollView style={{flex: 1}}>
                <FlatList
                    data={properties}
                    renderItem={renderUnit}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={{padding: 15}}
                />
                {errMsg && (
                    <Alert w="100%" status={'danger'} mb={8} mt={2}>
                        <Text fontSize="md" color={'red.500'}>
                            {errMsg}
                        </Text>
                    </Alert>
                )}
                <View style={styles.buttonContainer}>
                    {/* Back Button (White with Purple Text) */}
                    <TouchableOpacity
                        style={[styles.buttonBase, styles.backButton]}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    {/* Submit Button (Purple with White Text) */}
                    <TouchableOpacity
                        style={[styles.buttonBase, styles.submitButton]}
                        onPress={onSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        backgroundColor: '#F2F2F2',
        // height: '100%',
    },
    unitContainer: {
        backgroundColor: '#F7F3FF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BEB6CE',
    },

    unitHeader: {
        flex: 1,
        marginBottom: 10,
        position: 'relative',
        width: '100%',
    },

    unitText: {
        fontSize: 14,
        color: '#9A46DB',
        fontWeight: '700',
        fontFamily: 'Gilroy',
    },

    unitNumber: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C5A3F5',
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 15,
        marginBottom: 8,
        color: '#9A46DB',
        fontFamily: 'Gilroy',
    },

    areaCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2509594D',
    },

    areaTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B2E9F',
    },

    input: {
        marginTop: 5,
        // borderBottomWidth: 1,
        borderColor: '#D8C2FF',
        paddingVertical: 4,
    },

    gradientContainer: {
        width: '100%', // Adjust width as needed
        minHeight: 60,
        marginBottom: 10,
        // paddingLeft: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 15, // Rounded corners for the UI element
        overflow: 'hidden', // Ensures content stays within rounded borders
        borderColor: '#2509594D',
        // Optional: subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        paddingHorizontal:10
    },
    contentWrapper: {
        width:'90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        height:40,
        marginBottom:20
    },
    primaryText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3A2E5B', // Dark purple text
        marginBottom: 2,
    },
    secondaryText: {
        width: '70%',
        // backgroundColor:'red',
        fontSize: 14,
        color: '#3A2E5B',
        padding: 0,
        height:30
    },
    buttonContainer: {
        alignSelf: 'center',
        flexDirection: 'row', // Arrange buttons horizontally
        justifyContent: 'space-around', // Space them out
        width: '99%',
        marginBottom: 20, // Adjust width as needed
    },
    buttonBase: {
        flex: 1, // Each button takes equal space
        marginHorizontal: 10, // Space between buttons
        paddingVertical: 15, // Vertical padding
        borderRadius: 50, // Highly rounded corners (pill shape)
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        // Soft shadow common to both buttons
        elevation: 1, // For Android shadow
    },
    backButton: {
        backgroundColor: '#FFFFFF', // White background
        borderWidth: 1, // Optional: subtle border for definition
        borderColor: '#E0E0E0',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Gilroy',
        color: '#9A46DB', // Medium purple text
    },
    submitButton: {
        backgroundColor: '#8A2BE2', // Medium purple background (same as text in Back button)
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF', // White text
    },
});

export default AmenitiesEditScreen;
