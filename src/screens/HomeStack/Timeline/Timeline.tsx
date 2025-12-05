import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, VStack, ScrollView } from 'native-base';
import { apiTimeLine } from '@/apis/property';
import { useRoute } from '@react-navigation/native';
import { TimeLine, TimeLineDate } from '@/services/types';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
// icons
import Back from '@/assets/icon/btnBack.png';
import Lease from '@/assets/icon/report-card.png';
import CamIcon from '@/assets/icon/camIcon.png';
import Updated from '@/assets/icon/updated.png';
import Deleted from '@/assets/icon/delete.png';
import Property from '@/assets/icon/flathome.png';
import InspectionStart from '@/assets/icon/completedIcon.png';
import InsCOMPLETED from '@/assets/icon/insCompletd.png';
import Signed from '@/assets/icon/signed.png';

const Timeline = ({ navigation }: any): React.JSX.Element => {
    const route = useRoute();
    const pId = route.params;
    const [timeLIneData, setTimeLineData] = useState<TimeLineDate | null>(null);
    const [loading, setLoading] = useState(true);

    const getDetails = async () => {
        const response: any = await apiTimeLine(pId);
        if (response.status) {
            setTimeLineData(response.result);
        }
        setLoading(false);
    };

    const actions = (action: string, data: TimeLine) => {
        const actionMap: Record<string, any> = {
          PROPERTY: () => navigation.navigate('DetailsRoot', data.data.property_id),
          PROPERTY_ACTIVITY_IMAGES: () => navigation.navigate('QuickPictureShow', { propertyId: data.data.property_id, data: data.data }),
          PROPERTY_LEASE: () => navigation.navigate('TenantHome', data.data.property_id),
          INSPECTION: () => {
            const { action, inspection_id } = data.data;
            if (action === 'COMPLETED' || action === 'SIGNED') {
              navigation.navigate('CompletedView', inspection_id);
            } else if (action === 'CREATED') {
              navigation.navigate('Areas', inspection_id);
            }
          },
        };
        actionMap[action]?.();
      };

    const handleIcon = (type: string, action: string) => {
        const iconMap: Record<string, any> = {
          PROPERTY: { UPDATED: Updated, DELETED: Deleted, default: Property },
          PROPERTY_ACTIVITY_IMAGES: { UPDATED: Updated, DELETED: Deleted, default: CamIcon },
          PROPERTY_LEASE: { UPDATED: Updated, DELETED: Deleted, default: Lease },
          INSPECTION: { CREATED: InspectionStart, COMPLETED: InsCOMPLETED, SIGNED: Signed, UPDATED: Updated, DELETED: Deleted },
        };
        return iconMap[type]?.[action] || iconMap[type]?.default || Property;
      };
    const renderData = (value: TimeLine, Index: number) => {
        return (
            <Pressable key={Index} onPress={() => { actions(value.type, value); }}>
                <HStack space={2} alignItems={'center'} style={styles.itemContainer} >
                    <Image source={handleIcon(value.type, value.data.action)}
                        alt="icon" height={7} width={7} />
                    <Text ml={1} style={{ flex: 1, flexWrap: 'wrap' }}>{value.data.message}</Text>
                </HStack>
            </Pressable>
        );

    };

    useEffect(() => {
        getDetails();
    }, []);


    return (
        <Box style={styles.mainContainer}>
            <SafeAreaView>
                <HStack mb={5} height={50} alignItems={'center'}>
                    <Pressable onPress={() => { navigation.goBack(null); }}>
                        <Image source={Back} alt="Back" style={styles.backIcon} />
                    </Pressable>
                    <Text bold fontSize={'3xl'} ml={3} mb={1} color={'my.h4'} >Timeline/History</Text>
                </HStack>
            </SafeAreaView>
            {loading ? <Spinner_Loading /> :
                <ScrollView style={{ flex: 1 }}>
                    {timeLIneData != null && Object.keys(timeLIneData).map((date, i) => (
                        <Box w={'100%'} key={i}>
                            <HStack style={styles.head}>
                                <Text color={'white'}>{date}</Text>
                            </HStack>
                            <VStack>
                                {timeLIneData[date].map((entry, j) => (
                                    renderData(entry, j)
                                ))}
                            </VStack>
                        </Box>
                    ))}
                </ScrollView>
            }
        </Box>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        minHeight: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    head: {
        width: '100%',
        backgroundColor: 'rgba(125, 125, 125, 0.9)',
        padding: 5,
        flexWrap: 'wrap',
    },
    itemContainer: {
        borderWidth: 1,
        borderTopColor: 'transparent',
        borderBottomColor: 'rgba(125, 125, 125, 0.9)',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        padding: 10,
    },
    icon: {},
});

export default Timeline;
