import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, Image, Badge, HStack, VStack, TextArea } from 'native-base';
import { apiUpdateStatus } from '@/apis/property';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// icon
import DisableIcon from '@/assets/icon/disable.png';
import CameraOption from '@/assets/icon/camOption.png';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAppSelector } from '@/state/hooks';

const _tenantAreaCard = ({ Data, inspectionId, page, onItemUpdate }: any): React.JSX.Element => {
  const userData = useAppSelector(state => state.auth.userData);
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const [status_item, setStatus] = useState('');
  const [comment, setComment] = useState<string>('');
  const [focus, setFocus] = useState<boolean>((userData?.type == 'TENANT' && (Data.comments == null || Data.comments == '') ) ? true : false);
  const [status_focus, setStatus_Focus] = useState<boolean>(userData?.type == 'TENANT' ? true : false);

  useEffect(() => {
    if (Data) {
      setStatus(Data.status);
      setComment(Data.comments);
    }
  }, [Data]);

  const statusUpdate = async (stat: any,) => {
    setStatus(stat);
    onItemUpdate(stat, Data.item_id, comment, );
    setStatus_Focus(userData?.type == 'TENANT' ? true : false);

    const data = {
      id: inspectionId,
      area_id: Data.area_id,
      item_id: Data.item_id,
      status: stat ? stat : '',
      comments: comment,
    };
    const response = await apiUpdateStatus(data);
    if (response.status) {
    }
  };

  useEffect(()=>{
    if (comment != '' && comment != null && comment != Data.comments) {
      statusUpdate(status_item);
    }
  },[comment]);
  useEffect(()=>{},[focus]);

  return (
    <VStack space={0} mb={3} style={{
      backgroundColor: 'rgba(242,242,242,1.0)', padding: 10,
    }}>
      {Data.is_enable == 1 ?
        <>
          <HStack justifyContent={'space-between'}>
            <Box width={'100%'}>
              <Text bold fontSize={'md'}>{Data.name}</Text>
            </Box>
          </HStack>
            <HStack space={1} mt={2} mb={1} justifyContent={'space-around'}>
            <TouchableOpacity onPress={() => {Data.status !== 'NEW' ?  statusUpdate('NEW') : setStatus_Focus(userData?.type == 'TENANT' ? true : !status_focus); }}>
              <Box justifyContent={'center'} style={status_item === 'NEW' ? styles.n : styles.def} alignItems={'center'}>
                <Text bold color={'white'} fontSize={'xl'}>N</Text></Box>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Data.status !== 'SATISFACTORY' ? statusUpdate('SATISFACTORY') : setStatus_Focus(userData?.type == 'TENANT' ? true : !status_focus); }}>
              <Box justifyContent={'center'} style={status_item === 'SATISFACTORY' ? styles.s : styles.def} alignItems={'center'}>
                <Text bold color={'white'} fontSize={'xl'}>S</Text></Box>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {Data.status !== 'DAMAGE' ? statusUpdate('DAMAGE') : setStatus_Focus(userData?.type == 'TENANT' ? true : !status_focus); }}>
              <Box justifyContent={'center'} style={status_item === 'DAMAGE' ? styles.d : styles.def} alignItems={'center'}>
                <Text bold color={'white'} fontSize={'xl'}>D</Text></Box>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {Data.status !== 'ATTENTION' ? statusUpdate('ATTENTION') : setStatus_Focus(userData?.type == 'TENANT' ? true : !status_focus); }}>
              <Box justifyContent={'center'} style={status_item === 'ATTENTION' ? styles.a : styles.def} alignItems={'center'}>
                <Text bold color={'white'} fontSize={'xl'}>!</Text></Box>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {Data.status !== 'NOT_AVAILABLE' ? statusUpdate('NOT_AVAILABLE') : setStatus_Focus(userData?.type == 'TENANT' ? true : !status_focus); }}>
              <Box justifyContent={'center'} style={status_item === 'NOT_AVAILABLE' ? styles.y : styles.def} alignItems={'center'}>
                <Text bold color={'white'} fontSize={'xl'}>N/A</Text></Box>
            </TouchableOpacity>
            </HStack>

            <HStack mt={3} space={1}>
            <TextArea mt={1} placeholder="Comment..." w="100%"  style={styles.textAreaFocus}
            value={comment} onChangeText={setComment} onBlur={() => { statusUpdate(status_item); setFocus(!focus);}} />

            <VStack mt={2}>
                {Data.images.length > 0 &&
                  <Badge colorScheme="danger" rounded="full" zIndex={1} mb={-4} mr={-1}
                    variant="solid" _text={{ fontSize: 9 }} alignSelf={'flex-end'} >{Data.images.length}</Badge>
                }
                <TouchableOpacity onPress={() => { navigate('Camera', { id: inspectionId, area_id: Data.area_id, item_id: Data.item_id, page: page }); }}>
                <Image source={CameraOption} alt="picture" style={styles.cameraIcon} />
                </TouchableOpacity>
              </VStack>
            </HStack>
        </>
        :
        <Pressable style={{width: '100%'}} onPress={()=>{statusUpdate(status_item); setStatus_Focus(false);}}>
          <HStack alignItems={'center'} space={2}>
          <Image source={DisableIcon} style={{height: 15, width: 15}} alt="icon" />
          <Text color={'my.tl'} fontSize={'sm'} >{Data.name}</Text>
          </HStack>
        </Pressable>
      }
    </VStack>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  textArea: {
    borderWidth: 0,
    height: 30,
    marginBottom: -5,
  },
  textAreaFocus: {
    flex: 1,
    marginRight: 5,
    borderWidth: 1,
    height: 45,
    borderColor: 'rgba(217,217,217,0.6)',
  },
  closeIcon: {
    height: 20,
    width: 20,
    position: 'absolute',
    right: -5,
    top: -3,
  },
  cameraIcon: {
    height: 37,
    width: 37,
  },
  icon: {
    height: 37,
    width: 37,
    resizeMode: 'stretch',
  },
  def: {
    backgroundColor: 'rgba(217,217,217,1.0)',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
  n: {
    backgroundColor: 'rgba(0, 208, 255, 1)',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
  s: {
    backgroundColor: 'rgba(138, 199, 62, 1)',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
  d: {
    backgroundColor: 'rgba(253, 56, 24, 1)',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
  a: {
    backgroundColor: 'rgba(254,95,21,1.0)',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
  y: {
    backgroundColor: '#ffcc5e',
    width: 49,
    height: 44,
    borderRadius: 10,
  },
});

export default _tenantAreaCard;
