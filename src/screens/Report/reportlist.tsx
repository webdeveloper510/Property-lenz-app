import React, {useEffect, useState, useRef} from 'react';
import {Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
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
import {height} from 'styled-system';
import BackButton from '@/components/BackButton';
import FilterModal from '@/components/filterModal';
const Reportlist = ({navigation}: any): React.JSX.Element => {
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
    console.log("🚀 ~ Reportlist ~ selectedProperty:", selectedProperty)
    const [selectedPropertyname, setSelectedPropertyName] = useState<any>('');
    const [selectedTenant, setSelectedTenant] = useState<any>('');
    const [selectedTenantName, setSelectedTenantName] = useState<any>('');
    console.log('🚀 ~ Report ~ selectedTenant:', selectedTenant);
    const [showEditable, setShowEditable] = useState(true);
    const [showMessage, setMessage] = useState(false);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const isFocused = useIsFocused();
    const [filterVisible, setFilterVisible] = useState(false);
    
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
            console.log('tenant data=======1234====>', response.result);
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
        <>
            {sideBarStatus && (
                <SideBar
                    data={HomeProps}
                    header={'Add Menu'}
                    hide={sideBarHide}
                />
            )}
            <ScrollView>
                <View style={styles.mainContainer}>
                    <View
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginVertical: 20,
                        }}>
                        <BackButton navigation={navigation} />
                        <Text
                            style={{
                                fontSize: 18,
                                color: '#250959',
                                fontWeight: '700',
                            }}>
                            Reports
                        </Text>
                        <TouchableOpacity
                            onPress={() => setFilterVisible(true)}
                            style={{
                                height: 50,
                                width: 50,
                                marginTop: 20,
                                backgroundColor: '#ffffff',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 50,
                                elevation: 3,
                            }}>
                            <Image
                                source={require('../../assets/icon/filter.png')}
                                style={{width: 24, height: 24}}
                            />
                        </TouchableOpacity>
                    </View>

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

                        <VStack space={3}>
                            {[1, 2, 3].map((report, i) => {
                                return <_runReportCard key={i} data={report} />;
                            })}
                        </VStack>
                    </>
                    {
                        filterVisible &&
                        <FilterModal
                        visible={filterVisible}
                        onClose={() => setFilterVisible(false)}
                        onClear={() => setFilterVisible(false)}
                        onApply={() => setFilterVisible(false)}
                    />
                    }
                    
                </View>
            </ScrollView>
        </>
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

export default Reportlist;
