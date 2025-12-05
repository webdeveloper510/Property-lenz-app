import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { useAppSelector } from '@/state/hooks';
import { formatDate } from '@/constant/customHooks';
// icons
import Cal from '@/assets/icon/Cal.png';
import Tnt from '@/assets/icon/renter-icon.png';
import Prt from '@/assets/icon/prt.png';
import Btn from '@/assets/icon/btn.png';

const _actionCard = ({ item }: any): React.JSX.Element => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const userData = useAppSelector(state => state.auth.userData);
  const { type, id, property_id, is_completed, property_name, address, name,
    inspection_date, movein_disable_on, created_at, tenants, activity,
  } = item;

  const handleNavigation = () => {
    if (type === 'inspection') {
      navigate(is_completed ? 'CompletedView' : userData?.type === 'TENANT' ? 'TenantAreas' : 'Areas', id);
    } else if (type === 'lease') {
      navigate('TenantHome', property_id);
    } else {
      navigate('Details', id);
    }
  };
  const FormateName = (): string => {
    if (tenants && tenants.length > 0) {
      const names = tenants
        .map((a: any) => `${a.first_name} ${a.last_name}`)
        .join(tenants.length === 1 ? '' : ', ');
      return `Renter: ${names}`;
    }
    return '';
  };

  const renderText = () => {
    const eventText: any = {
      inspection: 'Inspection Date Confirmed',
      lease: 'Send Renter Invite',
      property: name,
    };
    return eventText[type] || type;
  };
  const isSameDate = (date1: any, date2: any): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    ) {
      return true;
    }

    if (
      d1.getFullYear() === d2.getFullYear() &&
      (d1.getMonth() === d2.getMonth() && d1.getDate() < d2.getDate())
    ) {
      return true;
    }
    if (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() < d2.getMonth()
    ) {
      return true;
    }

    return false;
  };
  const activityData: any = {
    MOVE_IN : styles.invite,
    MOVE_OUT : styles.invite,
    MANAGER_INSPECTION : styles.scheduled,
    INTERMITTENT_INSPECTION : styles.scheduled,
  };
  const handleActivity = (status: any, completed: any) => {
    if (isSameDate(inspection_date, new Date())) {
      return completed == 1 ? styles.completed : activityData[status] || status;
    } else {
      return styles.scheduled;
    }
  };
  const renderDate = (dateValue: any) => {
    const dateEvent: any = {
      inspection: `(Event Date: ${formatDate(inspection_date, '/') == null ? '' : formatDate(inspection_date, '/')} ${activity == 'MOVE_IN' || activity == 'MOVE_IN' ? FormateName() : ''})`,
      lease: `(Due Date: ${formatDate(movein_disable_on, '/') == null ? 'Not Assigned' : formatDate(movein_disable_on, '/')})`,
      property: `(Date Added: ${formatDate(created_at, '/') == null ? '' : formatDate(created_at, '/')})`,
    };
    return dateEvent[dateValue] || '';
  };

  return (
    <HStack style={type === 'lease' ? styles.cardBodyGray : type === 'inspection' ? styles.cardBodyWhite : styles.cardBodyBlue} alignItems="center" justifyContent="space-between">
      <HStack justifyContent={'flex-start'} style={{ width: '85%' }} space={5} alignItems="center">
        {type == 'inspection' && <>
          <VStack justifyContent={'center'} ml={1} mr={-2} padding={2} borderRadius={'full'} alignItems={'center'} style={handleActivity(activity,is_completed)}>
            <Image source={Cal} style={{...styles.icon}} alt="btn" />
          </VStack>
        </>}
        {type == 'lease' && <Image source={Tnt} style={{ ...styles.icon }} ml={3} alt="btn" />}
        {type == 'property' && <Image source={Prt} style={styles.icon} ml={3} alt="btn" />}
        <VStack space={1} flex={1} py={1}>
          <Text bold style={styles.textType} mb={-1} color={type === 'inspection' ? 'black' : 'white'}>{renderText()}</Text>
          <Text bold style={styles.textContent} mb={-1} color={type === 'inspection' ? 'black' : 'white'}>{property_name || address || name}</Text>
          <Text fontSize="xs" style={styles.textDate} color={type === 'inspection' ? 'black' : 'white'}>{renderDate(type)}</Text>
        </VStack>
      </HStack>
      <Pressable onPress={handleNavigation}>
        <Box style={type === 'inspection' ? {...styles.btnBox, borderColor: 'rgba(200,200,200,0.6)'} : styles.btnBox} mr={3}>
          <Image source={Btn} height={5} width={5} alt="btn" />
        </Box>
      </Pressable>
    </HStack>
  );
};

const styles = StyleSheet.create({
  cardBodyBlue: {
    backgroundColor: 'rgba(1,111,189,0.9)',
  },
  cardBodyWhite: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.6)',
  },
  invite: {
    backgroundColor: 'rgba(255,110,7,0.9)',
  },
  scheduled: {
    backgroundColor: 'rgba(0,113,189,0.9)',
  },
  completed: {
    backgroundColor: 'rgba(15,152,0,0.9)',
  },
  cardBodyGray: {
    backgroundColor: 'rgba(100,100,100,0.9)',
  },
  btnBox: {
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 100,
  },
  textType: {
    fontSize: 12,
    lineHeight: 13,
  },
  textContent: {
    fontSize: 12,
    lineHeight: 14,
  },
  textDate: {
    marginTop: 1,
    fontSize: 10,
    flexWrap: 'wrap',
    lineHeight: 11,
    flex: 1,
  },
  icon: {
    height: 25,
    width: 23,
    resizeMode: 'stretch',
  },

});
export default _actionCard;
