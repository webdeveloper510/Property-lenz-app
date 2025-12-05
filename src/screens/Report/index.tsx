import React, {useEffect, useState, useRef} from 'react';
import {Pressable, StyleSheet, TouchableOpacity, View,SafeAreaView,Platform} from 'react-native';
import {
    Text,
    Box,
    Image,
    HStack,
    VStack,
    Select,
    Alert,
    ScrollView,
    Button,
} from 'native-base';
import SideBar from '@/components/SideBar';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import {HomeProps} from '@/constant/SideBarRoutes';
import _header from '@/components/_header';
import _runReportCard from '@/components/_runReportCard';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setSideBar} from '@/state/propertyDataSlice';
import {apiGetReports} from '@/apis/home';
import {apiGetMyProperties} from '@/apis/property';
import {apiSearchTenant} from '@/apis/tenant';
import {propertyGet, SearchTenant} from '@/services/types';
import Back from '@/assets/icon/btnBack.png';
import {useIsFocused} from '@react-navigation/native';
import DatePicker from '@/components/DatePicker';
import CommanButton from '@/components/CommanButton';
import TextInputField from '@/components/TextInputField';
import RBSheet from 'react-native-raw-bottom-sheet';
import HeaderHome from '@/components/headerHome';
import {height} from 'styled-system';
const Report = ({navigation}: any): React.JSX.Element => {
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState<any>(new Date());
    const [endDate, setEndDate] = useState<any>(new Date());
    const [reportData, setReportData] = useState<any[]>([]);
    const [propertyData, setPropertyData] = useState<propertyGet[]>([]);
    const [tenant, setTenant] = useState<SearchTenant[] | any[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<any>('');
    console.log("🚀 ~ Report ~ selectedProperty:", selectedProperty)
    const [selectedPropertyname, setSelectedPropertyName] = useState<any>('');
    const [selectedTenant, setSelectedTenant] = useState<any>('');
    const [selectedTenantName, setSelectedTenantName] = useState<any>('');
    console.log("🚀 ~ Report ~ selectedTenant:", selectedTenant)
    const [showEditable, setShowEditable] = useState(true);
    const [showMessage, setMessage] = useState(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const isFocused = useIsFocused();
    const refRBSheet = useRef();
    const refSheet1 = useRef();
    const getProperties = async () => {
        try {
            const response: any = await apiGetMyProperties();
            if (response.status) {
                setPropertyData(response.result);
            } else {
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };
    const getTenants = async () => {
        const response = await apiSearchTenant({});
        if (response.status) {
          console.log("tenant data=======1234====>",response.result)
            setTenant(response.result);
        }
    };

    const runReport = async () => {
        let query: any = null;
        if (startDate != null && endDate != null) {
            setIsLoading(true);
            query = {
                start_date: startDate?.toISOString().split('T')[0],
                end_date: endDate?.toISOString().split('T')[0],
                property_id: selectedProperty === '1' ? '' : selectedProperty,
                tenant_id: selectedTenant,
            };
        } else {
            query = {
                property_id: selectedProperty === '1' ? '' : selectedProperty,
                tenant_id: selectedTenant,
            };
        }
        const response = await apiGetReports(query);
        console.log("🚀 ~ runReport ~ response:", response)
        //  console.log(response);
        if (response.status) {
            setIsLoading(false);
            setReportData(response.result);
            setShowEditable(!showEditable);
            setMessage(false);
        } else {
            setIsLoading(false);
            setMessage(true);
        }
    };
    useEffect(() => {
        if (isFocused) {
            (async () => {
                getProperties();
                getTenants();
            })();
        }
    }, [isFocused]);

    useEffect(() => {}, [
        reportData,
        selectedProperty,
        selectedTenant,
        propertyData,
        tenant,
    ]);

    const sideBarHide = () => {
        dispatch(setSideBar(!sideBarStatus));
    };

    return (
        <SafeAreaView>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}
            <ScrollView>
                <View style={styles.mainContainer}>
                    {/* <View style={{width:'90%',alignSelf:'center',marginVertical:20}}>

                    <_header  location={'Reports'}/>
                    </View> */}
                     <View style={{marginHorizontal: 18, marginTop: Platform.OS == 'ios' ? 0: 19,paddingVertical:5}}>
                     <HeaderHome location={'Reports'} navigation={navigation} />
                 </View>
                    {showEditable && (
<View>
                        <TextInputField
                            placeholder="Choose Property"
                            value={selectedPropertyname}
                            isDisable={true}
                            url={require('../../assets/icon/home_2.png')}
                            label={'Property'}
                            isEye={true}
                            onClick={() => refRBSheet.current.open()}
                            rightIcon={require('../../assets/icon/drop_2.png')}
                        />
                         <TextInputField
                            placeholder="Choose Renter"
                            value={selectedTenantName}
                            isDisable={true}
                            url={require('../../assets/icon/key_2.png')}
                            label={'Renter'}
                            isEye={true}
                            onClick={() => refSheet1.current.open()}
                            rightIcon={require('../../assets/icon/drop_2.png')}
                        />
                        {/* <View style={{width:'90%',alignSelf:'center',flexDirection:'row',height:50,justifyContent:'space-between',marginTop:15,alignItems:'center'}}>
                          <View style={{width:'45%',height:66,backgroundColor:'#ffffff',elevation:3,borderRadius:70,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                          <View>
                            <Text style={{fontSize:10,color:'#250959',fontWeight:'400'}}>Start Date</Text>
                              <DatePicker
                                            value={startDate ? startDate : null}
                                            onChange={(event, selectedDate) => {
                                                setStartDate(selectedDate);
                                            }}
                                        />
                          </View>
                           <Image source={require('../../assets/icon/calender.png')} style={{width:14,height:14}}/>
                          </View>
                            <View style={{width:'45%',height:66,backgroundColor:'#ffffff',elevation:3,borderRadius:70,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                          <View>
                            <Text style={{fontSize:10,color:'#250959',fontWeight:'400'}}>End Date</Text>
                               <DatePicker
                                            value={endDate ? endDate : null}
                                            onChange={(event, selectedDate) => {
                                                setEndDate(selectedDate);
                                            }}
                                        />
                          </View>
                           <Image source={require('../../assets/icon/calender.png')} style={{width:14,height:14}}/>
                          </View>
                        </View> */}

                           {errMsg.show && (
                                    <Alert
                                        w="100%"
                                        status={
                                            errMsg.error ? 'red' : 'success'
                                        }
                                        mb={3}>
                                        <Text
                                            fontSize="md"
                                            color={
                                                errMsg.error
                                                    ? 'red.400'
                                                    : 'green.500'
                                            }>
                                            {errMsg.msg}
                                        </Text>
                                    </Alert>
                                )}
                                <View style={{height:30}}/>
                               
                    </View>
                    
                    )}
                    
                    <>
                        {showMessage && (
                            <Text
                                fontSize={'lg'}
                                mt={10}
                                mx={'auto'}
                                color={'my.t'}>
                                No Records
                            </Text>
                        )}
                        {showEditable == false && (
                            <VStack space={3}>
                                <HStack
                                    my={4}
                                    height={50}
                                    alignItems={'center'}>
                                    <Pressable
                                        onPress={() => {
                                            setShowEditable(!showEditable);
                                        }}>
                                        <Image
                                            source={Back}
                                            alt="Back"
                                            style={styles.backIcon}
                                        />
                                    </Pressable>
                                    <Text
                                        bold
                                        fontSize={'2xl'}
                                        ml={3}
                                        mb={1}
                                        color={'my.h'}>
                                        Report
                                    </Text>
                                </HStack>
                                {reportData?.map((report, i) => {
                                    return (
                                        <_runReportCard key={i} data={report} />
                                    );
                                })}
                            </VStack>
                        )}
                    </>
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
                            {propertyData.length > 0
                                ? propertyData?.map((item: any, i: number) => {
                                      return <TouchableOpacity onPress={()=>{setSelectedProperty(item.id),refRBSheet.current.close(),setSelectedPropertyName(item.name)}}><Text>{item.name}</Text></TouchableOpacity>;
                                  })
                                : null}
                        </View>
                    </RBSheet>

                      <RBSheet
                        ref={refSheet1}
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
                            {tenant.length > 0
                                ? tenant?.map((item: any, i: number) => {
                                      return <TouchableOpacity onPress={()=>{setSelectedTenant(item.id),refSheet1.current.close(),setSelectedTenantName(item.first_name)}}><Text>{item.first_name} {item.last_name}</Text></TouchableOpacity>;
                                  })
                                : null}
                        </View>
                    </RBSheet>
                      <View style={{position:'absolute',width:'100%',bottom:160}}>
                                <CommanButton
                                    label={'Generate Report'}
                                    isLoading={isLoading}
                                    // onCkick={runReport}
                                    onCkick={()=> navigation.navigate('Reportlist')}
                                />
                                </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        paddingBottom: 100,
        backgroundColor: '#F2F2F2',
        minHeight: hp('100%'),
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    input: {
        flex: 1,
        maxWidth: 230,
        backgroundColor: '#fff',
        height: 45,
        // borderRadius: 0,
    },
    dateText: {
        flex: 1,
        height: 45,
        color: 'black',
        borderWidth: 1,
        borderColor: 'rgba(125, 125, 125,0.2)',
        backgroundColor: 'transparent',
        borderRadius: 4,
        textAlignVertical: 'center',
        padding: 10,
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
        marginBottom: 10,
    },
    button: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        width: 200,
        height: 45,
        alignSelf: 'center',
    },
});

export default Report;
