import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, Button, HStack, VStack, Image } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// icons
import Edit from '@/assets/icon/Edit.png';
import Delete from '@/assets/icon/delete.png';
import { eventNames, formatDate } from '@/constant/customHooks';

const _tenantCard = ({ item, pId, handleDelete }: any): React.JSX.Element => {
    const { navigate } = useNavigation<NativeStackNavigationProp<any>>();

    return (
        <VStack space={0} style={styles.cardBody} mb={4}>
            <HStack space={2} justifyContent={'space-between'} pt={3} pb={2} px={3}>
                <Text bold fontSize={'lg'} color={'my.t2'}>{item.property_name}</Text>
                <HStack space={4} alignItems={'center'} justifyContent={'space-between'}>
                    <Pressable onPress={() => { navigate('TenantEdit', { PropertyId: pId, data: item }); }}>
                        <Image source={Edit} alt="icon" style={styles.icon} />
                    </Pressable>
                    <Pressable onPress={() => { handleDelete(item.id); }}>
                        <Image source={Delete} alt="icon" style={{ height: 20, width: 20 }} />
                    </Pressable>
                </HStack>
            </HStack>

            <HStack justifyContent={'flex-start'} space={2} px={3} py={1}>
                <HStack space={1} width={'45%'}>
                    <Text color={'my.t'}>Move In:</Text>
                    <Text color={'my.t'} fontSize={'xs'}>
                        {formatDate(item.move_in_date, '/')}
                    </Text>
                </HStack>
                <HStack space={1} width={'45%'}>
                    <Text color={'my.t'}>Move Out:</Text>
                    <Text color={'my.t'} fontSize={'xs'}>
                        {formatDate(item.move_out_date, '/')}
                    </Text>
                </HStack>
            </HStack>

            <HStack space={1} px={3} mt={1}>
                <Text color={'my.t'}>Renter:</Text>
                <Text color={'my.t'}>{item.tenant_first_name} {item.tenant_last_name}</Text>
            </HStack>

            <Box style={styles.CardFooter} mt={2} py={2}>
                <HStack justifyContent={'space-around'} alignItems={'center'} mb={1}>
                    <Text mb={1} bold>
                        {eventNames(item.status)}
                    </Text>
                    {item.is_movein_invited === 0 ?
                        <Button style={styles.cardButtonInvite} onPress={() => { navigate('InviteTenant', item); }} >Invite</Button>
                        :
                        <Button style={item.movein_status === 'Scheduled' ? styles.cardButtonScheduled : styles.cardButtonExpired}
                            onPress={() => { item.movein_status === 'Expired' ? navigate('TenantAdd', { PropertyId: pId, data: item }) : navigate('TenantEdit', { PropertyId: pId, data: item }); }} >{item.movein_status}</Button>
                    }
                </HStack>
            </Box>

        </VStack>
    );
};
const styles = StyleSheet.create({
    cardBody: {
        backgroundColor: 'rgba(245,244,249,1.0)',
        borderRadius: 10,
    },
    icon: {
        height: 30,
        width: 30,
    },
    contentContainer: {
        width: '50%',
    },
    CardFooter: {
        backgroundColor: 'rgba(125,125,125,0.1)',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    cardButtonInvite: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonScheduled: {
        backgroundColor: 'rgba(37, 73, 137, 0.7)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonExpired: {
        backgroundColor: 'rgba(253, 56, 24, 1)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
});

export default _tenantCard;
