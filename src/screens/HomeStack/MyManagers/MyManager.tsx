import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    SafeAreaView,
    Platform,
    Dimensions
} from 'react-native';
import {Text, Button, Box, HStack, ScrollView, Alert} from 'native-base';
import {useIsFocused} from '@react-navigation/native';
import _header from '@/components/_header';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
    apiAllManager,
    apiAllTenant,
    apiDeleteManager,
    apiTenantManager,
} from '@/apis/user';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setSideBar} from '@/state/propertyDataSlice';
import {MyManagers, MyTenants} from '@/services/types';
import {HomeProps} from '@/constant/SideBarRoutes';
import {warningTimer} from '@/constant/customHooks';
import _cardManager from './_cardManager';
import SideBar from '@/components/SideBar';
import Mangers from './Manager';
import Tenants from './Tenant';
import HeaderHome from '@/components/headerHome';
const { height: windowHeight } = Dimensions.get('window');
const MyManager = ({navigation, route}: any): React.JSX.Element => {
    const id = route?.params?.id ?? 'user';
    console.log('🚀 ~ MyManager ~ route:', route.params);

    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const userData: any = useAppSelector(state => state.auth.userData);
    const [mangerData, setManagerData] = useState<MyManagers[]>([]);
    const [renterData, setRenterData] = useState<MyTenants[]>([]);

    const [role, setRole] = useState(() => (id === 'user' ? 1 : 2));
    console.log('ID FROM ROUTE:', id);
    console.log('ROLE:', role);
    const [selected, setSelected] = useState('Renter');
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });
    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();
    const [searchText, setSearchText] = useState('');
    const sideBarHide = () => {
        dispatch(setSideBar(!sideBarStatus));
    };

    const getManager = async () => {
        const response = await apiAllManager({
            per_page: 20,
            page_no: 1,
            q: searchText,
        });
        console.log('🚀 ~ getManager ~ response:', response);
        if (response.status) {
            setManagerData(response.result.data);
        }
    };
    const getTenant = async () => {
        const response = await apiAllTenant({
            per_page: 50,
            page_no: 1,
            q: searchText,
        });
        console.log('🚀 ~ getTenant ~ response:', response.result.data[0]);
        if (response.status) {
            setRenterData(response.result.data);
        }
    };
    const deleteManager = async (mID: number) => {
        const response = await apiDeleteManager({id: mID});
        if (response.status) {
            setErrMsg({message: response.message, error: false, show: true});
            getManager();
            const timer = await warningTimer(1);
            timer && setErrMsg({message: '', error: false, show: false});
        } else {
            setErrMsg({message: response.message, error: true, show: true});
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };
    const deleteRenter = async (tID: number) => {
        const response = await apiTenantManager({id: tID});
        if (response.status) {
            setErrMsg({message: response.message, error: false, show: true});
            getTenant();
            const timer = await warningTimer(1);
            timer && setErrMsg({message: '', error: false, show: false});
        } else {
            setErrMsg({message: response.message, error: true, show: true});
            const timer = await warningTimer(2);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };

    useEffect(() => {
        (async () => {
            if (isFocused) {
                role == 1 ? getManager() : getTenant();
            }
        })();
    }, [isFocused, role, searchText]);

    useEffect(() => {
        if (route?.params?.id) {
            setRole(route.params.id === 'user' ? 1 : 2);
        }
    }, [route?.params?.id]);

    useEffect(() => {}, [mangerData, renterData]);

    return (
        <SafeAreaView>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}
            {/* <View style={{marginHorizontal:17,marginTop:12,paddingVertical:5}}>
     <_header location={'Users'}/>
     </View> */}
            <View
                style={{
                    marginHorizontal: 18,
                    marginTop: Platform.OS == 'ios' ? 0 : 19,
                    paddingVertical: 5,
                }}>
                <HeaderHome location={'Users'} navigation={navigation} />
            </View>
            <ScrollView>
                <Box style={styles.mainContainer}>
                    {userData.type == 'OWNER' && (
                        <View style={styles.container}>
                            {/* User Button */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    role === 1
                                        ? styles.activeLeft
                                        : styles.inactiveLeft,
                                ]}
                                onPress={() => setRole(1)}>
                                <Text
                                    style={[
                                        styles.text,
                                        {
                                            color:
                                                role === 1
                                                    ? '#ffffff'
                                                    : '#3D0C63',
                                        },
                                        role == 1 && {fontWeight: 'bold'},
                                    ]}>
                                    Users
                                </Text>
                            </TouchableOpacity>

                            {/* Renter Button */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    role === 2
                                        ? styles.activeRight
                                        : styles.inactiveRight,
                                ]}
                                onPress={() => setRole(2)}>
                                <Text
                                    style={[
                                        styles.text,
                                        {
                                            color:
                                                role === 2 ? '#fff' : '#3D0C63',
                                        },
                                        role === 2 && {fontWeight: 'bold'},
                                    ]}>
                                    Renters
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.container21}>
                        {/* The Main Search Bar Container (with the input and magnifying glass) */}
                        <View style={styles.searchBarWrapper}>
                            {/* The TextInput */}
                            <TextInput
                                style={[styles.textInput, {color: '#957DAD'}]}
                                placeholder="Search here..."
                                placeholderTextColor={'#957DAD'}
                                onChangeText={text => setSearchText(text)}
                            />

                            {/* The Search Icon Button */}
                            <TouchableOpacity
                                style={[
                                    styles.searchButton,
                                    {backgroundColor: '#E0BBE4'},
                                ]}>
                                <Image
                                    source={require('../../../assets/icon/search_3.png')}
                                    style={{width: 20, height: 20}}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* The Action Button (Plus Icon) */}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {backgroundColor: 'white'},
                            ]}
                            onPress={() => {
                                role == 1
                                    ? navigation.navigate('AddManagers')
                                    : navigation.navigate('CreateTenant');
                            }}>
                            <Image
                                source={require('../../../assets/icon/plus.png')}
                                style={{width: 20, height: 20}}
                            />
                        </TouchableOpacity>
                    </View>
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}
                            my={2}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.600'}>
                                {errMsg.message}
                            </Text>
                        </Alert>
                    )}
                    {role == 1 ? (
                        <Mangers
                            mangerData={mangerData}
                            deleteManager={deleteManager}
                        />
                    ) : (
                        <Tenants
                            renterData={renterData}
                            deleteRenter={deleteRenter}
                        />
                    )}
                    {/* <Button style={styles.addButton} mt={3} mx={'auto'} alignSelf={'center'} onPress={()=>{role == 1 ? navigation.navigate('AddManagers') : navigation.navigate('CreateTenant');}}>{`Add ${role == 1 ? 'Manager' : 'Renter'}`}</Button> */}
                </Box>
                <View style={{height: windowHeight * 0.1}} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        padding: 10,
        paddingBottom: 90,
        minHeight: hp('100%'),
        backgroundColor: '#F2F2F2',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    headerButtonActive: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        borderRadius: 0,
    },
    headerButtonInActive: {
        backgroundColor: '#C4C4C4',
        borderRadius: 0,
    },
    addButton: {
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        width: '50%',
        position: 'relative',
        bottom: 10,
    },
    cardBody: {
        padding: 10,
        paddingBottom: 20,
        paddingTop: 20,
        width: '100%',
        elevation: 3,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 0,
        alignSelf: 'center',
        marginVertical: 20,
        height: 60,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
        justifyContent: 'center',
    },
    activeLeft: {
        backgroundColor: '#9C4DFF',
    },
    activeRight: {
        backgroundColor: '#9C4DFF', // purple gradient look
    },
    inactiveLeft: {
        backgroundColor: '#fff',
    },
    inactiveRight: {
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 14,
    },

    container21: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: 10,
        paddingVertical: 10,
        // Add subtle shadow/glow to the whole area if needed
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.05,
        // shadowRadius: 3,
        // elevation: 1,
    },
    searchBarWrapper: {
        flex: 1, // Takes up most of the space
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 70, // Half of the height for a pill shape
        backgroundColor: '#FFFFFF', // Inner background for the wrapper
        paddingHorizontal: 5,
        // Style for the subtle light border/outline shown in the image
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#E0BBE4', // Purple-ish shadow for a glow effect
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // Android shadow
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        paddingLeft: 15, // Space between text and the edge
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20, // Makes it a perfect circle
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5, // Small margin to the right edge of the wrapper
        // Inner shadow/glow to make the button pop
        shadowColor: '#E0BBE4',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25, // Makes it a perfect circle
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Space between search bar and action button
        // Style for the white circle with a shadow
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
});
export default MyManager;
