import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, FormControl, Input, Select, Button, ScrollView, VStack, Alert } from 'native-base';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { apiUpdateLease } from '@/apis/lease';
import { leaseStatus } from '@/constant/constant';
import { warningTimer } from '@/constant/customHooks';
// icon
import Back from '@/assets/icon/btnBack.png';
import DatePicker from '@/components/DatePicker';

const TenantEdit = ({ navigation }: any): React.JSX.Element => {
  const route = useRoute();
  const data: any = route.params;
  const [selectLeaseStatus, setSelectLeaseStatus] = useState(data?.data.status);
  const [leaseIn, setLeaseIn] = useState<Date | any>(data?.data.move_in_date !== null ? new Date(data?.data.move_in_date) : null);
  const [leaseOut, setLeaseOut] = useState<Date | any>(data?.data.move_out_date !== null ? new Date(data?.data.move_out_date) : null);
  const [comment, setComment] = useState(data?.data.comments);
  const [fName, setFName] = useState<string>(data.data?.tenant_first_name || '');
  const [lName, setLName] = useState<string>(data.data?.tenant_last_name || '');
  const [email, setEmail] = useState<string>(data.data?.tenant_email || '');
  const [phone, setPhone] = useState<string>(data.data?.tenant_phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [allow, setAllow] = useState(false);
  const [errMsg, setErrMsg] = useState({ message: '', error: false, show: false });

  const allowedMap: any = {
    Invite: false,
    Expired: false,
  };
  useEffect(() => {
    setAllow(allowedMap[data.data.movein_status] ?? true);
  }, []);

  const showError = async (message: string, duration: number) => {
    setErrMsg({ message, error: true, show: true });
    const timer = await warningTimer(duration);
    if (timer) { setErrMsg({ message: '', error: false, show: false }); }
  };
  const handleError = async () => {
    const validations = [
      { condition: !fName.trim(), message: 'Please Give First Name' },
      { condition: !lName.trim(), message: 'Please Give Last Name' },
      { condition: !phone.trim(), message: 'Please Give Phone Number' },
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        await showError(message, 2);
        return;
      }
    }

    updateLease();
  };

  const updateLease = async () => {
    setIsLoading(true);
    const tenant = {
      first_name: fName,
      last_name: lName,
      phone: phone,
    };
    const update = {
      id: data?.data.id,
      property_id: data?.PropertyId,
      tenant: tenant,
      status: selectLeaseStatus,
      move_in_date: leaseIn !== null ? leaseIn?.toISOString().split('T')[0] : null,
      move_out_date: leaseOut !== null ? leaseOut?.toISOString().split('T')[0] : null,
      comments: comment,
    };
    const response = await apiUpdateLease(update);
    if (response.status) {
      setErrMsg({ message: 'Successful', error: false, show: true });
      const timer = await warningTimer(1);
      timer && setErrMsg({ message: '', error: false, show: false });
      timer && navigation.goBack(null);
    } else {
      setErrMsg({ message: response.message, error: true, show: true });
      const timer = await warningTimer(1);
      timer && setErrMsg({ message: response.message, error: false, show: true });
      timer && setIsLoading(false);
    }
  };

  return (
    <ScrollView>
      <Box style={styles.mainContainer}>
        <SafeAreaView>
          <HStack mb={5} mt={6} alignItems={'center'}>
            <Pressable onPress={() => { navigation.goBack(null); }}>
              <Image source={Back} alt="Back" style={styles.backIcon} />
            </Pressable>
            <Text bold fontSize={'3xl'}
              lineHeight={30} style={{
                flex: 1, flexWrap: 'wrap',
              }} ml={3} mb={1} color={'my.h4'} >Edit Renter Connection</Text>
          </HStack>
        </SafeAreaView>
        <VStack space={2} >
          <Box w="100%">
            <Text color={'my.t2'}>Renter Status</Text>
            <Select minWidth="200" style={{ height: 45 }} isDisabled={allow} accessibilityLabel="Choose Service" defaultValue={selectLeaseStatus}
              placeholder="Chose Status" _selectedItem={{
              }} mt={1} onValueChange={itemValue => setSelectLeaseStatus(itemValue)}>
              {leaseStatus.map((item, i) => {
                return (
                  <Select.Item key={i} label={item.name} value={item.value} />
                );
              })}
            </Select>
          </Box>
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
                keyboardType="email-address" value={email} onChangeText={setEmail} isDisabled={true} readOnly />
            </FormControl>
          </Box>
          <Box w="100%">
            <Text color={'my.t2'}>Renter Phone</Text>
            <FormControl style={styles.formControl}>
              <Input style={styles.input} _focus={{ borderColor: 'rgba(210, 210,210,0.6)' }}
                keyboardType="numeric" value={phone} onChangeText={setPhone} />
            </FormControl>
          </Box>
          <HStack justifyContent={'space-between'}>
            <Box w={wp('40%')}>
              <Text color={'my.t2'}>Move In</Text>
              <DatePicker
                value={leaseIn ? leaseIn : new Date()}
                onChange={(event, selectedDate) => { setLeaseIn(selectedDate);}}
              />
            </Box>
            <Box w={wp('40%')}>
              <Text color={'my.t2'}>Move Out</Text>
              <DatePicker
                value={leaseOut ? leaseOut : new Date()} minimumDate={leaseIn ? leaseIn : new Date()}
                onChange={(event, selectedDate) => { setLeaseOut(selectedDate);}}
              />
            </Box>
          </HStack>
          <Box w="100%" mb={3} mt={-3}>
            <Text color={'my.t2'}>Comment</Text>
            <FormControl style={styles.formControl}>
              <Input isDisabled={allow} style={styles.input} _focus={{ borderColor: 'rgb(125,125,125,0.9)' }}
                value={comment} onChangeText={setComment} readOnly={allow} />
            </FormControl>
          </Box>
          {errMsg.show &&
            <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} mb={3}>
              <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.500'}>{errMsg.message}</Text>
            </Alert>
          }
          <HStack justifyContent={'space-between'} space={3} alignItems={'center'} mt={5} mb={8}>
            <Button colorScheme="danger" onPress={() => { navigation.goBack(null); }} style={styles.button}>Cancel</Button>
            <Button isLoading={isLoading} style={{ ...styles.button, backgroundColor: 'rgba(10,113,199,0.9)' }}
              onPress={() => { handleError(); }}>{data.data.movein_status == 'Expired' ? 'Re Invite' : 'Done'}</Button>
          </HStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    minHeight: hp('100%'),
  },
  backIcon: {
    height: 40,
    width: 40,
  },
  formControl: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 'auto',
    width: '100%',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    color: 'black',
    height: 45,
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
  button: {
    minHeight: 45,
    flex: 1,
    borderRadius: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TenantEdit;
