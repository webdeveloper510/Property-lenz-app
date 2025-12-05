import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    Platform,
    Pressable,
} from 'react-native';
import {Menu, Modal, Button,Alert} from 'native-base';
import BackButton from '@/components/BackButton';
import {apiGetTypeInspection} from '@/apis/property';
import {showLoader, hideLoader} from '@/state/loaderSlice';
import Edit from '@/assets/icon/edit_3.png';
import Delete from '@/assets/icon/delete_21.png';
import Eye from '@/assets/icon/eye_21.png';
import FastImage from 'react-native-fast-image';
// Note: You must install react-native-vector-icons for this code to work:
// npm install react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';
import {warningTimer} from '@/constant/customHooks';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import { apiDeleteInspection } from '@/apis/property';
const RecentCompletedScreen = ({navigation, route}: any): React.JSX.Element => {
    const {title} = route.params;
    const [listData, setListData] = useState([]);
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    console.log('🚀 ~ RecentCompletedScreen ~ title:', title);
    const [isLoading, setIsLoading] = useState(false);
    const [InsId,setInsId] = useState('');
    const handleAddressPress = address => {
        console.log('Selected Address:', address.street);
        // Add navigation logic or state update here
    };
       const [errMsg, setErrMsg] = useState({
            msg: '',
            error: false,
            show: false,
        });

    useEffect(() => {
        getInspection();
    }, [title]);

    const getInspection = async () => {
        try {
            dispatch(showLoader());
            let response = await apiGetTypeInspection({
                page_no: 1,
                per_page: 20,
                status: title?.type,
            });
            if (response.status) {
                dispatch(hideLoader());
                setListData(response.result.data);
                if (response.result.data.length <= 0) {
                    setIsLoading(true);
                }
            }
            console.log('🚀 ~ getInspection ~ response:', response.result.data);
        } catch (error) {
            dispatch(hideLoader());
            console.log('error =========>', error);
        }
    };


     const deleteInspection = async () => {
          setModalVisible(false);
        const response = await apiDeleteInspection(InsId);
        if (response.status) {
            getInspection();
          setErrMsg({ msg: response.message, error: false, show: true });
          const timer = await warningTimer(1.5);
          timer && setErrMsg({ msg: '', error: false, show: false });
        } else {
          setErrMsg({ msg: response.message, error: true, show: true });
          const timer = await warningTimer(2);
          timer && setErrMsg({ msg: '', error: false, show: false });
        }
      };
    return (
        <SafeAreaView style={styles.safeArea}>
            <View
                style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 28,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    {title?.title} {title?.subtitle}
                </Text>
                <View style={{width: 40}}></View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {listData.length <= 0 && isLoading && (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#F3F3F3', // light grey background like screenshot
                            paddingHorizontal: 25,
                            marginTop: 90,
                        }}>
                        <Image
                            source={require('../../assets/icon/empty.png')} // replace with your icon
                            style={styles.icon1}
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
                )}
                {listData.map(addr => (
                    // <AddressListItem
                    //     key={addr.id}
                    //     address={addr}
                    //     onPress={() => handleAddressPress(addr)}
                    //     navigation={navigation}
                    // />

                    <TouchableOpacity
                        style={styles.addressItemContainer}
                        disabled={
                            title.type == 'awaiting_review' ? false : true
                        }
                        onPress={() => navigation.navigate('Review', addr?.id)}>
                        <View style={styles.iconContainer}>
                            {/* Checkmark icon (Uses a standard green check for 'selected') */}
                            <Image
                                source={require('@/assets/icon/tick_2.png')}
                                style={{width: 24, height: 24}}
                                tintColor={'#6ACA45'}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.streetText}>
                                {addr?.property.location}
                            </Text>
                        </View>
                        {title.type !== 'awaiting_review' ? (
                            <Menu
                                w="120"
                                style={{
                                    borderRadius: 10,
                                    marginRight: 20,
                                }}
                                trigger={triggerProps => {
                                    return (
                                        <Pressable
                                            accessibilityLabel="More options menu"
                                            {...triggerProps}>
                                            <Image
                                                source={require('@/assets/icon/menu_3.png')}
                                                style={{width: 16, height: 35}}
                                                resizeMode="contain"
                                            />
                                        </Pressable>
                                    );
                                }}>
                                {addr?.status !== 'recent' && (
                                    <Menu.Item
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: '#ECE6F3',
                                            marginHorizontal: 16,
                                            borderRadius: 5,
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                // Functionality: Navigate to Edit screen
                                                navigation.navigate('Areas', {
                                                    id: addr?.id,
                                                });
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                            }}>
                                            <Image
                                                source={Edit}
                                                alt="icon"
                                                style={styles.icon}
                                                tintColor={'#8877A6'}
                                            />
                                            <Text
                                                style={{
                                                    paddingLeft: 5,
                                                }}>
                                                Edit
                                            </Text>
                                        </TouchableOpacity>
                                    </Menu.Item>
                                )}

                                {/* --- 2. VIEW Option: Visible for ALL statuses (when the menu is present) --- */}
                                <Menu.Item
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#ECE6F3',
                                        marginHorizontal: 16,
                                        borderRadius: 5,
                                        // Add top margin if 'Edit' is hidden to space from the top of the menu
                                        marginTop:8,
                                    }}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.replace(
                                                'Review',
                                                addr?.id,
                                            )
                                        }
                                        style={{
                                            flexDirection: 'row',
                                        }}>
                                        <Image
                                            source={Eye}
                                            alt="icon"
                                            style={styles.icon}
                                            tintColor={'#8877A6'}
                                        />
                                        <Text
                                            style={{
                                                paddingLeft: 5,
                                            }}>
                                            View
                                        </Text>
                                    </TouchableOpacity>
                                </Menu.Item>

                                {/* --- 3. DELETE Option: Visible for ALL statuses (when the menu is present) --- */}
                                <Menu.Item
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#ECE6F3',
                                        marginHorizontal: 16,
                                        borderRadius: 5,
                                        marginTop: 8,
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setInsId(addr?.id)
                                            // Functionality: Open confirmation modal
                                            setModalVisible(true);
                                        }}
                                        style={{
                                            flexDirection: 'row',
                                        }}>
                                        <Image
                                            source={Delete}
                                            alt="icon"
                                            style={styles.icon}
                                            tintColor={'#8877A6'}
                                        />
                                        <Text
                                            style={{
                                                paddingLeft: 5,
                                            }}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </Menu.Item>
                            </Menu>
                        ) : null}
                    </TouchableOpacity>
                ))}
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}>
                            <Text style={{color : errMsg.error ? 'red' : 'green' ,fontSize:16}}>
                                {errMsg.msg}
                            </Text>
                        </Alert>
                    )}
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
                            Delete
                        </Text>
                    </Modal.Header>
                    <Modal.Body>
                        <Text
                            style={{
                                color: '#250959',
                                fontSize: 16,
                                fontFamily: 'Gilroy-Regular',
                                fontWeight: '700',
                                textAlign: 'center',
                            }}>
                            Are you sure you want to delete this Inspection?
                        </Text>
                    </Modal.Body>
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
                            onPress={() => setModalVisible(false)}>
                            <Text style={{color: '#9A46DB'}}>Cancel</Text>
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
                            onPress={() => {
                                deleteInspection();
                              
                            }}>
                            <Text style={{color: '#9A46DB'}}>Delete</Text>
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </SafeAreaView>
    );
};

// --------------------------------------------------------------------------
// --- Stylesheet ---
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light grey background for the entire screen
    },
    scrollViewContent: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    addressItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12, // Rounded corners
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 10, // Space between items
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        // Elevation for Android
        elevation: 3,
    },
    iconContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1, // Allows text to fill the middle space
    },
    streetText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    zipCountryText: {
        fontSize: 13,
        color: '#777',
    },
    arrowContainer: {
        marginLeft: 15,
    },
    icon: {
        height: 19,
        width: 19,
        resizeMode: 'contain',
    },
    icon1: {
        height: 80,
        width: 80,
        resizeMode: 'contain',
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

export default RecentCompletedScreen;
