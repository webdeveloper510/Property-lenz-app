import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, ScrollView, VStack, TextArea, Alert, Spinner } from 'native-base';
import { useRoute } from '@react-navigation/native';
import { apiInviteTenant } from '@/apis/tenant';
import { dateTOIsoString, formatDate } from '@/constant/customHooks';
import BackIcon from '@/assets/icon/btnBack.png';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import DatePicker from '@/components/DatePicker';

const InviteTenant = ({ navigation }: any): React.JSX.Element => {
    const [send, setSend] = useState<any | null>(new Date());
    const [disable, setDisable] = useState<any | null>(new Date());
    const [isDisable, setIsDisable] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
    const route: any = useRoute();
    const leaseData = route.params;

    const [messageBody, setMessageBody] = useState(`Dear ${leaseData?.tenant_first_name} ${leaseData?.tenant_last_name},

Welcome to ${leaseData?.property_name}. Please complete this move-in inspection as soon as possible to document the condition of the property as received.

You must download the PropertyLenz app and use the provided password to login as a renter. The password is provided below.

For any issues, please reply to this email.

Thank you!
`);


    const inviteTenant = async () => {
        setIsDisable(true);
        if (send == null || disable == null) {
            setErrMsg({ msg: 'Please fill Both Date Fields', error: true, show: true });
            setTimeout(() => {
                setErrMsg({ msg: '', error: false, show: false });
            }, 2000);
            setIsDisable(false);
            return;
        }
        const data = {
            lease_id: leaseData.id,
            type: 'MOVE_IN',
            movein_invite_on: dateTOIsoString(send),
            movein_disable_on: dateTOIsoString(disable),
            message: messageBody,
        };
        const response = await apiInviteTenant(data);
        if (response.status) {
            navigation.goBack(null);
        } else {
            setIsDisable(false);
            setErrMsg({ msg: 'Something Went Wrong', error: true, show: true });
            setTimeout(() => {
                setErrMsg({ msg: '', error: false, show: false });
            }, 3000);

        }
    };

    return (
        <ScrollView>
            <VStack justifyContent={'space-between'} style={styles.mainContainer}>
            <SafeAreaView>
                <HStack mb={5} height={50} alignItems={'center'}>
                    <Pressable onPress={() => { navigation.goBack(null); }}>
                        <Image source={BackIcon} alt="Back" style={styles.backIcon} />
                    </Pressable>
                    <Text bold fontSize={'3xl'} ml={3} mb={1} color={'my.h4'} >Invite Renter</Text>
                </HStack>
            </SafeAreaView>
            <Box>
                    <HStack style={{ height: 45 }} justifyContent={'space-between'} mb={5}>
                        <Text color={'my.t2'} alignSelf={'center'}>Send Invitation on*:</Text>

						<DatePicker
							value={send ? send : new Date()}
							minimumDate={new Date()}
							onChange={(event, selectedDate) => { setSend(selectedDate);}}
						/>

                    </HStack>
                    <HStack style={{ height: 45 }} justifyContent={'space-between'} mb={5}>
                        <Text color={'my.t2'} alignSelf={'center'}>Disable Access on*:</Text>

						<DatePicker
							value={disable ? disable : new Date()}
                            minimumDate={send ? send : new Date()}
							onChange={(event, selectedDate) => { setDisable(selectedDate);}}
						/>

                    </HStack>
                </Box>
                <VStack space={2}>
                    <Text color={'my.t2'}>Message:</Text>
                    <TextArea style={styles.textArea} value={messageBody} onChangeText={setMessageBody}
                        _focus={{ borderColor: 'rgb(125,125,125,0.9)' }} />
                </VStack>
                <VStack space={1}>
                    <Text bold fontSize="xl" mt={5} color={'my.h'}>Instructions</Text>
                    <Text fontSize="xs" color={'my.t'}>Anything typed in the white box with the name of Message will be send to tenant.</Text>
                    <Text fontSize="xs" color={'my.t'}>That Text will be followed automatically with all information needed by
                        the tenant to do the tenant move-in inspection including:
                        <Text fontSize="xs" bold color={'my.t2'}>App Download Links, Secure Login Information,
                            Property Name, and Lease Start Date.</Text></Text>
                </VStack>
                {errMsg.show &&
                    <Alert w="100%" status={errMsg.error ? 'danger' : 'success'} mt={3} mb={1}>
                        <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.500'}>{errMsg.msg}</Text>
                    </Alert>
                }
                <VStack style={styles.footerContainer} mt={5}>
                    <Box style={styles.footerBox} />
                    <HStack alignItems={'center'} justifyContent={'center'} style={isDisable ? {...styles.footerBtn, backgroundColor: 'rgba(265,265,265,0.7)'} : styles.footerBtn} my={'auto'} mx={'auto'}>
                            {isDisable && <Spinner color={'my.h3'} />}
                        <Pressable onPress={() => {isDisable ? null : inviteTenant(); }}>
                            <Text bold fontSize={'lg'} color={isDisable ? 'rgba(90,113,189,0.9)' : 'rgba(10,113,199,0.9)'} >Invite</Text>
                        </Pressable>
                    </HStack>
                </VStack>
            </VStack>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        minHeight: heightPercentageToDP('100%'),
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    textArea: {
        height: 220,
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
        marginBottom: 20,
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
        marginLeft: 10,
    },
    footerContainer: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        height: 120,
        marginLeft: -20,
        marginRight: -20,
        marginBottom: -20,
    },
    footerBox: {
        backgroundColor: 'rgba(10,113,199,0.9)',
        elevation: 3,
        height: 5,
        position: 'relative',
        bottom: 0,
    },
    footerBtn: {
        backgroundColor: '#fff',
        width: 140,
        height: 40,
        borderRadius: 10,
    },
    inviteButton: {
        marginTop: 40,
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        height: 45,
        width: '45%',
        alignSelf: 'center',
    },
});
export default InviteTenant;
