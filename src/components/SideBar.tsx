import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet,View } from 'react-native';
import { Text, Button, Box, Image, HStack, VStack, Modal, Alert } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { warningTimer } from '@/constant/customHooks';
import { apiDeleteProperties } from '@/apis/property';
// icons


const SideBar = ({ data, hide, header, size }: any): React.JSX.Element => {
    const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [errMsg, setErrMsg] = useState({ msg: '', error: false, show: false });
    const [routes, setRoutes] = useState<any[]>([]);
    const [subData, setSubData] = useState(false);
    const [carry, setCarry] = useState<any>(null);

    const handleDataClose = () => {
        if (subData == true) {
            setRoutes([...data]);
            setSubData(false);
        } else  {
            hide();
        }
    };
    const DeleteProperty = async ()=>{
        const response = await apiDeleteProperties(carry);
        if (response.status) {
            setErrMsg({ msg: response.message, error: false, show: true });
            const timer = await warningTimer(1.5);
            timer && setErrMsg({ msg: '', error: false, show: false });
            timer && navigate('Home');
        } else {
            setErrMsg({ msg: response.message, error: true, show: true });
            const timer = await warningTimer(2);
            timer && setErrMsg({ msg: '', error: false, show: false });
        }
    };
    const handleMainNavigation = (r: any, c: any)=>{
        if (r == null) {
            setSubData(true);
        } else if (r == 'propertyDelete') {
            setModalVisible(!modalVisible);
            setCarry(c);
        } else {
            navigate(r, c);
            hide();
        }
    };
    const handelSubNavigation = (r: any, c: any)=>{
        navigate(r, c);
        setSubData(false);
        hide();
    };
    useEffect(() => {
        setRoutes([...data]);
    }, []);
    return (
        <>
         <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} justifyContent="center"  size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Are You Sure?</Modal.Header>
          <Modal.Body>
            <Text >Do You Want To Delete Property?</Text>
          </Modal.Body>
          <Modal.Footer justifyContent={'space-around'}>
            <Button style={styles.modalButton} onPress={() => { setModalVisible(false);}}>No</Button>
            <Button style={{...styles.modalButton, backgroundColor: 'rgba(225,20,40,0.9)'}} onPress={() => { DeleteProperty(); setModalVisible(false);}}>Yes</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
        <Box style={size == 'fit' ? {...styles.mainContainer, height: heightPercentageToDP('100%')} : styles.mainContainer}>
            {/* <Text bold fontSize={'2xl'} mt={10} ml={3} color={'white'}>{header}</Text> */}
            <VStack mt={5} space={1}>
                {routes.map((item: any, i: number) => {
                    console.log("#################",{item});
                    if (item.subRoutes && subData === true ) {
                        return item.subRoutes.map((route: any, index: number) => {
                        return (
                            <Pressable key={index} onPress={() => { handelSubNavigation(route.route, route.carry); }}>
                            <HStack style={[styles.menu,{   width: '55%',}]} space={3} alignItems={'center'} justifyContent={'flex-start'}>
                                 <View style={{width:30,height:30,justifyContent:'center',alignItems:'center',borderRadius:50,backgroundColor:"#ffffff"}}>
                            <Image source={route?.icon} style={styles.icon} alt="icon" tintColor={"#9A46DB"} />
                            </View>
                            <Text bold fontSize={'sm'} color={'white'}>{route.title}</Text>
                            </HStack>
                            </Pressable>
                                );
                            });
                        }
                        else if (subData === false) {
                            return (
                                <Pressable key={i} onPress={() => { handleMainNavigation(item.route, item.carry);}}>
                                    <HStack style={[styles.menu,{   width: '45%',}]} space={2} alignItems={'center'} justifyContent={'flex-start'}>
                                        <View style={{width:30,height:30,justifyContent:'center',alignItems:'center',borderRadius:50,backgroundColor:"#ffffff"}}>
                                        <Image source={item?.icon} style={styles.icon} alt="icon"  tintColor={"#9A46DB"}/>
                                        </View>
                                        <Text bold fontSize={'sm'} color={'white'}>{item?.title}</Text>
                                    </HStack>
                                </Pressable>
                            );
                        }
                })}
            </VStack>
            <View style={{height:100}}/>
            {errMsg.show &&
        <Alert w="90%" mx={'auto'} status={errMsg.error ? 'danger' : 'success'} my={2}>
          <Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
        </Alert>
      }
            {/* <Pressable onPress={() => { handleDataClose(); }}>
                <HStack mt={6} ml={6}>
                <Box style={styles.btnBox}>
                    <Image source={BackIcon} alt="logo" height={7} width={7} />
                </Box>
                </HStack>
            </Pressable> */}
        </Box>
        </>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        zIndex: 6,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#25095980',
        height: heightPercentageToDP('100%'),
        width: widthPercentageToDP('100%'),
        justifyContent:'flex-end'
    },
    backIcon: {
        height: 50,
        width: 50,
    },
    menu: {
        alignSelf:'center',
     
        height: 50,
        backgroundColor: '#B598CB',
        padding: 10,
        borderRadius: 50,
        marginBottom: 5,
        
    },
    icon: {
        height: 20,
        width: 20,
        resizeMode: 'stretch',
    },
    logo: {
        height: 45,
        width: 150,
        resizeMode: 'stretch',
        position: 'absolute',
        bottom: 40,
        left: 10,
    },
    btnBox: {
        borderWidth: 5,
        borderColor: '#fff',
        borderRadius: 100,
    },
    modalButton: {
        backgroundColor: 'rgba(100,100,130,0.9)',
        height: 45,
        width: 80,
    },
});
export default SideBar;
