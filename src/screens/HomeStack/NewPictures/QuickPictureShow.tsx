import React from 'react';
import { Pressable, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Text, Box, HStack, VStack, Divider, ScrollView } from 'native-base';
import BackIcon from '@/assets/icon/btnBack.png';
import { useRoute } from '@react-navigation/native';

const QuickPictureShow = ({ navigation }: any): React.JSX.Element => {
  const route = useRoute();
  const propertyData: any = route.params;

  return (
    <Box style={styles.mainContainer}>
      <SafeAreaView>
      <HStack mb={4} height={50} alignItems={'center'}>
        <Pressable onPress={() => { navigation.goBack(propertyData?.propertyId); }}>
          <Image source={BackIcon} alt="Back" style={styles.backIcon} />
        </Pressable>
      </HStack>
      </SafeAreaView>
      <Image source={{ uri: propertyData?.data.image }} style={{ width: '100%', height: '50%', resizeMode: 'stretch'  }} alt="image" />
      <ScrollView>
      <VStack space={1} mt={5}>
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Action:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data?.action}</Text>
          </Box>
        </HStack>
        <Divider />
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Activity:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data?.activity}</Text>
          </Box>
        </HStack>
        {propertyData?.data?.area_name ?
        <>
        <Divider />
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Location:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data?.area_name}</Text>
          </Box>
        </HStack>
        </> : null }
        {propertyData?.data?.item_name ?
        <>
        <Divider />
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Details:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data?.item_name}</Text>
          </Box>
        </HStack>
        </> : null }
        <Divider />
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Priority:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data.priority}</Text>
          </Box>
        </HStack>
        <Divider />
        <HStack justifyContent={'space-around'}>
          <Box w={'50%'}>
            <Text color={'my.h'} bold>Comment:</Text>
          </Box>
          <Box w={'50%'}>
            <Text>{propertyData?.data?.comments}</Text>
          </Box>
        </HStack>
      </VStack>
      </ScrollView>
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
});

export default QuickPictureShow;
