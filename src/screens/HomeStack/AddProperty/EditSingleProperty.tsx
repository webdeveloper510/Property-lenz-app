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
   Alert
} from 'react-native';

import {
    Text,
    Box,
    HStack,
    Button,

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
import {apiAddMyProperties, apiAddMySingleProperties,apiUpdateProperties} from '@/apis/property';
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

const EditSingleProperty = ({navigation}: any): React.JSX.Element => {
    const route = useRoute();
    const dispatch = useAppDispatch();
    const propertyList: PropertyItem[] = route.params?.data?.properties ?? [];
    const [properties, setProperties] = useState(propertyList);
    // console.log('🚀 ~ AmenitiesEditScreen ~ properties:', properties[0].areas);

    const updatePropertyTitle = (propertyIndex: number, value: string) => {
        const updated = [...properties];
        updated[propertyIndex].name = value;
        setProperties(updated);
    };

    const deleteArea = (propertyIndex, areaIndex) => {
        const updated = [...properties];

        // Remove area at given index
        updated[propertyIndex].areas.splice(areaIndex, 1);

        setProperties(updated);
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
                                // textAlign: 'center',
                            }}
                            onChangeText={(text: string) =>
                                updatePropertyTitle(index, text)
                            }
                        />
                        <Image
                            source={require('../../../assets/icon/edit_5.png')}
                            style={{
                                width: 19,
                                height: 19,
                                resizeMode: 'center',
                                position: 'absolute',
                                top: -10,
                                right: -10,
                            }}
                        />
                        
                 
                </View>

                {/* BEDROOM SECTION */}
                {/* <Text style={styles.sectionTitle}>Bedroom</Text> */}
                {item.areas.map((area, idx) =>
                    renderArea(index, area, item.areas.indexOf(area)),
                )}
                {/* <View
                    style={{
                        width: '90%',
                        height: 1,
                        backgroundColor: '#D9D9D9',
                        alignSelf: 'center',
                        marginTop: 10,
                    }}
                />
           
                <Text style={styles.sectionTitle}>Bathroom</Text>
                {bathrooms.map((area, idx) =>
                    renderArea(index, area, item.areas.indexOf(area)),
                )} */}
            </View>
        );
    };

    const updateSubTitle = (
        propertyIndex: number,
        areaIndex: number,
        value: string,
    ) => {
        const updated = [...properties];
        updated[propertyIndex].areas[areaIndex].title = value;
        updated[propertyIndex].areas[areaIndex].sub_title = value ? value : '';
        setProperties(updated);
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
                <View style={{width: '80%',height:40}}>
                   
                    {/* <Text style={styles.areaTitle}>{area.title}</Text> */}
                    <TextInput
                        style={styles.secondaryText}
                        placeholder={"Enter amenities name"}
                        value={area.sub_title ? area.sub_title : area.title}
                        onChangeText={(text: string) =>
                            updateSubTitle(propertyIndex, index, text)
                        }
                     
                    />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            width: 1,
                            height: 39,
                            backgroundColor: '#B8ADCD',
                            marginRight: 10,
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
        </LinearGradient>
    );

    const onSubmit = async () => {
        try {
            for (let i = 0; i < properties.length; i++) {
                if (!properties[i].name || properties[i].name.trim() === '') {
                    console.log("############=======>")
                    Alert.alert(`Please enter unit name for Unit ${i + 1}`);
                    return;
                }
            }
            dispatch(showLoader());
           
            console.log('🚀 ~ onSubmit ~ payload:============>', JSON.stringify(properties[0].areas.length));
             
            const response = await apiUpdateProperties(properties[0]);
            console.log("🚀 ~ onSubmit ~ response:", response)
           

            if (response.status) {
                dispatch(hideLoader());
                navigation.replace('PropertyListScreen');
            } else {
                dispatch(hideLoader());
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
                    Edit Property
                </Text>
                <View style={{width:40}}/>
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
        flex:1,
        marginBottom: 10,
        position:'relative',
        width:'40%'
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
        paddingLeft: 20,
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
    },
    contentWrapper: {
        flexDirection: 'row',
        flex: 1, // Takes up remaining space
        paddingRight: 10, // Padding before the (potential) divider
        justifyContent: 'space-between',
    },
    primaryText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3A2E5B', // Dark purple text
        marginBottom: 2,
    },
    secondaryText: {
        fontSize: 14,
        color: '#3A2E5B',
        padding: 0,
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

export default EditSingleProperty;
