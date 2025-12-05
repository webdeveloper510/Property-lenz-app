import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, VStack } from 'native-base';
import pic from '@/assets/logo/MonoWhite.png';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventNames } from '@/constant/customHooks';
// import FastImage from 'react-native-fast-image'
const _propertyCard = ({data}:any): React.JSX.Element => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
 console.log("##############====>in home screen===>",data)
  return (
    <Pressable onPress={()=>{navigate('Details', data?.id);}}>
    <HStack style={styles.mainContainer} shadow={2}>
      <Box style={styles.imageContainer}>
      {/* <FastImage
        source={{
            uri: data?.cover_image ? { uri: data?.cover_image } : pic ,
            headers: { Authorization: 'someAuthToken' },
            priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.contain}
        style={data?.cover_image ? styles.image : {...styles.image, height: '40%', width: '80%', alignSelf: 'center'}}
    /> */}
      <Image  source={data?.cover_image ? { uri: data?.cover_image } : pic }
      style={data?.cover_image ? styles.image : {...styles.image, height: '40%', width: '80%', alignSelf: 'center'}} alt="image" />
      </Box>
      <VStack style={{flex: 1, flexWrap: 'wrap'}} space={1}  alignItems={'center'} p={2}>
        <Text bold fontSize={'md'} color={'white'} alignSelf={'flex-start'}>{data?.name}</Text>
        <Text bold fontSize={'xs'} color={'white'} lineHeight={14} alignSelf={'flex-start'}>
          {eventNames(data?.type)}</Text>
        <Text bold style={{fontSize: 10}} color={'white'} lineHeight={14} numberOfLines={2} ellipsizeMode={'tail'} alignSelf={'flex-start'}>{data?.location}</Text>
      </VStack>
    </HStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
mainContainer: {
  backgroundColor: 'rgb(9,120,199)',
  flex: 1,
  height: 100,
},
imageContainer: {
  backgroundColor: 'gray',
  width: '35%',
  height: '100%',
},
image: {
   height: '100%',
   width: '100%',
   resizeMode: 'contain',
},
propertyName: {
  width: 106,
  fontSize: 12,
  lineHeight: 12,
  flexWrap: 'nowrap',
},
btnBox: {
  borderWidth: 3,
  borderColor: '#fff',
  borderRadius: 100,
},
});
export default _propertyCard;
