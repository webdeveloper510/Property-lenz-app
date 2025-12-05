import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Text, Button, Box, Image, Input, HStack, Alert, Select, FormControl, Slider, VStack, ScrollView } from 'native-base';
import BackIcon from '@/assets/icon/btnBack.png';
import { useRoute } from '@react-navigation/native';
import { apiNewPictureAreas, apiNewPictureItem } from '@/apis/areas';
import { apiActivity_images } from '@/apis/property';
import { NewAreas, NewItem } from '@/services/types';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import {warningTimer} from '@/constant/customHooks';
import { heightPercentageToDP } from 'react-native-responsive-screen';

interface ActivityImage {
  property_id: number;
  image: any;
  activity: string;
  area_id: number | null;
  item_id: number | null;
  action: string;
  priority: number;
  comments: string;
}


const NewPicture = ({ navigation }: any): React.JSX.Element => {
  const [areas, setAreas] = useState<NewAreas[] | any>(null);
  const [items, setItems] = useState<NewItem[] | any>(null);
  const [activity, setActivity] = useState<string>('');
  const [location, setLocation] = useState<number | any>(null);
  const [details, setDetails] = useState<number | any>(null);
  const [action, setAction] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [priority, setPriority] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
  const route = useRoute();
  const data: any = route.params;

  const activityEnum = [
    { name: 'Maintenance', value: 'MAINTENANCE' },
    { name: 'Marketing', value: 'MARKETING' },
    { name: 'Move In', value: 'MOVE_IN' },
    { name: 'Move Out', value: 'MOVE_OUT' },
    { name: 'Notice', value: 'NOTICE' },
    { name: 'Onboarding', value: 'ONBOARDING' },
    { name: 'Periodic', value: 'PERIODIC' },
    { name: 'Per Inspection', value: 'PER_INSPECTION' },
    { name: 'Renewal', value: 'RENEWAL' },
    { name: 'Inspection', value: 'INSPECTION' },
  ];
  const actionEnum = [
    { name: 'Appliance', value: 'APPLIANCE' },
    { name: 'Carpet Cleaning', value: 'CARPET_CLEANING' },
    { name: 'Cleaning', value: 'CLEANING' },
    { name: 'Electrical', value: 'ELECTRICAL' },
    { name: 'Flooring', value: 'FLOORING' },
    { name: 'HVAC', value: 'HVAC' },
    { name: 'Keys', value: 'KEYS' },
    { name: 'Landscaping', value: 'LANDSCAPING' },
    { name: 'Maintenance', value: 'MAINTENANCE' },
    { name: 'Other', value: 'OTHER' },
    { name: 'Painting', value: 'PAINTING' },
    { name: 'Plumbing', value: 'PLUMBING' },
    { name: 'Repair', value: 'REPAIR' },
    { name: 'Roofing', value: 'ROOFING' },
  ];


  const getAreas = async () => {
    const response = await apiNewPictureAreas(data?.id);
    if (response.status) {
      setAreas(response.result);
    }
  };

  const getItem = async (id: number) => {
    setLocation(id);
    const response = await apiNewPictureItem(id);
    if (response.status) {
      setItems(response.result);
    }
  };

  const postActivity = async () => {
    if (activity.trim() == '') {
      setErrMsg({msg: 'Please Choose Activity', error: true, show: true});
      const timer = await warningTimer(3);
        timer && setErrMsg({msg: '', error: false, show: false});
    } else if (location != null && details == null ) {
      setErrMsg({msg: 'Please Choose Details', error: true, show: true});
      const timer = await warningTimer(3);
        timer && setErrMsg({msg: '', error: false, show: false});
    } else {
        setIsLoading(true);
        const event: ActivityImage = {
          property_id: data?.id,
          image : data?.image,
          activity  : activity,
          area_id: location,
          item_id: details,
          action: action,
          priority: priority,
          comments: comment.trim(),
        };
        const response = await apiActivity_images(event);
        if (response.status) {
          navigation.navigate('Details', data?.id);
        } else {
          setIsLoading(false);
          setErrMsg({msg: response.message, error: true, show: true});
          const timer = await warningTimer(3);
            timer && setErrMsg({msg: '', error: false, show: false});
        }
    }
  };

  useEffect(() => {
    getAreas();
  }, [areas]);

  if (areas == null) {
    return (
      <Spinner_Loading />
    );
  }

  return (
    <ScrollView style={{minHeight: heightPercentageToDP('100%')}}>
    <Box style={styles.mainContainer}>
      <SafeAreaView>
      <HStack mb={5} height={50} alignItems={'center'}>
        <Pressable onPress={() => { navigation.navigate('Details'); }}>
          <Image source={BackIcon} alt="Back" style={styles.backIcon} />
        </Pressable>
        <Text bold fontSize={'xl'} ml={3} mb={1} color={'my.h'}>New Pictures</Text>
      </HStack>
      </SafeAreaView>
      {/* add a title here if needed */}
      <VStack space={2}>
        <Box maxW="100%">
          <Text color={'my.t2'}>Activity *</Text>
          <Select placeholder="Choose Activity" style={{height: 45}} mt={1} onValueChange={(itemValue) => setActivity(itemValue)} >
            {activityEnum.map((e, i) => {
              return (
                <Select.Item key={i} label={e.name} value={e.value} />
              );
            })}
          </Select>
        </Box>
        <Box w={'100%'}>
          <Text color={'my.t2'}>Location</Text>
          <Select placeholder="Choose Location" style={{height: 45}} mt={1} onValueChange={(itemValue: any) => {getItem(itemValue); setLocation(itemValue);}}>
            {areas != null && areas?.map((area:any, i:number) => {
              return (
                <Select.Item key={i} label={area?.title} value={area.id} />
              );
            })}
          </Select>
        </Box>
        {items != null &&
          <Box w={'100%'}>
            <Text color={'my.t2'}>Details</Text>
            <Select placeholder="Choose Details" style={{height: 45}} mt={1} onValueChange={(itemValue) => setDetails(itemValue)}>
              {items.map((item:any, i:number) => {
                return (
                  <Select.Item key={i} label={item.name} value={item.id} />
                );
              })}
              <Select.Item label="Cleaning" value="1" />
            </Select>
          </Box>
        }
        <Box maxW="100%">
          <Text color={'my.t2'}>Action</Text>
          <Select placeholder="Choose Action" style={{height: 45}} mt={1} onValueChange={(itemValue) => setAction(itemValue)} >
            {actionEnum.map((e, i) => {
              return (
                <Select.Item key={i} label={e.name} value={e.value} />
              );
            })}
          </Select>
        </Box>
        <Box w={'100%'}>
          <Text color={'my.t2'} >Comment</Text>
          <FormControl isRequired style={styles.formControl} mt={1}>
            <Input style={styles.input} _focus={{ borderColor: 'rgb(125,125,125,0.9)' }} value={comment} onChangeText={setComment} />
          </FormControl>
        </Box>
        <VStack space={8} mt={-1}>
        <Box w={'100%'}>
          <Text color={'my.t2'} mb={2}>Priority</Text>
          <Slider defaultValue={priority}  onChange={itemValue => setPriority(itemValue)} minValue={1} maxValue={5} step={1} mt={1}>
            <Slider.Track shadow={2}>
              <Slider.FilledTrack bgColor={'rgba(10,113,189,0.7)'} />
            </Slider.Track >
            <Slider.Thumb shadow={3} bgColor={'rgba(10,113,189,0.9)'} />
          </Slider>
        </Box>
        {errMsg.show &&
            <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} my={-2}>
              <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.500'}>{errMsg.msg}</Text>
            </Alert>
          }
        <Button isLoading={isLoading} style={{backgroundColor: 'rgba(10,113,189,0.9)', width: '50%', alignSelf: 'center' }} onPress={()=> {postActivity();}}>Done</Button>
        </VStack>
      </VStack >
    </Box >
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    width: '100%',
    height: heightPercentageToDP('100%'),
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backIcon: {
    height: 40,
    width: 40,
    resizeMode: 'stretch',
  },
  formControl: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // backgroundColor: 'rgba(225, 225, 225, 0.4)',
    height: 'auto',
    width: '100%',
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    height: 45,
    color: 'black',
    // backgroundColor: 'transparent',
  },
});

export default NewPicture;
