import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, HStack, VStack, Divider } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { apiIOSPackageValidate } from '@/apis/auth';
import { warningTimer } from '@/constant/customHooks';



const _iosPlansCard = ({ item, iosPackage, submit, ErrMsg }: any): React.JSX.Element => {
    // submit(iosPackage.productId);
    const handleSubscription = async () =>{
        const response = await apiIOSPackageValidate(item.id);
        if (response.status) {
            submit(iosPackage.productId);
        } else {
            ErrMsg({msg: response.message, error: true, show: true});
            const timer = await warningTimer(3);
            timer && ErrMsg({msg: '', error: false, show: false});
        }

    };

    return (
        <VStack style={styles.mainContainer} >
            <Box style={styles.box}>{ }</Box>
            <Text bold fontSize={'lg'} color={'white'} mx={'auto'} mt={-1} mb={10}>{item?.title}</Text>
            <HStack justifyContent={'center'} h={'auto'} mb={8} >
                <Text bold style={styles.text} color={'white'} >{iosPackage?.localizedPrice}</Text>
                <Text bold fontSize={'md'} color={'white'} mt={7} >/mo</Text>
            </HStack>
            <Text color={'white'} fontSize={'md'} style={{ width: '100%', flexWrap: 'nowrap' }}>{item?.description}</Text>
            <Divider style={{ backgroundColor: 'rgba(100,170,253,1.0)' }} my={2} />
            <VStack mb={5}>
                <HStack space={3} alignItems={'center'}>
                    <Box style={{ height: 8, width: 8, borderRadius: 15, backgroundColor: '#fff' }}>{ }</Box>
                    <Text color={'white'} fontSize={'md'} >Properties {item?.allowed_properties != 0 ? `+${item?.allowed_properties}` : 'Unlimited'}</Text>
                </HStack>
                <HStack space={3} alignItems={'center'}>
                    <Box style={{ height: 8, width: 8, borderRadius: 15, backgroundColor: '#fff' }}>{ }</Box>
                    <Text color={'white'} fontSize={'md'} style={{ width: '100%', flexWrap: 'nowrap' }}>Users {item?.allowed_users != 0 ? `+${item?.allowed_users}` : 'Unlimited'}</Text>
                </HStack>
            </VStack>
            <TouchableOpacity style={styles.button} onPress={() => {handleSubscription();}}>
                <HStack justifyContent={'center'} alignItems={'center'} flex={1}>
                    <Text bold color={'my.bgBlue'} mx={'auto'} my={'auto'}>SUBSCRIBE</Text>
                </HStack>
            </TouchableOpacity>
        </VStack>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'rgba(80,140,253,1.0)',
        padding: 20,
        borderRadius: 20,
        width: 300,
        elevation: 3,
    },
    box: {
        width: '70%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        position: 'absolute',
        alignSelf: 'center',
        zIndex: -5,
        top: -10,
        height: 70,
    },
    text: {
        fontSize: 60,
        lineHeight: 60,
    },
    button: {
        backgroundColor: '#fff',
        width: 120,
        height: 45,
        borderRadius: 90,
        alignSelf: 'center',
    },
});
export default _iosPlansCard;
