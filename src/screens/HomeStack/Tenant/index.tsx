import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Box, HStack, ScrollView, VStack, Alert } from 'native-base';
import TenantCard from '@/components/Tenant/_tenantCard';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { apiDeleteLease, apiGetLease } from '@/apis/lease';
import { PropertyLease } from '@/services/types';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {warningTimer} from '@/constant/customHooks';
import Back from '@/assets/icon/btnBack.png';

const Index = ({ navigation }: any): React.JSX.Element => {
  const route = useRoute();
  const pId: any = route.params;
  const [myLease, setMyLease] = useState<PropertyLease | null>(null);
  const [errMsg, setErrMsg] = useState({ message: '', error: false, show: false });
  const isFocused = useIsFocused();

    const getPropertyLease = async () => {
        const response = await apiGetLease(pId);
        console.log(pId, ': ', response.result.data);
        if (response.status) {
            setMyLease(response.result.data);
        }
    };
    const deleteLease = async (leaseID: number)=>{
        const response = await apiDeleteLease({lease_id: leaseID});
        if (response.status) {
            setErrMsg({ message: response.message, error: false, show: true });
            const timer = await warningTimer(0.5);
              timer && setErrMsg({message: '', error: false, show: false});
              timer && getPropertyLease();
        } else {
            setErrMsg({ message: response.message, error: true, show: true });
            const timer = await warningTimer(3);
              timer && setErrMsg({message: '', error: false, show: false});
        }
      };
    useEffect(()=>{
        (async ()=>{
            if (isFocused) {
                getPropertyLease();
            }
        })();
    },[isFocused]);
    useEffect(()=>{},[myLease]);
    if (myLease == null) {
      return <Spinner_Loading/>;
    }

    return (
        <Box style={styles.mainContainer}>
          <SafeAreaView>
            <HStack mb={5} mt={6} height={50} alignItems={'center'}>
                <Pressable onPress={() => { navigation.goBack(null); }}>
                    <Image source={Back} alt="Back" style={styles.backIcon} />
                </Pressable>
                <Text bold fontSize={'2xl'} ml={3} mb={1} color={'my.h4'} >Renter Connection</Text>
            </HStack>
          </SafeAreaView>
            <ScrollView height={hp('100%')}>
                {myLease.map((item, i) => {
                    return (
                            <TenantCard key={i} item={item} pId={pId} handleDelete={deleteLease} />
                    );
                })}
            </ScrollView>

            {errMsg.show &&
          <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} mb={3}>
            <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.message}</Text>
          </Alert>
        }
            <VStack style={styles.footerContainer} mt={10}>
            <Box style={styles.footerBox} />
            <HStack alignItems={'center'} justifyContent={'center'} style={styles.footerBtn} my={'auto'} mx={'auto'}>
              <Text bold fontSize={'lg'} lineHeight={20} textAlign={'center'} color={'rgba(10,113,199,0.9)'} onPress={() => { navigation.navigate('TenantAdd', {PropertyId: pId}); }}>Create Renter Connection</Text>
            </HStack>
          </VStack>
            {/* } */}
        </Box>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        paddingBottom: 0,
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    footer:{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        paddingBottom: 10,
        paddingTop: 10,
    },
    button: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        alignSelf: 'center',
        width: '100%',
        height: 45,
        borderRadius: 10,
    },
    footerContainer: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        height: 120,
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
        width: 200,
        height: 50,
        borderRadius: 10,
      },
});

export default Index;
