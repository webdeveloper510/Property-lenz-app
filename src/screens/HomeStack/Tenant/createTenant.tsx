import React, {useState, useEffect} from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';
import {
    Text,
    Box,
    Alert,
    Image,
    HStack,
    Input,
    ScrollView,
    VStack,
    FormControl,
    Button,
    Switch,
} from 'native-base';
import {Create_Tenant} from '@/services/types';
import {apiCreateTenant} from '@/apis/tenant';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {warningTimer} from '@/constant/customHooks';
import {apiGetPropertyList} from '@/apis/property';
import Back from '@/assets/icon/btnBack.png';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Platform} from 'react-native';
import BackButton from '@/components/BackButton';
import TextInputField from '@/components/TextInputField';
import CommanButton from '@/components/CommanButton';
import AddressSelector from '@/components/addressComponent';
import PhoneInputField from '@/components/PhoneInputField';
const AddressSelectorComponent: any = AddressSelector;

const CreateTenant = ({route, navigation}: any): React.JSX.Element => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode,setCountryCode] = useState('');
    const [phone, setPhone] = useState('');
    const [address1, setAddress1] = useState('');
    const [isChecked, setIsChecked] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [propertyData, setPropertyData] = useState([]);
    console.log("🚀 ~ CreateTenant ~ propertyData:", propertyData)
    const [list, setList] = useState([]);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [company, setCompanyName] = useState('');
    const [errMsg, setErrMsg] = useState({
        message: '',
        error: false,
        show: false,
    });
    const navigateToScreenB = (data: any) => {
        route?.params?.onGoBack(data);
        navigation.goBack();
    };
    const showError = async (message: string, duration: number) => {
        setErrMsg({message, error: true, show: true});
        const timer = await warningTimer(duration);
        if (timer) {
            setErrMsg({message: '', error: false, show: false});
        }
    };
    const handleError = async () => {
        const addNewRenterValidations = [
            {condition: !firstName.trim(), message: 'Please Give First Name'},
            {condition: !lastName.trim(), message: 'Please Give Last Name'},
            {condition: !email.trim(), message: 'Please Give Email Address'},
            {
                condition: !email.includes('@'),
                message: 'Please Give A Proper Email Address',
            },
            {condition: !phone.trim(), message: 'Please Give Phone Number'},
        ];

        for (const {condition, message} of addNewRenterValidations) {
            if (condition) {
                await showError(message, 2);
                return;
            }
        }
        AddRenter();
    };

    const AddRenter = async () => {
        setIsLoading(true);
        const data: Create_Tenant = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone: phone,
            status: isChecked ? 1 : 0,
            company: company,
            property_ids: propertyData,
            notes: notes,
            country_code:countryCode
            // address: address1.trim(),
        };
        console.log("🚀 ~ AddRenter ~ data:", data)
        const response = await apiCreateTenant(data);
        if (response.status) {
            setErrMsg({
                message: 'Successfully Created Renter!',
                error: false,
                show: true,
            });
            const timer = await warningTimer(1);
            timer && setErrMsg({message: '', error: false, show: false});
            timer && navigateToScreenB(response.result);
        } else {
            console.log("error response",response.message)
            setIsLoading(false);
            setErrMsg({message: response.message, error: true, show: true});
            const timer = await warningTimer(3);
            timer && setErrMsg({message: '', error: false, show: false});
        }
    };

    const handleAddressSelect = (item: any) => {
        console.log('Final Selection:', item.name);
        // 1. Update the main form state with the selected address
        // 2. Close the modal
        setModalVisible(false);
    };

    useEffect(() => {
        getList();
    }, []);

    const getList = async () => {
        const response = await apiGetPropertyList({
            per_page: 50,
            page_no: 1,
        });
        if (response.status) {
            setList(response.result.data);
        }
    };
    const selectedNames = list
        .filter(item => propertyData.includes(item.id))
        .map(item => item.name);

    const handleRemove = (name: string) => {
        // Get the property id of this name
        const matchedItem = list.find(item => item.name === name);

        if (matchedItem) {
            setPropertyData(prev => prev.filter(id => id !== matchedItem.id));
        }
    };

    // Output: ["New Property", "Test 1113"]

    return (
        <SafeAreaView>
            <View
                style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 25,
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                    }}>
                    Add Renter
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
                    {/* <TextInputField
                        placeholder="Enter your phone"
                        value={phone}
                        onChangeText={setPhone}
                        url={require('../../../assets/icon/phone_2.png')}
                        label={'Phone'}
                    /> */}
                    <PhoneInputField
                        placeholder="Enter your phone"
                        value={phone}  
                        label={'Phone'}
                        onChangeText={setPhone}
                        onCallBack={(txt:any)=> setCountryCode(txt)}
                        code = {countryCode}
                        />
                    {/* <TextInputField
                    placeholder="Enter your address"
                    value={address1}
                    onChangeText={setAddress1}
                    url={require('../../../assets/icon/location_2.png')}
                    label={'Address*'}
                /> */}
                    <TextInputField
                        placeholder="Enter your company"
                        value={company}
                        onChangeText={setCompanyName}
                        url={require('../../../assets/icon/company.png')}
                        label={'company Name'}
                        optional={'optional'}
                    />
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
                                    paddingLeft: 10,
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
                            marginVertical: 10,
                            alignSelf: 'center',
                        }}
                    />

                    <View style={styles.cardFrame}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                Associated {'\n'}Properties
                            </Text>
                            {/* <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setModalVisible(true)}>
                           
                                <Image
                                    source={require('../../../assets/icon/plus.png')}
                                    style={{width: 11, height: 11}}
                                />
                                <Text style={styles.labelButtonText}>
                                    Add Property Address
                                </Text>
                            </TouchableOpacity> */}
                        </View>

                        {/* Content Section - Property and Notes */}
                        <View style={styles.contentArea}>
                            {/* Property Address Input Box */}
                            <TouchableOpacity style={styles.propertyBox} onPress={()=> setModalVisible(true)}>

                                <Text style={styles.propertyLabel}>
                                    Property 1 Address
                                </Text>
                                {selectedNames.length > 0 ? (
                                    selectedNames.map((name, index) => (
                                        <View style={styles.listItem}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleRemove(name)
                                                }
                                                style={styles.closeBtn}>
                                                <Image
                                                    source={require('../../../assets/icon/close_2.png')}
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                    }}
                                                />
                                            </TouchableOpacity>
                                            <Text
                                                key={index}
                                                style={{
                                                    fontFamily: 'Gilroy',
                                                    color: '#250959',
                                                }}>
                                                {name}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'Gilroy',
                                            color: '#B598CB4D',
                                        }}>
                                        Choose Address...
                                    </Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>

                            {/* Notes Input Box */}
                            <View style={styles.notesBox}>
                                <Text style={styles.notesLabel}>Notes</Text>
                                <TextInput
                                    placeholder="Add any relevant notes..."
                                    multiline={true}
                                    value={notes}
                                    numberOfLines={8}
                                    onChangeText={setNotes}
                                    style={styles.textArea}
                                />
                            </View>
                        </View>
                    </View>
                    <VStack mt={3} space={3} justifyContent={'center'}>
                        {errMsg.show && (
                            <Alert
                                w="100%"
                                status={errMsg.error ? 'danger' : 'success'}
                                mt={2}>
                                <Text
                                    fontSize="md"
                                    color={
                                        errMsg.error ? 'red.500' : 'green.500'
                                    }>
                                    {errMsg.message}
                                </Text>
                            </Alert>
                        )}
                        {/* <Button isLoading={isLoading} mt={10} size={'lg'} style={styles.button} onPress={() => { handleError(); }}>Create Renter</Button> */}
                    </VStack>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginHorizontal: 20,
                            justifyContent: 'space-between',
                        }}>
                        <CommanButton
                            label={'Cancel'}
                            // isLoading={isLoading}
                            onCkick={() => navigation.goBack()}
                            width={'45%'}
                            color={'#ffffff'}
                            titleColor={'#9945DA'}
                        />
                        <CommanButton
                            label={'Create Renter'}
                            isLoading={isLoading}
                            onCkick={handleError}
                            width={'50%'}
                        />
                    </View>

                    <Modal
                        animationType="slide" // This creates the smooth slide-up animation
                        transparent={true} // Required to see the background
                        visible={modalVisible}
                        onRequestClose={() => {
                            // For Android hardware back button
                            setModalVisible(false);
                        }}>
                        {/* The component from the previous example goes here,
            but we wrap it in a custom view to handle the semi-transparent background. 
        */}
                        <AddressSelectorComponent
                            onClose={item => {
                                setModalVisible(false), setPropertyData(item);
                            }}
                            onSelect={handleAddressSelect}
                            initialSelectedIds={propertyData}
                            data={list}
                        />
                    </Modal>
                </View>
                <View style={{height: 110}} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#F2F2F2',
        minHeight: hp('100%'),
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    formContainer: {
        padding: 5,
        backgroundColor: 'rgba(203, 203, 203, 0.9)',
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
    footerContainer: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        height: 100,
        marginLeft: -20,
        marginRight: -20,
        position: 'relative',
        bottom: 0,
    },
    footerBox: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        elevation: 3,
        height: 5,
    },
    footerBtn: {
        backgroundColor: '#fff',
        width: 160,
        height: 40,
        borderRadius: 10,
    },
    button: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        height: 50,
        width: 180,
        alignSelf: 'center',
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
    cardFrame: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        paddingBottom: 20,
        // Mimics the rounded container with the purple border from the image
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BF56FF', // A light purple color
        backgroundColor: '#f9f9f9', // Slightly off-white background inside the card
    },

    // --- Header Styles ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#250959', // Deep purple text
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: '#FFFFFF', // Purple background for the button
        // Shadow for a slight lift (optional)
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        borderColor: '#BF56FF',
    },
    labelButtonText: {
        color: '#250959',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 5,
        fontFamily: 'Gilroy-Regular',
    },

    // --- Content Styles ---
    contentArea: {
        paddingBottom: 20,
        borderWidth: 1,
        borderColor: '#B598CB4D',
        borderRadius: 20,
        backgroundColor: '#B598CB4D',
        // Space for the floating button cluster
    },

    // Shared box style
    inputBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10, // Space between the property and notes box
        // Subtle shadow for the 'floating' effect of the boxes
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Property Box
    propertyBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        padding: 10,
        // ...this.inputBox,
    },
    propertyLabel: {
        fontSize: 10,
        color: '#250959',
        fontFamily: 'Gilroy-Regular',
    },
    propertyValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },

    // Notes Box
    notesBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        padding: 10,
        // ...this.inputBox,
        minHeight: 100, // Make the notes box taller
    },
    notesLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    notesPlaceholder: {
        fontSize: 16,
        color: '#aaa',
        fontStyle: 'italic',
    },

    // --- WJ Cluster Styles ---
    wjCluster: {
        position: 'absolute',
        bottom: -5, // Adjust vertical position to make it "stick out" of the bottom
        right: 15, // Adjust horizontal position
        flexDirection: 'row',
        alignItems: 'center',
    },
    clusterCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3, // Border to mimic the white outline
        borderColor: '#f9f9f9', // Should match the inner card background color
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    clusterText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    textArea: {
        height: 100,
        // padding: 10,
        textAlignVertical: 'top', // Ensures text starts at the top on Android
    },
    listItem: {
        borderWidth: 1,
        width: '30%',
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#250959',
        borderRadius: 5,
    },
    closeBtn: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position:'absolute',
        right:-12,
        top:-12
    },
});

export default CreateTenant;
