import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    Pressable,
} from 'react-native';
import {
    Input,
    Box,
    Alert,
    HStack,
    Switch,
    Select,
    VStack,
    Modal,
    Button,
    Spinner,
    Menu,
} from 'native-base';
import BackButton from '@/components/BackButton';
import {apiGetPropertyList, apiDeleteProperties} from '@/apis/property';
import {propertyList} from '@/services/types';
import {hideLoader, showLoader} from '@/state/loaderSlice';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import Edit from '@/assets/icon/edit_3.png';
import Delete from '@/assets/icon/delete_21.png';
import Eye from '@/assets/icon/eye_21.png';
import FastImage from 'react-native-fast-image';
import Amen from '@/assets/icon/amen.png';
const data = [
    {
        id: 1,
        name: 'Move Out Nirman',
        location: 'Mississauga, ON',
        image: require('../../assets/logo/Splash.png'),
    },
    {
        id: 2,
        name: 'Move Out Nirman',
        location: 'Mississauga, ON',
        image: require('../../assets/logo/Splash.png'),
    },
    {
        id: 3,
        name: 'Move Out Nirman',
        location: 'Mississauga, ON',
        image: require('../../assets/logo/Splash.png'),
    },
    {
        id: 4,
        name: 'Move Out Nirman',
        location: 'Mississauga, ON',
        image: require('../../assets/logo/Splash.png'),
    },
    // Add more items...
];

const PropertyListScreen = ({navigation}: any): React.JSX.Element => {
    const [page, setPage] = useState<number>(1);
    const [list, setList] = useState<propertyList[]>([]);
    const [carry, setCarry] = useState<any>(null);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const [deleteId, setDeleteId] = useState<any | null>(null);
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        getList();
    }, []);

    const DeleteProperty = async () => {
        let data = {
            id: deleteId,
        };
        const response = await apiDeleteProperties(data);
        if (response.status) {
            getList();
        }
    };
    const getList = async () => {
        dispatch(showLoader());
        const response = await apiGetPropertyList({
            per_page: 50,
            page_no: page,
        });
        console.log(
            '🚀 ~ getList ~ response.result.data:',
            response.result.data[0],
        );
        if (response.status) {
            setList(response.result.data);
            dispatch(hideLoader());
            // setTotalPage(response.result.meta_info.total_pages);
        }
    };
    // navigation.navigate('AmenitiesAdd', { propertyId: propertyId, propertyType: propertyType });
    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,

                        marginTop: Platform.OS == 'ios' ? 0 : 30,
                        justifyContent: 'space-between',
                    }}>
                    {/* <BackButton navigation={navigation} /> */}
                    <TouchableOpacity
                        style={styles.backIcon}
                        onPress={() => {
                            navigation.navigate('HomeTab');
                        }}>
                        <Image
                            alt="back"
                            source={require('../../assets/icon/back.png')}
                            resizeMode="contain"
                            style={{width: 14, height: 14}}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 18,
                            color: '#250959',
                            fontWeight: '700',
                        }}>
                        Property List
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('AddPropertyScreen')
                        }>
                        <Image
                            source={require('../../assets/icon/add_c.png')}
                            style={{width: 24, height: 24}}
                        />
                    </TouchableOpacity>
                </View>
                {list.length == 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#F3F3F3', // light grey background like screenshot
                            paddingHorizontal: 25,
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
                ) : (
                    <FlatList
                        data={list}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{paddingBottom: 20}}
                        renderItem={({item}) => {
                            return (
                                <View style={styles.card}>
                                    <FastImage
                                        source={
                                            item.cover_image
                                                ? {uri: item.cover_image}
                                                : require('../../assets/icon/home_n.png')
                                        }
                                        style={styles.image}
                                    />

                                    <View style={{flex: 1, marginLeft: 12}}>
                                        <Text style={styles.title}>
                                            {item.name?.slice(0, 15)}
                                            {item.name?.length > 15
                                                ? '...'
                                                : ''}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 5,
                                            }}>
                                            <Image
                                                source={require('../../assets/icon/location_3.png')}
                                                style={{width: 11, height: 11}}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={[
                                                    styles.location,
                                                    {
                                                        paddingLeft: 5,
                                                        fontSize: 13,
                                                        color: '#250959',
                                                        fontWeight: '600',
                                                    },
                                                ]}>
                                                Location:
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.location,
                                                    {paddingLeft: 5},
                                                ]}>
                                                {item.location?.slice(0, 22)}
                                                {item.location?.length > 22
                                                    ? '...'
                                                    : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 50,
                                            borderWidth: 1,
                                            borderColor: '#F3E7FD',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            // position: 'absolute',
                                        }}
                                        onPress={() => {
                                            navigation.navigate(
                                                'Details',
                                                item?.id,
                                            );
                                            //  navigation.navigate('AmenitiesAdd', { propertyId: item?.id, propertyType: item?.type });
                                        }}>
                                        <Image
                                            source={require('../../assets/icon/right_2.png')}
                                            style={{
                                                width: 11,
                                                height: 11,
                                                tintColor: '#9A46DB',
                                            }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                    {/* <View
                                        style={{
                                            width: '25%',
                                            alignItems: 'flex-end',
                                        }}>
                                        <Menu
                                           
                                            w="140"
                                            style={{
                                                borderRadius: 10,
                                                marginRight: 20,
                                            }}
                                            trigger={triggerProps => {
                                                return (
                                                    <TouchableOpacity
                                                        {...triggerProps}>
                                                        <Image
                                                            source={require('../../assets/icon/menu_3.png')}
                                                            style={{
                                                                width: 29,
                                                                height: 29,
                                                                resizeMode:
                                                                    'contain',
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            }}>
                                            <Menu.Item
                                                style={{
                                                    flexDirection: 'row',
                                                    backgroundColor: '#ECE6F3',
                                                    marginHorizontal: 16,
                                                    borderRadius: 5,
                                                }}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                   
                                                            navigation.replace(
                                                                'EditRoot',
                                                                {
                                                                    propertyId:
                                                                        item.id,
                                                                },
                                                            );
                                                   
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
                                                        navigation.navigate(
                                                            'Details',
                                                            item?.id,
                                                        );
                                                    }}
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
                                                        // navigation.navigate(
                                                        //     'Details',
                                                        //     item?.id,
                                                        // );
                                                        navigation.navigate('AmenitiesAdd', { propertyId: item?.id, propertyType: item?.type });
                                                    }}
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}>
                                                    <Image
                                                        source={Amen}
                                                        alt="icon"
                                                        style={styles.icon}
                                                        tintColor={'#8877A6'}
                                                    />
                                                    <Text
                                                        style={{
                                                            paddingLeft: 5,
                                                        }}>
                                                        amenities
                                                    </Text>
                                                </TouchableOpacity>
                                            </Menu.Item>
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
                                                        setModalVisible(true);
                                                        setDeleteId(item.id);
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
                                    </View> */}
                                </View>
                            );
                        }}
                    />
                )}
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
                                fontSize: 18,
                                fontFamily: 'Gilroy-Regular',
                                fontWeight: '700',
                                textAlign: 'center',
                            }}>
                            Are you sure you want to delete this property?
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
                                DeleteProperty();
                                setModalVisible(false);
                            }}>
                            <Text style={{color: '#9A46DB'}}>Delete</Text>
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </SafeAreaView>
    );
};
export default PropertyListScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 18,
        // paddingTop: 20,
    },
    backIcon: {
        height: 50,
        width: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        elevation: 3,
    },
    header: {
        textAlign: 'center',
        fontSize: 18,
        color: '#250959',
        fontWeight: '700',
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 14,
        elevation: 1,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    title: {
        fontSize: 15,
        color: '#250959',
        fontWeight: '700',
    },
    location: {
        fontSize: 12,
        color: '#6A6A6A',
    },
    arrowBox: {
        borderColor: '#F3E7FD',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    arrow: {
        fontSize: 14,
        color: '#9A46DB',
        fontWeight: 'bold',
    },
    buttonCircle: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 35,
        borderColor: '#F3E7FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon1: {
        height: 80,
        width: 80,
        resizeMode: 'contain',
    },
    icon: {
        height: 19,
        width: 19,
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
