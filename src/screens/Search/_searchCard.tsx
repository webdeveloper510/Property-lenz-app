import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Image, HStack, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventNames, formatDate } from '@/constant/customHooks';



const _searchCard = ({item, image }: any): React.JSX.Element => {
    const { navigate } = useNavigation<NativeStackNavigationProp<any>>();

    const formateName = (first:string, last:string)=>{
        return `${first != null ? first : ''} ${last != null ? last : ''}`;
    };

    return (
       item.type === 'inspection' ?
        <HStack space={3} alignItems={'center'} style={styles.card} px={2} py={1}>
            <Image source={image} style={{ height: 30, width: 30 }} alt="icon" />
            <HStack alignItems={'center'} justifyContent={'space-between'} flex={1}>
            <VStack justifyContent={'space-between'}>
            <Text color={'white'}>{item.data.property_name}</Text>
            <Text fontSize={'xs'} color={'white'} >
                {item.data.activity == 'MOVE_IN' && 'Move In'}
                {item.data.activity == 'MOVE_OUT' && 'Move Out'}
                {item.data.activity == 'INTERMITTENT_INSPECTION' && 'Intermittent'}
                {item.data.activity == 'MANAGER_INSPECTION' && 'Manager'}
            </Text>
            {/* item.data */}
            <Text fontSize={'xs'} color={'white'} style={{fontSize: 10}}>{formatDate(item.data.created_at)}</Text>
            </VStack>
            <Text fontSize={'xs'} color={'white'} flex={1} textAlign={'center'} style={{flexWrap: 'wrap'}}>
                {eventNames(item.data.property_type)}
                </Text>
            <VStack justifyContent={'space-between'} h={'full'} alignItems={'flex-end'}>
                { item.data.user_first_name &&
            <Text fontSize={'xs'} color={'white'}>{formateName(item.data.user_first_name, item.data.user_last_name)}</Text>
                }
                {item.data.tenant_first_name &&
            <Text fontSize={'xs'} color={'white'}>{formateName(item.data.tenant_first_name, item.data.tenant_last_name)}</Text>
                }
            </VStack>
            </HStack>
        </HStack>
        :
        <HStack space={3} alignItems={'center'} style={styles.card} px={2} py={1}>
        <Image source={image} style={{ height: 30, width: 30 }} alt="icon" />
        <HStack alignItems={'center'} justifyContent={'space-between'} flex={1}>
        {/* status */}
        <Text color={'white'}>{item.type == 'property' ? item.data.name : `${item.data.first_name} ${item.data.last_name}`}</Text>
        {item.type == 'property' &&
        <Text fontSize={'xs'} color={'white'}>
            {eventNames(item.data.type)}
            </Text>
        }
        {item.type == 'user' &&
        <Text fontSize={'xs'} color={'white'}>{item.data.status}</Text>
        }
        </HStack>
    </HStack>
);
};

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: 'rgba(125,125,125,0.1)',
        borderRadius: 5,
        height: 65,
        backgroundColor: 'rgba(10,113,189,0.9)',
    },
});
export default _searchCard;
