import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text, Box, Alert, Image, HStack, VStack, Modal, Button } from 'native-base';
import { apiDeleteInspection } from '@/apis/property';
import { eventNames, formatDate, formateInspectionName, warningTimer } from '@/constant/customHooks';
import { useAppSelector } from '@/state/hooks';
// icons
import Cal from '@/assets/icon/Cal.png';
import Btn from '@/assets/icon/btn.png';
import Del from '@/assets/icon/bin.png';


const Progress = ({ item, getProgress }: any): React.JSX.Element => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const userData: any = useAppSelector(state => state.auth.userData);
  const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
  const [modalVisible, setModalVisible] = useState(false);
  const {id, property_id ,is_completed, property, inspection_date, created_at, tenants, activity,
    created_by, created_by_name, is_signed} = item;
  const deleteInspection = async () => {
    console.log(id);
    setModalVisible(false);
    const response = await apiDeleteInspection(id);
    if (response.status) {
      setErrMsg({ msg: response.message, error: false, show: true });
      getProgress();
      const timer = await warningTimer(1.5);
      timer && setErrMsg({ msg: '', error: false, show: false });
    } else {
      setErrMsg({ msg: response.message, error: true, show: true });
      const timer = await warningTimer(2);
      timer && setErrMsg({ msg: '', error: false, show: false });
    }
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
      (d1.getMonth() < d2.getMonth() ||
       (d1.getMonth() === d2.getMonth() && d1.getDate() < d2.getDate()))
    ) {
      return true;
    }

    return false;
  };
  const activityData: any = {
    MOVE_IN: styles.invite,
    MOVE_OUT: styles.invite,
    MANAGER_INSPECTION: styles.scheduled,
    INTERMITTENT_INSPECTION: styles.scheduled,
  };
  const handleActivity = (status: any, completed: any) => {
    if (isSameDate(inspection_date, new Date())) {
      return completed == 1 ? styles.completed : activityData[status] || status;
    } else {
      return styles.scheduled;
    }
  };
  const HandleRenterName = (): string => {
    if (activity !== 'INTERMITTENT_INSPECTION' && activity !== 'MANAGER_INSPECTION') {
      if (tenants?.length > 0) {
        const names = tenants
          .map((name: any) => `${name.first_name == null ? '' : name.first_name} ${name.last_name == null ? '' : name.last_name}`)
          .join(tenants.length === 1 ? '' : ', ');
        return `Renter: ${names}`;
      }
    }
    return '';
  };
  useEffect(()=>{},[modalVisible]);

  return (
    <>
      {errMsg.show &&
        <Alert w="90%" mx={'auto'} status={errMsg.error ? 'danger' : 'success'} my={2}>
          <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
        </Alert>
      }
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} justifyContent="center" size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Are You Sure?</Modal.Header>
          <Modal.Body>
            <Text >Do You Want To Delete Inspection?</Text>
          </Modal.Body>
          <Modal.Footer justifyContent={'space-around'}>
            <Button style={styles.modalButton} onPress={() => { setModalVisible(false); }}>No</Button>
            <Button style={{ ...styles.modalButton, backgroundColor: 'rgba(225,20,40,0.9)' }} onPress={() => { deleteInspection(); }}>Yes</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
        <HStack style={styles.cardBody} justifyContent={'space-between'} alignItems={'center'}>
          <HStack justifyContent={'flex-start'} space={5} alignItems={'center'} style={{width: '80%'}}>
            <VStack ml={1} mr={-2} padding={2} borderRadius={'full'} style={handleActivity(activity, is_completed)}>
              <Image source={Cal} style={styles.icon} alt="btn" />
            </VStack>
            <VStack flex={1}>
              <Text bold style={styles.textType} mb={-1} >
                {`Inspection Type: ${formateInspectionName(activity)}`}
              </Text>
              <Text bold style={styles.textType} >{property.name}</Text>
              <Text fontSize={'xs'} mt={-1} style={styles.textDate} >Event Date: {formatDate(item.inspection_date, '/')}</Text>
              <Text fontSize={'xs'} lineHeight={13} w={'85%'} style={HandleRenterName() == '' ? {...styles.textDate, marginTop: -1} : {...styles.textDate, marginTop: -1, marginBottom: 5}} >{HandleRenterName()}</Text>
            </VStack>
          </HStack>
          <HStack space={3} alignItems={'center'} justifyContent={'center'} style={{width: '20%'}} >
            {userData.type != 'TENANT' &&
              <Pressable style={{zIndex: 10}} onPress={() => { console.log('del'); setModalVisible(true); }}>
                <VStack padding={2} background={'red.400'} borderRadius={'full'} style={styles.btnDel}>
                <Image source={Del} style={{height: 12, width: 12, resizeMode: 'stretch'}} alt="btn" />
                </VStack>
              </Pressable>
            }
            <Pressable onPress={() => { (userData.type == 'OWNER' || userData.type == 'MANAGER') ? navigate('Areas', item.id) : navigate('TenantAreas', item.id); }}>
              <Box style={styles.btnBox} justifyContent={'center'} alignItems={'center'} >
                <Image source={Btn} style={{height: 25, width: 25, resizeMode: 'stretch'}} alt="btn" />
              </Box>
            </Pressable>
          </HStack>
        </HStack>
    </>
  );
};
const styles = StyleSheet.create({
  cardBody: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.6)',
  },
  modalButton: {
    backgroundColor: 'rgba(100,100,130,0.9)',
    height: 45,
    width: 80,
  },
  btnBox: {
    borderWidth: 3,
    borderColor: 'rgba(200,200,200,0.6)',
    borderRadius: 100,
    // position: 'absolute',
    position: 'relative',
    right: 5,
    // top: '50%',
    // transform: [{ translateY: -50 }],
  },
  btnDel: {
    // position: 'absolute',
    position: 'relative',
    right: 0,
    // top: '50%',
    // transform: [{ translateY: -50 }],
  },
  textType: {
    fontSize: 12,
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
  textDate: {
    fontSize: 10,
    flexWrap: 'wrap',
    flex: 1,
  },
  icon: {
    height: 20,
    width: 20,
  },
});

export default Progress;
