import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, HStack, Spinner } from 'native-base';
import { UserDataObject } from '@/services/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { warningTimer } from '@/constant/customHooks';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { apiGetKey, apiSubscribe, apiUpdateSubscription } from '@/apis/auth';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { setPackage, setUserData } from '@/state/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface KEYDATA {
    customer: string;
    ephemeralKey: string;
    setupIntent: string;
    publishableKey: string;
}

const AndroidButton = ({ navigation, style, pakID, data }: any): React.JSX.Element => {
    // const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [keyData, setKeyData] = useState<KEYDATA | null>(null);
    const [publishableKey, setPublishableKey] = useState<string>('');
    const [loading, setLoading] = useState(true);
    // const loggedIn = useAppSelector(state => state.auth.loggedIn);
    const userData: UserDataObject | any = useAppSelector(state => state.auth.userData);
    const dispatch = useAppDispatch();

    const getKeyData = async () => {
        const key = await apiGetKey(userData?.id);
        // console.log(key);
        if (key.status) {
            setKeyData(key.result);
            setPublishableKey(key.result.publishableKey);
            setLoading(false);
        } else {
            data.ErrMsg({ msg: 'Something Went Wrong', error: true, show: true });
            const timer = await warningTimer(2);
            timer && navigation.goBack(null);
        }
    };
    const initializePaymentSheet = async () => {
        if (keyData !== null) {
            const { error } = await initPaymentSheet({
                merchantDisplayName: 'PropertyLenz',
                customerId: keyData.customer,
                customerEphemeralKeySecret: keyData.ephemeralKey,
                setupIntentClientSecret: keyData.setupIntent,
            });
        }
    };
    const submitSubscription = async (pData: any, update = false) => {
        return await apiUpdateSubscription(pData);
        // if (update) {
        //     const compare = userData?.subscriptionPackage.is_trial_package == 1 ? false : true;
        //     // return compare ? await apiUpdateSubscription(pData) : await apiSubscribe(pData);
        //     return compare ? await apiUpdateSubscription(pData) : await apiUpdateSubscription(pData);
        // } else {
        //     return await apiUpdateSubscription(pData);
        //     // return await apiSubscribe(pData);
        // }
    };
    const openPayment = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            data.ErrMsg({ msg: 'Error During Payment', error: true, show: true });
            const timer = await warningTimer(4);
            timer && data.ErrMsg({ msg: '', error: false, show: false });
            return;
        } else {
            // const subData = { user_id: data.costumerId, package_id: pakID };
            const subData = { user_id: userData?.id, package_id: pakID };
            const response = await submitSubscription(subData, Boolean(userData?.subscriptionPackage));
            if (response.status) {
                data.ErrMsg({ msg: response.message, error: false, show: true });
                // if (loggedIn) {
                    const matchingPackage = data.packagesData.find((pkg: any) => pkg.id == response.result.package_id);
                    const Pack: any = { ...userData, subscriptionPackage: matchingPackage };
                    dispatch(setUserData(Pack));
                    dispatch(setPackage(matchingPackage));
                    await AsyncStorage.setItem('@userData', JSON.stringify(Pack));
                    await AsyncStorage.setItem('@packageData', JSON.stringify(matchingPackage));
                    navigation.goBack(null);
                // } else {
                //     const timer = await warningTimer(0.5);
                //     timer && navigation.navigate('Login');
                // }
            } else {
                data.ErrMsg({ msg: 'Payment Canceled', error: true, show: true });
                const timer = await warningTimer(1.5);
                timer && data.ErrMsg({ msg: '', error: false, show: false });
            }
        }
        initializePaymentSheet();
    };
    useEffect(() => { getKeyData(); }, []);

    useEffect(() => {
        initializePaymentSheet();
    }, [keyData]);

    return (
        publishableKey.trim() === '' ?
        <HStack flex={1} style={styles.container} justifyContent={'center'} alignItems={'center'}>
             <Spinner color={'#fff'} />
        </HStack>
        :
         <StripeProvider publishableKey={publishableKey}>
            <TouchableOpacity style={style} onPress={() => { loading ? null : openPayment(); }}>
                <HStack justifyContent={'center'} alignItems={'center'} flex={1}>
                <Text bold color={'my.bgBlue'} mx={'auto'} my={'auto'}>SUBSCRIBE</Text>
                </HStack>
            </TouchableOpacity>
        </StripeProvider>
    );
};
const styles = StyleSheet.create({
    container:{
        backgroundColor: 'transparent',
        width: 120,
        height: 45,
        alignSelf: 'center',
        },
});

export default AndroidButton;

