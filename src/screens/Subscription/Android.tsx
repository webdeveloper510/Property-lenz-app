import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, ScrollView, Alert } from 'native-base';
import { useRoute } from '@react-navigation/native';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { apiGetPackages } from '@/apis/auth';
import _plansCard from '@/components/Subscription/_plansCard';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
// icons
import BackIcon from '@/assets/icon/btnBack.png';
import Logo from '@/assets/logo/Logo.png';

const Android = ({ navigation }: any): React.JSX.Element => {
    const [activePage, setActivePage] = useState<number>(0);
    const [packagesData, setPackagesData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
    // const route = useRoute();
    // const costumerData: any = route.params;

    const getPackages = async () => {
        const response = await apiGetPackages();
        if (response.status) {
            setPackagesData(response.result.data);
            setLoading(false);
        } else {

        }
    };

    const slider = (x: number, w: number) => {
        let ratio = x / w;
        let count = Math.floor(ratio) + (ratio % 1 > 0.5 ? 1 : 0);
        if (count !== activePage) {
            setActivePage(count);
        }
    };


    useEffect(() => {
        getPackages();
    }, []);

    return (
        loading ? <Spinner_Loading /> :
            <ScrollView>
                {errMsg.show &&
                    <Alert w="80%" alignSelf={'center'} status={errMsg.error ? 'danger' : 'success'} mb={2} style={{
                        position: 'absolute',
                        top: 90,
                        zIndex: 3,
                    }} >
                        <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
                    </Alert>
                }
                <Box style={styles.mainContainer}>
                    <SafeAreaView>
                        <HStack mt={2} justifyContent={'flex-start'} alignItems={'center'}>
                        <HStack mb={3} ml={-1} style={{ padding: 15 }} alignItems={'center'}>
                            <Pressable onPress={() => { navigation.goBack(null); }}>
                                <Image source={BackIcon} alt="Back" style={styles.backIcon} />
                            </Pressable>
                        </HStack>
                    <Image source={Logo} ml={-2} mx={'auto'} style={styles.logo} alt="logo" />
                        </HStack>
                    </SafeAreaView>
                    <Text bold fontSize={'2xl'} mt={0} mx={'auto'} mb={1} color={'my.h3'} >Choose a Plan</Text>
                    <HStack space={1} mt={0}  justifyContent={'center'} alignItems={'center'}>
                        {packagesData.map((_: null, i: number) => {
                            return (
                                <Box key={i} style={activePage !== i ? styles.boxInactive : styles.boxActive}>{ }</Box>
                            );
                        })}
                    </HStack>
                    <ScrollView horizontal={true} pagingEnabled={true} style={{minHeight: '80%'}}
                        onScroll={(e) => {
                            slider(e.nativeEvent.contentOffset.x, e.nativeEvent.layoutMeasurement.width);
                        }} >
                        {packagesData.map((item: any, i: number) => {
                            return (
                                <Box key={i} mt={2} style={{
                                    width: widthPercentageToDP('80%'), minHeight: heightPercentageToDP('63%'),  alignItems: 'center',
                                    marginLeft: widthPercentageToDP('10%'), marginRight: widthPercentageToDP('10%'),
                                }}>
                                    <_plansCard item={item} navigation={navigation}
                                    active={i === activePage ? true : false}
                                    data={{
                                        packagesData: packagesData,
                                        ErrMsg: setErrMsg,
                                    }
                                    }/>
                                </Box>
                            );
                        })}
                    </ScrollView>
                </Box>
            </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        paddingBottom: 30,
        height: '100%',
        flex: 1,
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    logo: {
        height: 75,
        width: '75%',
        resizeMode: 'stretch',
    },
    boxInactive: {
        height: 5,
        width: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(100,170,253,0.7)',
    },
    boxActive: {
        height: 10,
        width: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(13,110,253,0.7)',
    },
});
export default Android;
