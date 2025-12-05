import React, {useEffect, useState} from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import {
    Text,
    Box,
    HStack,
    VStack,
    ScrollView,
    Modal,
    Button,
    Alert,
} from 'native-base';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {setInspection} from '@/state/propertyDataSlice';
import {useRoute} from '@react-navigation/native';
import {apiSpecificInspection} from '@/apis/property';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import {setInspectorSign} from '@/state/propertyDataSlice';
import {formateStatus, warningTimer} from '@/constant/customHooks';
// icons
import BackIcon from '@/assets/icon/btnBack.png';
import ImageAttach from '@/assets/icon/imgAtach.png';
import ChatAttach from '@/assets/icon/chatAtach.png';
import BackButton from '@/components/BackButton';

const CompletedView = ({navigation}: any): React.JSX.Element => {
    const inspectionData = useAppSelector(state => state.property.inspection);
    console.log('🚀 ~ CompletedView ~ inspectionData:', inspectionData);
    const userData = useAppSelector(state => state.auth.userData);
    const inspectorSign = useAppSelector(state => state.property.inspectorSign);
    const dispatch = useAppDispatch();
    const [amenityData, setAmenityData] = useState<any>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState({msg: '', error: false, show: false});
    const [selectedItem, setSelectedItem] = useState<any>('');

    const staticData = {
        name: 'Swimming Pool',
        comments:
            'This is a beautiful swimming pool located on the rooftop. Clean water and luxury ambiance.',
        images: [
            {image: 'https://picsum.photos/400/300?random=1'},
            {image: 'https://picsum.photos/400/300?random=2'},
            {image: 'https://picsum.photos/400/300?random=3'},
            {image: 'https://picsum.photos/400/300?random=4'},
        ],
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const amenityData1 = staticData;
    const images = amenityData1.images;
    // const images = amenityData?.item?.images || [];
    const route = useRoute();
    const insId: any = route.params;

    const getInsDetails = async () => {
        setLoading(true);
        const response = await apiSpecificInspection(insId);
        if (response.status) {
            dispatch(setInspection(response.result));
            setLoading(false);
        } else {
            setLoading(false);
        }
    };
    const SignInspection = async () => {
        setErrMsg({msg: 'Successfully Done', error: false, show: true});
        const timer = await warningTimer(2);
        timer && navigation.goBack(null);
        cleanup();
    };

    const handleModal = (value: any) => {
        setAmenityData(value);
        setModalVisible(!modalVisible);
    };
    const cleanup = () => {
        dispatch(setInspectorSign(null));
    };

    useEffect(() => {
        getInsDetails();
    }, []);
    const getStatusColor = (status: any) => {
        switch (status) {
            case 'S': // SATISFACTORY
                return {backgroundColor: '#E6F9E8', color: '#1E8F43'};
            case 'D': // DAMAGE
                return {backgroundColor: '#FFE6E6', color: '#E53935'};
            case 'A': // ATTENTION
                return {backgroundColor: '#FFF3CD', color: '#C69500'};
            default:
                return {backgroundColor: '#EFEAFF', color: '#6B4EFF'};
        }
    };
    console.log('############=====>', selectedItem);
    return (
        <ScrollView>
            {/* <Modal isOpen={modalVisible} onClose={setModalVisible} size={'xl'}>
                <Modal.Content maxH="500">
                    <Modal.CloseButton />
                    <Modal.Header>
                        <VStack>
                            <Text bold fontSize={'xl'} color={'my.h'}>
                                {amenityData?.area}
                            </Text>
                            <Text bold fontSize={'sm'} color={'my.h2'}>
                                {amenityData?.item?.name}
                            </Text>
                        </VStack>
                    </Modal.Header>
                    <Modal.Body>
                        <ScrollView py={2}>
                            {amenityData?.item?.images.length > 0 && (
                                <VStack mb={1} space={1}>
                                    {amenityData?.item?.images.map(
                                        (
                                            image: {
                                                image: string;
                                                created_at: any;
                                            },
                                            i: number,
                                        ) => {
                                            return (
                                                <Pressable
                                                    key={i}
                                                    onPress={() => {
                                                        navigation.navigate(
                                                            'ImageZoom',
                                                            image?.image,
                                                        );
                                                        setModalVisible(false);
                                                    }}>
                                                    <Image
                                                        mx={'auto'}
                                                        source={{
                                                            uri: image?.image,
                                                        }}
                                                        style={{
                                                            width: 200,
                                                            resizeMode:
                                                                'stretch',
                                                            height: 200,
                                                        }}
                                                        alt="image"
                                                    />
                                                </Pressable>
                                            );
                                        },
                                    )}
                                </VStack>
                            )}
                            {amenityData?.item?.comments != null &&
                                amenityData?.item?.comments != '' && (
                                    <VStack>
                                        <Text
                                            bold
                                            fontSize={'md'}
                                            color={'my.h3'}>
                                            Comment
                                        </Text>
                                        <Text
                                            mx={1}
                                            mt={1}
                                            fontSize={'sm'}
                                            color={'black'}>
                                            {amenityData?.item?.comments}
                                        </Text>
                                    </VStack>
                                )}
                        </ScrollView>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button
                                onPress={() => {
                                    setModalVisible(false);
                                }}
                                px={5}
                                style={{
                                    backgroundColor: 'rgba(10,113,189,0.9)',
                                }}>
                                Close
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal> */}
            <Box style={styles.mainContainer}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        justifyContent: 'space-between',
                    }}>
                    <BackButton navigation={navigation} />
                    <Text
                        style={{
                            fontSize: 18,
                            color: '#250959',
                            fontWeight: '700',
                        }}>
                        Inspection Detail
                    </Text>
                    <View></View>
                </View>

                <View style={styles.shareView}>
                    <View>
                        <Text
                            style={{
                                fontSize: 18,
                                color: '#250959',
                                fontWeight: '600',
                            }}>
                            Move-Out Inspection
                        </Text>
                        <Text>Oakwood Apartments - Unit 204</Text>
                    </View>
                    <View>
                        <Image
                            source={require('../../../assets/icon/share_2.png')}
                            style={{width: 19, height: 19}}
                            resizeMode="contain"
                        />
                    </View>
                </View>
                <View style={{height: 20}} />
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Inspector</Text>
                        <Text style={styles.value}>Sarah Johnson</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>October 12, 2025</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Renter</Text>
                        <Text style={styles.value}>Mike Davis</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Type</Text>
                        <Text style={styles.value}>Move-Out Inspection</Text>
                    </View>
                </View>

                {/* <SafeAreaView>
            <HStack mb={5} height={50} alignItems={'center'}>
              <Pressable onPress={() => { navigation.goBack(null); cleanup(); }}>
                <Image source={BackIcon} alt="Back" style={styles.backIcon} />
              </Pressable>
              <Text bold fontSize={'2xl'} style={{ maxWidth: '80%', flexWrap: 'nowrap', minHeight: 45 }} ml={3} mb={1} color={'my.h4'} >{inspectionData?.property.name}12</Text>
            </HStack>
          </SafeAreaView> */}
                <View
                    style={{
                        width: '100%',
                        height: 2,
                        backgroundColor: '#B598CB4D',
                    }}
                />
                <VStack space={2}>
                    {inspectionData?.areas.map((area, i) => {
                        const title =
                            area.sub_title == '' ? area.title : area.sub_title;
                        return (
                            area.is_enable == 1 && (
                                <Box style={styles.mainBox} key={i}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: '#250959',
                                                fontWeight: '600',
                                            }}>
                                            {area.sub_title == ''
                                                ? area.title
                                                : area.sub_title}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setSelectedItem(
                                                    selectedItem === title
                                                        ? null
                                                        : title,
                                                )
                                            }>
                                            <Image
                                                source={require('../../../assets/icon/drop_2.png')}
                                                style={{width: 9, height: 9}}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View
                                        style={[
                                            styles.listView,
                                            {
                                                backgroundColor:
                                                    selectedItem == null
                                                        ? '#FFFFFF'
                                                        : selectedItem === title
                                                        ? '#EAE7ED'
                                                        : '#FFFFFF',

                                                marginTop:
                                                    selectedItem === title
                                                        ? 20
                                                        : 0,
                                            },
                                        ]}>
                                        {selectedItem === title &&
                                            area.items.map((item, index) => {
                                                if (item.is_enable != 1)
                                                    return null;
                                                return (
                                                    item.is_enable == 1 && (
                                                        <View
                                                            key={index}
                                                            style={
                                                                styles.AmenityContainer
                                                            }>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'row',
                                                                    justifyContent:
                                                                        'space-between',
                                                                    marginBottom: 12,
                                                                }}>
                                                                <Text
                                                                    style={
                                                                        styles.itemTitle
                                                                    }>
                                                                    {item.name}
                                                                </Text>
                                                                <View
                                                                    style={[
                                                                        styles.statusBadge,
                                                                        getStatusColor(
                                                                            'S',
                                                                        ),
                                                                    ]}>
                                                                    <Text
                                                                        style={
                                                                            styles.statusText
                                                                        }>
                                                                        S
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {item.images
                                                                ?.length >
                                                                0 && (
                                                                <View
                                                                    style={
                                                                        styles.imageRow
                                                                    }>
                                                                    {item.images
                                                                        .slice(
                                                                            0,
                                                                            3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                img,
                                                                                i,
                                                                            ) => (
                                                                                <TouchableOpacity
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    onPress={() =>
                                                                                        handleModal(
                                                                                            {
                                                                                                area:
                                                                                                    area.sub_title ==
                                                                                                    ''
                                                                                                        ? area.title
                                                                                                        : area.sub_title,
                                                                                                item: item,
                                                                                            },
                                                                                        )
                                                                                    }>
                                                                                    <Image
                                                                                        source={
                                                                                            ImageAttach
                                                                                        }
                                                                                        style={
                                                                                            styles.itemImage
                                                                                        }
                                                                                        resizeMode="cover"
                                                                                    />
                                                                                </TouchableOpacity>
                                                                            ),
                                                                        )}

                                                                    {item.images
                                                                        .length >
                                                                        3 && (
                                                                        <View
                                                                            style={
                                                                                styles.moreBadge
                                                                            }>
                                                                            <Text
                                                                                style={
                                                                                    styles.moreText
                                                                                }>
                                                                                +
                                                                                {item
                                                                                    .images
                                                                                    .length -
                                                                                    3}
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}

                                                            {item.comments ? (
                                                                <View
                                                                    style={
                                                                        styles.commentBox
                                                                    }>
                                                                    <Text
                                                                        style={
                                                                            styles.commentLabel
                                                                        }>
                                                                        Comment
                                                                    </Text>
                                                                    <Text
                                                                        style={
                                                                            styles.commentText
                                                                        }>
                                                                        {
                                                                            item.comments
                                                                        }
                                                                    </Text>
                                                                </View>
                                                            ) : null}

                                                            {/* <HStack
                                                                space={4}
                                                                justifyContent={
                                                                    'space-between'
                                                                }>
                                                                <HStack
                                                                    space={2}
                                                                    style={{
                                                                        width: 60,
                                                                    }}
                                                                    justifyContent={
                                                                        'space-around'
                                                                    }
                                                                    alignItems={
                                                                        'center'
                                                                    }>
                                                                   
                                                                    {item.images
                                                                        .length >
                                                                        0 && (
                                                                        <VStack>
                                                                            <Box
                                                                                bgColor={
                                                                                    'red.200'
                                                                                }
                                                                                zIndex={
                                                                                    1
                                                                                }
                                                                                mb={
                                                                                    -3
                                                                                }
                                                                                ml={
                                                                                    -3
                                                                                }
                                                                                style={
                                                                                    styles.badge
                                                                                }>
                                                                                <Text
                                                                                    bold
                                                                                    style={{
                                                                                        fontSize: 9,
                                                                                        color: 'red',
                                                                                        textAlign:
                                                                                            'center',
                                                                                        lineHeight: 10,
                                                                                    }}>
                                                                                    {
                                                                                        item
                                                                                            .images
                                                                                            .length
                                                                                    }
                                                                                </Text>
                                                                            </Box>
                                                                            <TouchableOpacity
                                                                                onPress={() => {
                                                                                    handleModal(
                                                                                        {
                                                                                            area:
                                                                                                area.sub_title ==
                                                                                                ''
                                                                                                    ? area.title
                                                                                                    : area.sub_title,
                                                                                            item: item,
                                                                                        },
                                                                                    );
                                                                                }}>
                                                                                <Image
                                                                                    source={
                                                                                        ImageAttach
                                                                                    }
                                                                                    style={{
                                                                                        height: 20,
                                                                                        width: 20,
                                                                                        resizeMode:
                                                                                            'stretch',
                                                                                    }}
                                                                                    alt="img"
                                                                                />
                                                                            </TouchableOpacity>
                                                                        </VStack>
                                                                    )}
                                                                </HStack>
                                                            </HStack> */}
                                                        </View>
                                                    )
                                                );
                                            })}
                                    </View>
                                </Box>
                            )
                        );
                    })}
                </VStack>

                {/* {inspectionData?.final_comments != null &&
                    inspectionData?.final_comments != '' && (
                        <VStack space={1} mt={3}>
                            <Text bold fontSize={'md'} color={'my.h3'}>
                                Final Comment:
                            </Text>
                            <Text bold fontSize={'sm'} style={styles.comment}>
                                {inspectionData?.final_comments}
                            </Text>
                        </VStack>
                    )}
                {inspectionData?.optional_comments != null &&
                    inspectionData?.optional_comments != '' && (
                        <VStack space={1} mt={4}>
                            <Text bold fontSize={'md'} color={'my.h3'}>
                                Optional Comment:
                            </Text>
                            <Text bold fontSize={'sm'} style={styles.comment}>
                                {inspectionData?.optional_comments}
                            </Text>
                        </VStack>
                    )} */}
                <View
                    style={{
                        width: '100%',
                        borderWidth: 1,
                        borderColor: '#BF56FF',
                        borderRadius: 20,
                    }}>
                    {inspectionData?.tenant_sign != null && (
                        <View
                            style={{
                                width: '90%',
                                backgroundColor: '#EAE7ED',
                                borderRadius: 20,
                                alignSelf: 'center',
                                marginVertical: 12,
                                padding: 15,
                            }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: '#9A46DB',
                                    fontWeight: '600',
                                }}>
                                Renter Signature
                            </Text>
                            <Text style={{color: '#250959', fontSize: 13}}>
                                Name :{' '}
                                {inspectionData?.tenant[0]?.tenant_first_name}
                            </Text>
                            <View
                                style={{
                                    backgroundColor: '#ffffff',
                                    margin: 10,
                                    borderRadius: 20,
                                    padding: 10,
                                }}>
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '700',
                                    }}>
                                    Signature:
                                </Text>

                                <Image
                                    source={{uri: inspectionData?.tenant_sign}}
                                    style={{
                                        width: 200,
                                        resizeMode: 'stretch',
                                        height: 200,
                                    }}
                                />
                            </View>
                        </View>
                        // <VStack space={3} mt={3}>
                        //     <Text bold fontSize={'md'} color={'my.h3'}>
                        //         Renter Sign:
                        //     </Text>
                        //     <Image
                        //         source={{uri: inspectionData?.tenant_sign}}
                        //         mx={'auto'}
                        //         alt="Tenant Sign"
                        //         style={{
                        //             width: 200,
                        //             resizeMode: 'stretch',
                        //             height: 200,
                        //         }}
                        //     />
                        // </VStack>
                    )}
                    {inspectionData?.is_signed === 0 &&
                    inspectorSign === null &&
                    userData?.type !== 'TENANT' ? (
                        <Button
                            style={styles.button}
                            mb={3}
                            mt={5}
                            onPress={() =>
                                navigation.navigate('InspectorSign', insId)
                            }>
                            Sign and Finalize
                        </Button>
                    ) : (
                        inspectionData?.is_signed === 0 &&
                        userData?.type !== 'TENANT' && (
                            <View
                                style={{
                                    width: '90%',
                                    backgroundColor: '#EAE7ED',
                                    borderRadius: 20,
                                    alignSelf: 'center',
                                    marginVertical: 12,
                                    padding: 15,
                                }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#9A46DB',
                                        fontWeight: '600',
                                    }}>
                                    Inspector Sign:
                                </Text>
                                <Text style={{color: '#250959', fontSize: 13}}>
                                    Name : {inspectionData?.created_by_name}
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: '#ffffff',
                                        margin: 10,
                                        borderRadius: 20,
                                        padding: 10,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            color: '#250959',
                                            fontWeight: '700',
                                        }}>
                                        Signature:
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate(
                                                'InspectorSign',
                                                insId,
                                            )
                                        }>
                                        <Image
                                            source={{
                                                uri: `data:image/png;base64,${inspectorSign?.data}`,
                                            }}
                                            alt="Inspector Sign"
                                            style={{
                                                width: 200,
                                                resizeMode: 'stretch',
                                                height: 200,
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    )}
                    {errMsg.show && (
                        <Alert
                            w="100%"
                            status={errMsg.error ? 'danger' : 'success'}
                            mt={4}>
                            <Text
                                fontSize="md"
                                color={errMsg.error ? 'red.500' : 'green.500'}>
                                {errMsg.msg}
                            </Text>
                        </Alert>
                    )}
                    {inspectionData?.is_signed == 1 ? (
                        <View
                            style={{
                                width: '90%',
                                backgroundColor: '#EAE7ED',
                                borderRadius: 20,
                                alignSelf: 'center',
                                marginVertical: 12,
                                padding: 15,
                            }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: '#9A46DB',
                                    fontWeight: '600',
                                }}>
                                Inspector Signature
                            </Text>
                            <Text style={{color: '#250959', fontSize: 13}}>
                                Name : {inspectionData?.created_by_name}
                            </Text>
                            <View
                                style={{
                                    backgroundColor: '#ffffff',
                                    margin: 10,
                                    borderRadius: 20,
                                    padding: 10,
                                }}>
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#250959',
                                        fontWeight: '700',
                                    }}>
                                    Signature:
                                </Text>
                                <Image
                                    source={{
                                        uri: inspectionData?.inspector_sign,
                                    }}
                                    mx={'auto'}
                                    alt="Inspector Sign"
                                    style={{
                                        width: 200,
                                        resizeMode: 'stretch',
                                        height: 200,
                                    }}
                                />
                            </View>
                        </View>
                    ) : (
                        inspectorSign != null && (
                            <Button
                                style={styles.button}
                                size={'lg'}
                                mb={3}
                                mt={5}
                                onPress={() => {
                                    SignInspection();
                                }}>
                                Save
                            </Button>
                        )
                    )}
                </View>
            </Box>
            <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(82,60,121,0.85)',
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                    }}>
                    <View style={styles.modalCard}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                {amenityData?.item?.name} Preview
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeIcon}>
                                <Image
                                    source={require('../../../assets/icon/close_2.png')}
                                    style={{width: 12, height: 12}}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                width: '100%',
                                height: 2,
                                backgroundColor: '#D9D9D9',
                                marginTop: 20,
                            }}
                        />
                        {/* Main Image */}
                        {images.length > 0 && (
                            <Image
                                source={{uri: images[currentIndex]?.image}}
                                style={styles.mainImage}
                            />
                        )}

                        {/* Comment Box */}
                        {amenityData?.item?.comments ? (
                            <View style={styles.commentBox1}>
                                <Text style={styles.commentLabel1}>
                                    Comments
                                </Text>
                                <Text style={styles.commentText1}>
                                    {amenityData?.item?.comments}
                                </Text>
                            </View>
                        ) : null}

                        {/* Thumbnails */}
                        {images.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={{marginTop: 12}}>
                                {images.map((img: string, idx: number) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setCurrentIndex(idx)}>
                                        <Image
                                            source={{uri: img?.image}}
                                            style={[
                                                styles.thumb,
                                                currentIndex === idx && {
                                                    borderColor: '#7C4DFF',
                                                    borderWidth: 2,
                                                },
                                            ]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <View style={styles.navRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.navBtn,
                                        {
                                            borderColor:
                                                currentIndex === 0
                                                    ? '#D0C5E6'
                                                    : '#9A46DB',
                                        },
                                    ]}
                                    disabled={currentIndex === 0}
                                    onPress={() =>
                                        setCurrentIndex(currentIndex - 1)
                                    }>
                                     <Image
                                        source={require('../../../assets/icon/back.png')}
                                        style={{width: 10, height: 10}}
                                        tintColor={'#9A46DB'}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.navBtn,
                                        {
                                            borderColor:
                                                currentIndex ===
                                                images.length - 1
                                                    ? '#D0C5E6'
                                                    : '#9A46DB', // 🔥 ACTIVE COLOR
                                        },
                                    ]}
                                    disabled={
                                        currentIndex === images.length - 1
                                    }
                                    onPress={() =>
                                        setCurrentIndex(currentIndex + 1)
                                    }>
                                    <Image
                                        source={require('../../../assets/icon/right_2.png')}
                                        style={{width: 10, height: 10}}
                                        tintColor={'#9A46DB'}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
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
        resizeMode: 'stretch',
    },
    mainBox: {
        borderWidth: 1,
        borderTopColor: 'transparent',
        borderBottomColor: '#B598CB4D',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        paddingTop: 10,
        justifyContent: 'center',
        // paddingBottom: 15,
    },
    AmenityContainer: {
        borderRadius: 10,
        backgroundColor: '#ffffff',
        padding: 20,
        marginVertical: 10,
    },
    listView: {
        borderRadius: 20,
        padding: 15,
    },
    badge: {
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        width: 15,
        height: 15,
    },
    comment: {
        flex: 1,
        flexWrap: 'wrap',
    },
    def: {
        color: 'rgba(150,150,150,1.0)',
    },
    n: {
        color: 'rgba(0, 208, 255, 1)',
    },
    s: {
        color: 'rgba(138, 199, 62, 1)',
    },
    d: {
        color: 'rgba(253, 56, 24, 1)',
    },
    a: {
        color: 'rgba(254,95,21,1.0)',
    },
    y: {
        color: '#ffcc5e',
    },
    button: {
        height: 45,
        width: '60%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 113, 188,0.9)',
    },
    shareView: {
        flexDirection: 'row',
        width: '100%',
        borderWidth: 1,
        borderColor: '#BF56FF',
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        padding: 20,
        justifyContent: 'space-between',
        backgroundColor:'#ffffff'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    column: {
        width: '48%',
    },
    label: {
        fontSize: 10,
        color: '#9A46DB', // Light purple
        marginBottom: 4,
        fontWeight: '500',
        fontFamily: 'Gilroy',
    },
    value: {
        fontSize: 16,
        color: '#250959', // Dark purple text
        fontWeight: '600',
        fontFamily: 'Gilroy',
    },
    statusBadge: {
        alignItems: 'center',
        borderRadius: 20,
        width: 43,
        height: 23,
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    itemTitle: {
        fontSize: 13,
        color: '#250959',
        fontWeight: '700',
    },
    imageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemImage: {
        width: 58,
        height: 58,
        borderRadius: 8,
        marginRight: 6,
    },
    moreBadge: {
        width: 58,
        height: 58,
        borderRadius: 8,
        backgroundColor: '#EFEAFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#7D5CF6',
    },
    commentBox: {
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        padding: 10,
        elevation: 1,
    },
    commentLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#250959',
        marginBottom: 6,
    },
    commentText: {
        fontSize: 10,
        color: '#250959',
        lineHeight: 17,
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },

    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#250959',
    },
    closeIcon: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(189, 173, 216, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: -20,
        top: -21,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
    },
    mainImage: {
        width: '100%',
        height: 230,
        borderRadius: 14,
        marginTop: 18,
    },
    commentBox1: {
        marginTop: 18,
        backgroundColor: '#F2F2F2',
        padding: 14,
        borderRadius: 10,
    },
    commentLabel1: {
        fontSize: 16,
        fontWeight: '700',
        color: '#250959',
        marginBottom: 4,
    },
    commentText1: {
        fontSize: 12,
        color: '#6D6A7C',
    },
    thumb: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 8,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 18,
    },
    navBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    navText: {
        fontSize: 20,
        color: '#7C4DFF',
        fontWeight: '800',
    },
});

export default CompletedView;
