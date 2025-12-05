import React, {useEffect,useState} from 'react';
import {Pressable, StyleSheet, View,ImageBackground,TouchableOpacity} from 'react-native';
import {Text, Box, Image, HStack, VStack,Modal,Button} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// icons
import Edit from '@/assets/icon/edit_3.png';
import Delete from '@/assets/icon/trash_2.png';
import {BlurView} from '@react-native-community/blur';
const _cardManager = ({item, del, type}: any): React.JSX.Element => {
    const {navigate} = useNavigation<NativeStackNavigationProp<any>>();
const [modalVisible, setModalVisible] = useState(false);
const [selectId,setSelectId] = useState('')
    useEffect(() => {}, [item]);

    return (
        <VStack space={0} style={styles.cardBody} mb={4}>
            <HStack
                space={2}
                justifyContent={'space-between'}
                pt={3}
                pb={2}
                px={3}>
                <VStack>
                    <Text bold fontSize={'lg'} color={'#250959'}>
                        {item.first_name} {item.last_name}
                    </Text>
                    <Text color={'#250959'} fontSize={'xs'}>
                        {item.email}
                    </Text>
                </VStack>
                <HStack space={3} alignItems={'flex-start'}>
                    <Pressable
                        onPress={() => {
                            type == 'manager'
                                ? navigate('EditManager', item)
                                : navigate('TenantDataEdit', item);
                        }}
                        style={styles.buttonCircle}>
                        <Image source={Edit} alt="icon" style={styles.icon} />
                    </Pressable>
                    <Pressable
                        onPress={() => {
                           setSelectId(item.id),
                           setModalVisible(true)
                        }}
                        style={styles.buttonCircle}>
                        <Image
                            source={Delete}
                            alt="icon"
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                            }}
                        />
                    </Pressable>
                </HStack>
            </HStack>

            <HStack
                justifyContent={'space-between'}
                space={2}
                px={3}
                py={1}
                marginTop={'5'}>
                <VStack space={1} style={styles.contentContainer}>
                    <Text
                        bold
                        style={{
                            fontSize: 13,
                            color: '#B598CB',
                            fontWeight: '700',
                        }}>
                        {type === 'tenant' ? 'Address' : 'Verification'}:
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            color: '#9A46DB',
                            fontWeight: 'bold',
                        }}>
                        {type == 'manager'
                            ? item.is_verified == 1
                                ? 'Verified'
                                : 'Unverified'
                            : item?.address}
                        
                    </Text>
                </VStack>
                <VStack space={1} style={styles.contentContainer}>
                    <Text
                        bold
                        style={{
                            fontSize: 13,
                            color: '#B598CB',
                            fontWeight: '700',
                        }}>
                        Phone:
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            color: '#9A46DB',
                            fontWeight: 'bold',
                        }}>
                        {item.phone}
                    </Text>
                </VStack>
            </HStack>
            <View
                style={{
                    width: '100%',
                    height: 60,
                    overflow: 'hidden',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    // alignItems: 'center',
                    marginTop:10,
                    // backgroundColor:'red'
                }}>
                <View
                    style={{
                        width: '44%',
                        justifyContent: 'center',
                        paddingLeft:10
                        // alignItems: 'center',
                    }}>

                        {
                           type === 'tenant' ?
                            <View style={styles.ActiveButton}>
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                backgroundColor: item.status == '1' ? '#3DB725' : 'red',
                            }}
                        />
                        <Text style={{fontSize:12,fontWeight:'700',color:'#250959',paddingLeft:5}}>{item.status == '1' ? 'ACTIVE' :'INACTIVE'}</Text>
                    </View>: <View style={styles.ActiveButton}>
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                backgroundColor: item.status == 'ACTIVE' ? '#3DB725' : 'red',
                            }}
                        />
                        <Text style={{fontSize:12,fontWeight:'700',color:'#250959',paddingLeft:5}}>{item.status}</Text>
                    </View>
                        }
                  
                </View>
                <View style={{width: '44%',backgroundColor:'#F2F2F2',height:60,borderTopLeftRadius:20,overflow: 'hidden'}}>
                <ImageBackground style={{width: '100%',height:60,justifyContent:'center',alignItems:'center'}} source={require('../../../assets/icon/background.png')} resizeMode='cover'>
                    <Text style={{fontSize:16,color:'#ffffff',fontWeight:'600'}}>{item.custom_role ? item.custom_role  :'Renter'}</Text>
                </ImageBackground>
                </View>
            </View>

            {/* <Box style={styles.CardFooter} mt={2} py={2}>
                    <HStack justifyContent={'space-around'} alignItems={'center'} mb={1}>
                        {type == 'manager' ?
                        <>
                        <Text mb={1} bold>{item.status}</Text>
                        <Text mb={1} bold>{item.type}</Text>
                        </> :
                        <Text mb={1} bold>Renter</Text>
                        }
                    </HStack>
            </Box> */}

             <Modal
                        isOpen={modalVisible}
                        onClose={() => setModalVisible(false)}
                        justifyContent="center"
                        size="lg"
                       >
                        <View style={StyleSheet.absoluteFill}>
                            <BlurView
                                style={StyleSheet.absoluteFill}
                                blurType="light"
                                blurAmount={1}
                            />
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: '#9A46DB40', // Tint color
                                }}
                            />
                        </View>
                        <Modal.Content
                            borderRadius={20}
                            backgroundColor="#ffffff">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    padding: 10,
                                    backgroundColor: '#F2F2F2',
                                    borderBottomLeftRadius: 20,
                                    zIndex: 1,
                                }}>
                                <Image
                                    source={require('../../../assets/icon/close_2.png')}
                                    style={{
                                        width: 15,
                                        height: 15,
                                        tintColor: '#9A46DB',
                                    }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Modal.Header
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text
                                    style={{
                                        color: '#250959',
                                        fontSize: 18,
                                        fontFamily: 'Gilroy-Regular',
                                        fontWeight: '700',
                                    }}>
                                    Delete Account
                                </Text>
                            </Modal.Header>
                            <Modal.Body
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text
                                    my={2}
                                    style={{
                                        textAlign: 'center',
                                        color: '#250959',
                                        fontSize: 14,
                                        fontFamily: 'Gilroy-Regular',
                                    }}>
                                    Are you sure you want to {'\n'} delete
                                    account?
                                </Text>
                            </Modal.Body>
                            <Modal.Footer
                                justifyContent={'space-around'}
                                backgroundColor={'#ffffff'}>
                                <Button
                                    px={8}
                                    py={2}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderWidth: 1,
                                        borderRadius: 32,
                                        borderColor: '#9A46DB',
                                    }}
                                    onPress={() => {
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#9A46DB'}}>Back</Text>
                                </Button>
                                <Button
                                    px={8}
                                    py={2}
                                    style={{
                                        backgroundColor: '#9A46DB',
                                        borderWidth: 1,
                                        borderRadius: 32,
                                        borderColor: '#9A46DB',
                                    }}
                                    onPress={() => {
                                         del(item.id);
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{color: '#ffffff'}}>
                                        Confirm
                                    </Text>
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
        </VStack>
    );
};

const styles = StyleSheet.create({
    cardBody: {
        borderRadius: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#BF56FF',
        backgroundColor: '#F2F2F2',
        overflow: 'hidden',
    },
    icon: {
        height: 18,
        width: 18,
        resizeMode:'contain'
    },
    contentContainer: {
        width: '50%',
    },
    CardFooter: {
        backgroundColor: 'rgba(125,125,125,0.1)',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    cardButtonInvite: {
        backgroundColor: 'rgba(139,183,93,0.8)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonScheduled: {
        backgroundColor: 'rgba(37, 73, 137, 0.7)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    cardButtonExpired: {
        backgroundColor: 'rgba(253, 56, 24, 1)',
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 5,
    },
    buttonCircle: {
        width: 45,
        height: 45,
        borderWidth: 2,
        borderRadius: 35,
        borderColor: '#F3E7FD',
        justifyContent: 'center',
        alignItems: 'center',
    
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
export default _cardManager;
