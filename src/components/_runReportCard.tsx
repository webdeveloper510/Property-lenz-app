import React, { useState } from 'react';
import { StyleSheet, Linking,View,TouchableOpacity,ImageBackground } from 'react-native';
import { Text, Button, Box, Image, HStack, VStack, Alert } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Download from '@/assets/icon/download.png';
import DonloadImage from '@/assets/icon/download_2.png';
import { apiDownloadReport } from '@/apis/home';

import { eventNames, formatDate, warningTimer } from '@/constant/customHooks';

const _runReportCard = ({ data }: any): React.JSX.Element => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
console.log("##########",data.id)
  const download = async () => {
    const response = await apiDownloadReport(data.id);
    console.log("🚀 ~ download ~ response:", response)
    console.log(response);
    if (response.status) {
      const downloadUrl = response.result;
      try {
        await Linking.openURL(downloadUrl);
        console.log('Opening URL in browser: ', downloadUrl);
      } catch (err) {
        console.log('Error opening file: ', err);
        setErrMsg({ msg: 'Failed to download the file', error: true, show: true });
        const timer = await warningTimer(3);
        timer && setErrMsg({ msg: '', error: false, show: false });
      }

    } else {
      setErrMsg({ msg: response.message, error: true, show: true });
      const timer = await warningTimer(3);
      timer && setErrMsg({ msg: '', error: false, show: false });
    }
  };

  return (
    <>
      {errMsg.show &&
        <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} my={2} >
          <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
        </Alert>
      }
      <VStack space={0} style={styles.cardBody} mb={4}>
        <HStack space={2} justifyContent={'space-between'} pt={3} pb={2} px={3}>
          <View>
          <Text bold fontSize={'lg'} color={'my.t2'}>data.name</Text>
          <Text style={{fontSize:10,fontWeight:"400",color:'#250959'}}>Nirman@yopmail.com</Text>
          </View>
          <TouchableOpacity onPress={() => { download() }} style={styles.downloadButton}>
            <Image source={DonloadImage} style={{ height: 20, width: 20, resizeMode: 'contain' }} alt="e" />
          </TouchableOpacity>
        </HStack>

        <HStack justifyContent={'space-between'} space={2} px={3} py={1}>
          <VStack space={1} style={styles.contentContainer}>
            <VStack space={1}>
              <Text color={'#B598CB'}>Created At:</Text>
              <Text bold color={'#9A46DB'} fontSize={'xs'}>data?.created_at</Text>
            </VStack>
            <VStack space={1}>
              <Text color={'#B598CB'}>Completed ON:</Text>
              <Text bold color={'#9A46DB'} fontSize={'xs'}>data?.complete_at</Text>
            </VStack>
          </VStack>
          <VStack space={1} style={styles.contentContainer}>
            <VStack space={1}>
              <Text color={'#B598CB'}>Inspection Date:</Text>
              <Text bold color={'#9A46DB'} fontSize={'xs'}>data.inspection_date</Text>
            </VStack>
            <VStack space={1}>
              <Text color={'#B598CB'}>Comment:</Text>
              <Text bold color={'#9A46DB'} fontSize={'xs'}>
                data.final_comments
              </Text>
            </VStack>
          </VStack>
        </HStack>
{/* 
        <Box style={styles.CardFooter} mt={2} py={2}>
          <HStack justifyContent={'space-around'} alignItems={'center'} mb={1}>
            <Text mb={1} bold>
              data.activity
            </Text>
            <Button style={styles.cardButtonScheduled}
              onPress={() => { navigate('CompletedView', data.id); }} >View</Button>
          </HStack>
        </Box> */}
 <View
                style={{
                    width: '100%',
                    height: 60,
                    overflow: 'hidden',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop:10
                }}>
                <View
                    style={{
                        width: '44%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <TouchableOpacity style={styles.ActiveButton} onPress={()=> { navigate('CompletedView', 1); }}>
                     
                        <Text style={{fontSize:12,fontWeight:'700',color:'#250959',paddingLeft:5}}>Move Out</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width: '44%',backgroundColor:'red',height:60,borderTopLeftRadius:20,overflow: 'hidden'}}>
                <ImageBackground style={{width: '100%',backgroundColor:'red',height:60,justifyContent:'center',alignItems:'center'}} source={require('../assets/icon/background.png')} resizeMode='cover'>
                    <Text style={{fontSize:16,color:'#ffffff',fontWeight:'600'}}>{'Renter'}</Text>
                </ImageBackground>
                </View>
            </View>
      </VStack>
    </>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    borderWidth: 1,
    backgroundColor: 'rgba(245,244,249,1.0)',
    borderRadius: 20,
    marginHorizontal:12,
    borderColor: '#BF56FF',
  },
  contentContainer: {
    width: '50%',
  },
  CardFooter: {
    backgroundColor: 'rgba(125,125,125,0.1)',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardButtonScheduled: {
    backgroundColor: 'rgba(37, 73, 137, 0.7)',
    paddingVertical: 10,
    alignSelf: 'center',
    borderRadius: 5,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:2,
    borderColor:'#F3E7FD'
  },
     ActiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        width: '65%',
        justifyContent: 'center',
        padding: 4,
        borderRadius: 50,
        borderColor: '#F3E7FD',
    },
});
export default _runReportCard;
