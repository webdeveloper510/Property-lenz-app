import React, { useEffect, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
  Text, Box, Image, Alert, HStack, FormControl, Input, Select, Button, ScrollView, VStack,
} from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { apiGetMyProperties } from '@/apis/property';
import { apiLeaseAdd } from '@/apis/lease';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import { useRoute } from '@react-navigation/native';
import { dateTOIsoString, warningTimer } from '@/constant/customHooks';
import { leaseStatus } from '@/constant/constant';
// icon
import Back from '@/assets/icon/btnBack.png';
import { apiAllTenant } from '@/apis/user';
import { MyTenants } from '@/services/types';
import DatePicker from '@/components/DatePicker';
type P = {
  id: number;
  type: string;
  name: string;
  location: string;
  cover_image: string | null;
}[];

interface TenantType {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: any;
}
const exampleRenter: TenantType = {
  id: 0,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
};

const TenantAdd = ({ navigation }: any): React.JSX.Element => {
  const route = useRoute();
  const items: any = route.params;
  const [selectLeaseStatus, setSelectLeaseStatus] = useState(items.data?.status ? items.data?.status : null);
  const [leaseIn, setLeaseIn] = useState<Date | any>(items.data?.move_in_date ? new Date(items.data?.move_in_date) : new Date());
  const [leaseOut, setLeaseOut] = useState<Date | any>(items.data?.move_out_date ? new Date(items.data?.move_out_date) : new Date());
  const [comment, setComment] = useState(items.data?.comments || '');
  const [fName, setFName] = useState<string>(items.data?.tenant_first_name || '');
  const [lName, setLName] = useState<string>(items.data?.tenant_last_name || '');
  const [email, setEmail] = useState<string>(items.data?.tenant_email || '');
  const [phone, setPhone] = useState<string>(items.data?.tenant_phone || '');
  const [renterData, setRenterData] = useState<MyTenants[]>([]);
  const [selectedRenter, setSelectedRenter] = useState<TenantType | null>(items.data ? {
    id: items.data?.tenant_id,
    first_name: items?.data?.tenant_first_name,
    last_name: items?.data?.tenant_last_name,
    email: items?.data?.tenant_email,
    phone: items?.data?.tenant_phone,
  } : null);
  const [property, setProperty] = useState<P | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState({ message: '', error: false, show: false });

  const getProperty = async () => {
    const response: any = await apiGetMyProperties();
    if (response.status) {
      setProperty(response.result);
    }
  };
  const getTenant = async () => {
    const response = await apiAllTenant({ per_page: 50, page_no: 1 });
    if (response.status) {
      setRenterData(response.result.data);
    }
  };
  const submit = async () => {
    setIsLoading(true);
    const tenant = {
      id: selectedRenter?.id == 0 ? null : selectedRenter?.id,
      first_name: fName,
      last_name: lName,
      email: email,
      phone: phone,
    };
    const data: any = {
      tenant: tenant,
      property_id: items?.PropertyId,
      status: selectLeaseStatus,
      move_in_date: dateTOIsoString(leaseIn),
      move_out_date: dateTOIsoString(leaseOut),
      comments: comment.trim(),
    };
    console.log(data);
    const response = await apiLeaseAdd(data);
    console.log(response);
    if (response.status) {
      setErrMsg({ message: 'Successful', error: false, show: true });
      setTimeout(() => {
        setErrMsg({ message: '', error: false, show: false });
        navigation.goBack(null);
      }, 2000);
    } else {
      setErrMsg({ message: response.message, error: true, show: true });
      setTimeout(() => {
        setErrMsg({ message: '', error: false, show: false });
      }, 1000);
      setIsLoading(false);
    }
  };
  const formateName = (first: any, last: any): string => {
    return first != null ? `${first} ${last}` : '';
  };

  useEffect(() => {
    getProperty();
    getTenant();
  }, []);
  useEffect(() => {
  }, [property, renterData]);

  const showError = async (message: string, duration: number) => {
    setErrMsg({ message, error: true, show: true });
    const timer = await warningTimer(duration);
    if (timer) { setErrMsg({ message: '', error: false, show: false }); }
  };
  const handleWarning = async () => {
    if (selectLeaseStatus == null) {
      await showError('Please Select Renter Status', 3);
    } else {
      await handleError();
    }
  };
  const handleError = async () => {
    const addNewRenterValidations = [
      { condition: !fName.trim(), message: 'Please Give First Name' },
      { condition: !lName.trim(), message: 'Please Give Last Name' },
      { condition: !email.trim(), message: 'Please Give Email Address' },
      {
        condition: !(email.includes('.com') && email.includes('@')),
        message: 'Please Give A Proper Email Address',
      },
      { condition: !phone.trim(), message: 'Please Give Phone Number' },
    ];

    const selectRenterValidations = [
      { condition: !selectedRenter, message: 'Please Select A Renter' },
    ];

    const validations = selectedRenter !== null && selectedRenter.id === 0
      ? addNewRenterValidations
      : selectRenterValidations;

    for (const { condition, message } of validations) {
      if (condition) {
        await showError(message, 2);
        return;
      }
    }

    submit();
  };

  if (!property) {
    return <Spinner_Loading />;
  }

  return (
	<KeyboardAwareScrollView
		enableOnAndroid={true}
		enableAutomaticScroll={Platform.OS === 'ios'}
		keyboardShouldPersistTaps="handled"
		extraScrollHeight={100}
		extraHeight={20}
	>
      <Box style={styles.mainContainer}>
        <SafeAreaView>
          <HStack mb={5} alignItems={'center'}>
            <Pressable onPress={() => { navigation.goBack(null); }}>
              <Image source={Back} alt="Back" style={styles.backIcon} />
            </Pressable>
            <Text bold fontSize={'2xl'} mt={1} lineHeight={30} style={{
              flex: 1, flexWrap: 'wrap',
            }} ml={3} mb={1} color={'my.h4'} >Create Renter Connection</Text>
          </HStack>
        </SafeAreaView>
        <VStack space={2}>
          <Box w="100%">
            <Text color={'my.t2'}>Renter Status*</Text>
            <Select minWidth="200" accessibilityLabel="Choose Service" defaultValue={selectLeaseStatus}
              placeholder="Chose Status" style={{ height: 45 }} _selectedItem={{
              }} mt={1} onValueChange={itemValue => setSelectLeaseStatus(itemValue)}>
              {leaseStatus.map((item, i) => {
                return (
                  <Select.Item key={i} label={item.name} value={item.value} />
                );
              })}
            </Select>
          </Box>
          {selectedRenter !== null && selectedRenter?.id === 0 ?
            <VStack space={2}>
              <Box w="100%">
                <Text color={'my.t2'}>Renter First Name*</Text>
                <FormControl style={styles.formControl}>
                  <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                    value={fName} onChangeText={setFName} />
                </FormControl>
              </Box>
              <Box w="100%">
                <Text color={'my.t2'}>Renter Last Name*</Text>
                <FormControl style={styles.formControl}>
                  <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                    value={lName} onChangeText={setLName} />
                </FormControl>
              </Box>
              <Box w="100%">
                <Text color={'my.t2'}>Renter Email*</Text>
                <FormControl style={styles.formControl}>
                  <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                    keyboardType="email-address" value={email} onChangeText={setEmail} />
                </FormControl>
              </Box>
              <Box w="100%">
                <Text color={'my.t2'}>Renter Phone*</Text>
                <FormControl style={styles.formControl}>
                  <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                    keyboardType="numeric" value={phone} onChangeText={setPhone} />
                </FormControl>
              </Box>
            </VStack> :
            <>
              <Box w="100%">
                <Text color={'my.t2'}>Renter*</Text>
                <Select minWidth="200" accessibilityLabel="Choose Service" defaultValue={formateName(selectedRenter?.first_name, selectedRenter?.last_name)}
                  placeholder="Chose Renter" style={{ height: 45 }} _selectedItem={{
                  }} mt={1} onValueChange={(itemValue: any) => { setSelectedRenter(itemValue); console.log(itemValue); }}>
                  {renterData.map((item, i) => {
                    return (
                      <Select.Item key={i} label={formateName(item.first_name, item.last_name)} value={item} />
                    );
                  })}
                  <Select.Item label={'Create Renter'} value={exampleRenter} />
                </Select>
              </Box>
            </>}
          <HStack justifyContent={'space-between'}>
            <Box w={wp('40%')}>
              <Text color={'my.t2'}>Move In</Text>
              <DatePicker
                display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                value={leaseIn ? leaseIn : new Date()}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => { setLeaseIn(selectedDate);}}
              />
            </Box>
            <Box w={wp('40%')}>
              <Text color={'my.t2'}>Move Out</Text>
              <DatePicker
                display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                value={leaseOut ? leaseOut : null}
                minimumDate={leaseIn ? leaseIn : new Date()}
                onChange={(event, selectedDate) => { setLeaseOut(selectedDate);}}
              />
            </Box>
          </HStack>
          <Box w="100%" mb={3} mt={-3}>
            <Text color={'my.t2'}>Comment</Text>
            <FormControl style={styles.formControl}>
              <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                value={comment} onChangeText={setComment} />
            </FormControl>
          </Box>
        </VStack>
        {errMsg.show &&
          <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} mb={3}>
            <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.500'}>{errMsg.message}</Text>
          </Alert>
        }
        <HStack justifyContent={'space-between'} space={3} alignItems={'center'} mt={5} mb={8}>
          <Button style={{ ...styles.button, backgroundColor: 'rgba(140,140,140,0.5)' }}>Cancel</Button>
          <Button isLoading={isLoading} py={2} style={{ ...styles.button, backgroundColor: 'rgba(10,113,189,0.9)' }}
            onPress={() => { handleWarning(); }} >Create Connection</Button>
        </HStack>
      </Box>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
      width:'100%',
        minHeight: hp('100%'),
        alignSelf:'center',
        backgroundColor:'#F2F2F2'
  },
  backIcon: {
    height: 40,
    width: 40,
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    color: 'black',
    height: 45,
  },
  formControl: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 45,
    width: '100%',
    borderRadius: 8,
    // marginBottom: 10,
  },
  button: {
    minHeight: 45,
    flex: 1,
    borderRadius: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    flex: 1,
    height: 45,
    color: 'black',
    borderWidth: 1,
    borderColor: 'rgba(125, 125, 125,0.2)',
    backgroundColor: 'transparent',
    borderRadius: 4,
    textAlignVertical: 'center',
    padding: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(125,125,125,0.1)',
    borderRadius: 5,
    marginBottom: 10,
    height: 45,
    padding: 10,
    backgroundColor: 'rgba(217,217,217,0.2)',
  },
});

export default TenantAdd;
