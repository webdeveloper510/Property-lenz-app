import React, {useEffect, useState} from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity,
    Platform,
    TextInput,
    Modal,
    FlatList,

} from 'react-native';
import {
    Text,
    Box,
    Button,
    HStack,
    VStack,
    ScrollView,
    // Modal,
} from 'native-base';
import FastImage from 'react-native-fast-image';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {apiSpecificInspection} from '@/apis/property';
import {useRoute} from '@react-navigation/native';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import {setInspection} from '@/state/propertyDataSlice';
// icons
import BackIcon from '@/assets/icon/btnBack.png';
import ImageAttach from '@/assets/icon/imgAtach.png';
import ChatAttach from '@/assets/icon/chatAtach.png';
import {formateStatus} from '@/constant/customHooks';
import cacheService from '@/services/CacheServices';
import moment from 'moment';

import {showLoader, hideLoader} from '@/state/loaderSlice';
const Review = ({navigation}: any): React.JSX.Element => {
    const inspectionData = useAppSelector(state => state.property.inspection);

    const tenantSign = useAppSelector(state => state.property.tenantSign);
    const inspectorSign = useAppSelector(state => state.property.inspectorSign);
    const [amenityData, setAmenityData] = useState<any>(null);
    console.log('🚀 ~ Review ~ amenityData:', tenantSign);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectIndex, setSelectedIndex] = useState(0);
    const [index, setIndex] = useState(0);
    const dispatch = useAppDispatch();
    const route = useRoute();
    const insId: any = route.params;

    const inspectionGet = async () => {
        const response = await apiSpecificInspection(insId);
        console.log("🚀 ~ inspectionGet ~ response:", response)
        if (response.status) {
            dispatch(setInspection(response.result));
            dispatch(hideLoader());
            setIsLoading(false);
        }
    };
    const handleModal = (value: any) => {
        setAmenityData(value);
        setVisible(!visible);
    };
    useEffect(() => {
        dispatch(showLoader());
        inspectionGet();
    }, []);
    useEffect(() => {}, [amenityData]);

    const getStatusBgColor = status => {
        switch (status) {
            case 'PENDING':
                return '#FFEAD6';
            case 'NEW':
                return '#ddf4ff';
            case 'SATISFACTORY':
                return '#d7ffe3';
            case 'DAMAGE':
                return '#fff2cf';
            case 'ATTENTION':
                return '#ffdedb';
            default:
                return '#feead5'; // fallback
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'space-between',
                    marginTop: Platform.OS == 'ios' ? 0 : 30,
                    marginHorizontal: 15,
                    // backgroundColor:'red'
                }}>
                <TouchableOpacity
                    style={{
                        height: 50,
                        width: 50,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50,
                        elevation: 3,
                    }}
                    onPress={() => {
                        navigation.goBack(null);
                    }}>
                    <FastImage
                        source={require('@/assets/icon/back.png')}
                        resizeMode="contain"
                        style={{width: 14, height: 14}}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        paddingRight: 12,
                        // paddingTop: 20,
                    }}>
                    Review Inspection Details
                </Text>
                <View style={{width: 40}}></View>
            </View>

            <Modal transparent visible={visible} animationType="fade">
                {/* Overlay Background */}
                <View style={styles.overlay1}>
                    {/* Popup Container */}
                    <View style={styles.popup1}>
                        {/* Header */}
                        <View style={styles.header1}>
                            <Text style={styles.title1}>
                                {' '}
                                {amenityData?.item?.name}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setVisible(false)}
                                style={styles.closeBtn1}>
                                <FastImage
                                    source={require('../../../../assets/icon/close_2.png')}
                                    style={{width: 12, height: 12}}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Main Image */}
                        <FastImage
                            source={{
                                uri: amenityData?.item?.images[index]?.image,
                            }}
                            style={styles.mainImage}
                        />

                        {/* Thumbnails */}
                        <FlatList
                            horizontal
                            data={amenityData?.item?.images}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, i) => i.toString()}
                            contentContainerStyle={{marginTop: 14}}
                            renderItem={({item, index: i}) => (
                                <TouchableOpacity
                                    onPress={() => setIndex(i)}
                                    style={[
                                        styles.thumbWrapper,
                                        index === i && styles.selectedThumb,
                                    ]}>
                                    <FastImage
                                        source={{uri: item.image}}
                                        style={styles.thumbImage}
                                    />
                                </TouchableOpacity>
                            )}
                        />

                        {/* Pagination Buttons */}
                        <View style={[styles.pagination]}>
                            <TouchableOpacity
                                style={[
                                    styles.pageBtn,
                                    index > 0 && styles.pageBtnActive,
                                ]}
                                onPress={() => {
                                    if (index > 0) setIndex(index - 1);
                                }}>
                                <FastImage
                                    source={require('../../../../assets/icon/back.png')}
                                    style={{
                                        width: 12,
                                        height: 8,
                                       
                                    }}
                                    resizeMode='contain'
                                    tintColor={'#9A46DB'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.pageBtn,
                                    index <
                                        amenityData?.item?.images.length - 1 &&
                                        styles.pageBtnActive,
                                ]}
                                onPress={() => {
                                    if (
                                        index <
                                        amenityData?.item?.images.length - 1
                                    )
                                        setIndex(index + 1);
                                }}>
                                <FastImage
                                    source={require('../../../../assets/icon/right_2.png')}
                                    style={{
                                        width: 11,
                                        height: 7,
                                    }}
                                    resizeMode='contain'
                                    tintColor={'#9A46DB'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
            <ScrollView>
                <View style={styles.mainContainer}>
                    {/* <HStack
                        mb={0}
                        alignItems={'center'}
                        style={{flexWrap: 'wrap'}}>
                        <Pressable
                            onPress={() => {
                                navigation.goBack(null);
                            }}>
                            <Image
                                source={BackIcon}
                                alt="Back"
                                style={styles.backIcon}
                            />
                        </Pressable>
                        <Text
                            bold
                            fontSize={'3xl'}
                            style={{flex: 1}}
                            ml={3}
                            mb={1}
                            color={'my.h4'}>
                            {inspectionData?.property.name}
                        </Text>
                    </HStack> */}
                    <View style={styles.cardView}>
                        <View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    color: '#250959',
                                    paddingBottom: 6,
                                    fontWeight: '600',
                                }}>
                                {inspectionData?.activity.replaceAll('_', ' ')}{' '}
                                Inspection
                            </Text>
                            <Text style={{fontSize: 10, color: '#250959'}}>
                                Oakwood Apartments - Unit 204
                            </Text>
                        </View>
                        <View>
                            <FastImage
                                source={require('../../../../assets/icon/share.png')}
                                style={{
                                    width: 19,
                                    height: 19,
                                    
                                }}
                                resizeMode='contain'
                            />
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 15}}>
                        <View style={{width: '50%'}}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#9A46DB',
                                    fontFamily: 'Gilroy',
                                }}>
                                Inspector
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#250959',
                                    fontFamily: 'Gilroy',
                                }}>
                                {inspectionData?.inspected_by}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#9A46DB',
                                    fontFamily: 'Gilroy',
                                }}>
                                Date
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#250959',
                                    fontFamily: 'Gilroy',
                                }}>
                                {moment(inspectionData?.inspection_date).format(
                                    'MMMM D, YYYY',
                                )}
                            </Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 10}}>
                        <View style={{width: '50%'}}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#9A46DB',
                                    fontFamily: 'Gilroy',
                                }}>
                                Renter
                            </Text>

                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#250959',
                                    fontFamily: 'Gilroy',
                                }}>
                                {(inspectionData?.tenant?.[0]
                                    ?.tenant_first_name || '') +
                                    ' ' +
                                    (inspectionData?.tenant?.[0]
                                        ?.tenant_last_name || '')}
                            </Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#9A46DB',
                                    fontFamily: 'Gilroy',
                                }}>
                                Type
                            </Text>

                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#250959',
                                    fontFamily: 'Gilroy',
                                    flexShrink: 1,
                                }}>
                                {inspectionData?.activity.replaceAll('_', ' ')}{' '}
                            </Text>
                        </View>
                    </View>
                    <VStack space={0}>
                        {inspectionData?.areas.map((area: any, i: number) => {
                            return (
                                area.is_enable == 1 && (
                                    <Box style={styles.mainBox} key={i}>
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: '#B598CB4D',
                                            }}
                                        />
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: 15,
                                            }}
                                            onPress={() => setSelectedIndex(i)}>
                                            <Text
                                                fontSize={'lg'}
                                                color={'my.h'}
                                                mb={1}>
                                                {area.sub_title == ''
                                                    ? area.title
                                                    : area.sub_title}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    setSelectedIndex(i)
                                                }>
                                                <FastImage
                                                    source={require('../../../../assets/icon/drop_2.png')}
                                                    style={{
                                                        width: 9,
                                                        height: 9,
                                                        
                                                    }}
                                                    resizeMode='contain'
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                        <View
                                            style={{
                                                backgroundColor:
                                                    selectIndex === i
                                                        ? '#EAE7ED'
                                                        : '#F2F2F2',
                                                borderRadius: 20,
                                                padding: 10,
                                            }}>
                                            {selectIndex === i &&
                                                area.items.map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => {
                                                        return (
                                                            item.is_enable ==
                                                                1 && (
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
                                                                        }}>
                                                                        <Text
                                                                            style={{
                                                                                // flex: 1,
                                                                                fontSize: 13,
                                                                                color: '#250959',
                                                                                fontWeight:
                                                                                    '700',
                                                                            }}>
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </Text>
                                                                        <View
                                                                            style={{
                                                                                width: 43,
                                                                                height: 23,
                                                                                borderRadius: 10,
                                                                                backgroundColor:
                                                                                    getStatusBgColor(
                                                                                        item.status,
                                                                                    ),
                                                                                justifyContent:
                                                                                    'center',
                                                                                alignItems:
                                                                                    'center',
                                                                            }}>
                                                                            <Text
                                                                                style={
                                                                                    item.status ==
                                                                                    'PENDING'
                                                                                        ? styles.def
                                                                                        : item.status ==
                                                                                          'NEW'
                                                                                        ? styles.n
                                                                                        : item.status ==
                                                                                          'SATISFACTORY'
                                                                                        ? styles.s
                                                                                        : item.status ==
                                                                                          'DAMAGE'
                                                                                        ? styles.d
                                                                                        : item.status ==
                                                                                          'ATTENTION'
                                                                                        ? styles.a
                                                                                        : styles.y
                                                                                }>
                                                                                {' '}
                                                                                {formateStatus(
                                                                                    item.status,
                                                                                )}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <View
                                                                        style={
                                                                            styles.row
                                                                        }>
                                                                        {/* 1️⃣ First Thumbnail With Overlay Eye Icon */}

                                                                        {item
                                                                            ?.images
                                                                            .length >
                                                                            0 && (
                                                                            <TouchableOpacity
                                                                                style={
                                                                                    styles.thumb
                                                                                }
                                                                                onPress={() =>
                                                                                    setVisible(
                                                                                        true,
                                                                                    )
                                                                                }>
                                                                                <FastImage
                                                                                    source={{
                                                                                        uri: item
                                                                                            .images[0]
                                                                                            ?.image,
                                                                                    }}
                                                                                    style={
                                                                                        styles.image
                                                                                    }
                                                                                />
                                                                                <TouchableOpacity
                                                                                    style={
                                                                                        styles.overlay
                                                                                    }
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
                                                                                    <FastImage
                                                                                        source={require('../../../../assets/icon/eye_v.png')}
                                                                                        style={{
                                                                                            width: 24,
                                                                                            height: 19,
                                                                                        }}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                </TouchableOpacity>
                                                                            </TouchableOpacity>
                                                                        )}

                                                                        {/* 2️⃣ Normal Thumbnails */}
                                                                        {item?.images
                                                                            .slice(
                                                                                0,
                                                                                2,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    img,
                                                                                    index,
                                                                                ) => (
                                                                                    <TouchableOpacity
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        style={
                                                                                            styles.thumb
                                                                                        }>
                                                                                        <FastImage
                                                                                            source={{
                                                                                                uri: img.image,
                                                                                            }}
                                                                                            style={
                                                                                                styles.image
                                                                                            }
                                                                                        />
                                                                                    </TouchableOpacity>
                                                                                ),
                                                                            )}

                                                                        {/* 3️⃣ Count Box */}
                                                                        {item
                                                                            .images
                                                                            .length >
                                                                            0 && (
                                                                            <View
                                                                                style={
                                                                                    styles.countBox
                                                                                }>
                                                                                <Text
                                                                                    style={
                                                                                        styles.countText
                                                                                    }>
                                                                                    +
                                                                                    {
                                                                                        item
                                                                                            ?.images
                                                                                            .length
                                                                                    }
                                                                                </Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    <View
                                                                        style={{
                                                                            width: '100%',
                                                                            height: 1,
                                                                            backgroundColor:
                                                                                '#B598CB4D',
                                                                        }}
                                                                    />

                                                                    {item?.comments && (
                                                                        <View
                                                                            style={
                                                                                styles.container21
                                                                            }>
                                                                            <Text
                                                                                style={
                                                                                    styles.label
                                                                                }>
                                                                                Comment
                                                                            </Text>

                                                                            <TextInput
                                                                                placeholder="Type here..."
                                                                                placeholderTextColor="#C2C0CC"
                                                                                multiline
                                                                                style={
                                                                                    styles.input
                                                                                }
                                                                                value={
                                                                                    item.comments
                                                                                }
                                                                                editable={
                                                                                    false
                                                                                }
                                                                            />
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )
                                                        );
                                                    },
                                                )}
                                        </View>
                                    </Box>
                                )
                            );
                        })}
                    </VStack>
                    <View
                        style={{
                            width: '100%',
                            height: 1,
                            backgroundColor: '#B598CB4D',
                            alignSelf: 'center',
                        }}
                    />
                    <View
                        style={{
                            width: '100%',
                            borderWidth: 1,
                            borderColor: '#BF56FF',
                            borderRadius: 20,
                            padding: 15,
                            marginTop: 25,
                        }}>
                        <Text style={{color: '#250959', fontSize: 13}}>
                            Signatures
                        </Text>
                        <View
                            style={{
                                width: '100%',
                                alignSelf: 'center',
                                backgroundColor: '#EAE7ED',
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: '#EAE7ED',
                                padding: 15,
                                marginVertical: 10,
                            }}>
                            <VStack space={3} mt={3}>
                                <Text bold fontSize={13} color={'#9A46DB'}>
                                    Renter Signature
                                </Text>
                                <Text bold fontSize={13} color={'#250959'}>
                                    Name: {inspectionData?.tenant[0]?.tenant_first_name}
                                </Text>
                                <View
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 10,
                                    }}>
                                    <Text
                                        style={{
                                            color: '#250959',
                                            fontSize: 10,
                                            fontWeight: '700',
                                            padding: 15,
                                        }}>
                                        Signature:
                                    </Text>
                                    <FastImage
                                        source={{
                                            uri: inspectionData?.tenant_sign,
                                        }}
                                        
                                    
                                        style={{
                                            width: 200,
                                            height: 200,
                                        }}
                                        resizeMode='contain'
                                    />
                                </View>
                            </VStack>
                            <Text style={{fontSize:10,color:'#250959',fontWeight:'400'}}>Signed on: {moment.utc(inspectionData?.updated_at).local().format('MMMM D, YYYY [at] h:mm a')}</Text>

                        </View>

                        <View
                            style={{
                                width: '100%',
                                alignSelf: 'center',
                                backgroundColor: '#EAE7ED',
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: '#EAE7ED',
                                padding: 15,
                                marginVertical: 10,
                            }}>
                            <VStack space={3} mt={3}>
                                <Text bold fontSize={13} color={'#9A46DB'}>
                                    Inspector Signature
                                </Text>
                                <Text bold fontSize={13} color={'#250959'}>
                                    Name: {inspectionData?.inspected_by}
                                </Text>
                                <View
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 10,
                                    }}>
                                    <Text
                                        style={{
                                            color: '#250959',
                                            fontSize: 10,
                                            fontWeight: '700',
                                            padding: 15,
                                        }}>
                                        Signature:
                                    </Text>
                                    <FastImage
                                        source={{
                                            uri: inspectionData?.inspector_sign
                                        }}
                                        style={{
                                            width: 200,
                                            height: 200,
                                        }}
                                        resizeMode='contain'
                                    />
                                </View>
                            </VStack>
                            <Text style={{fontSize:10,color:'#250959',fontWeight:'400'}}>Signed on: {moment.utc(inspectionData?.signed_at).local().format('MMMM D, YYYY [at] h:mm a')}</Text>
                        </View>

                       
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        backgroundColor: '#F2F2F2',
        minHeight: '100%',
    },
    backIcon: {
        height: 40,
        width: 40,
    },
    mainBox: {
        // borderTopColor: 'transparent',
        // borderLeftColor: 'transparent',
        // borderRightColor: 'transparent',
        paddingTop: 10,
        paddingBottom: 15,
    },
    AmenityContainer: {
        // borderWidth: 1,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 8,
    },
    badge: {
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        width: 15,
        height: 15,
    },
    def: {
        color: 'rgba(150,150,150,1.0)',
    },
    n: {
        color: '#34b4eb',
    },
    s: {
        color: '#22B14B',
    },
    d: {
        color: '#EEBD34',
    },
    a: {
        color: '#CD3223',
    },
    y: {
        color: '#E78922',
    },
    cardView: {
        width: '100%',
        alignSelf: 'center',
        height: 81,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BF56FF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 20,
    },
    thumb: {
        width: 56,
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#ddd',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(128, 0, 255, 0.4)', // purple transparent
        justifyContent: 'center',
        alignItems: 'center',
    },
    countBox: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#EFEAF5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    countText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9B4DFF',
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#9B4DFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container21: {
        width: '100%',
        minHeight: 120,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginTop: 20,
    },

    label: {
        fontSize: 13,
        color: '#4A2A8A', // dark purple like screenshot
        marginBottom: 4,
        fontWeight: '500',
    },

    input: {
        fontSize: 16,
        color: '#666',
        padding: 0, // remove default padding
        textAlignVertical: 'top',
    },
    overlay1: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    popup1: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 28,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },

    header1: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    title1: {
        fontSize: 20,
        fontWeight: '700',
        color: '#250959',
        textAlign: 'center',
    },

    closeBtn1: {
        position: 'absolute',
        right: -14,
        top: -19,
        backgroundColor: '#F4E9FF',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#EAEAEA',
        marginVertical: 20,
    },

    mainImage: {
        width: '100%',
        height: 260,
        borderRadius: 18,
    },
    thumbWrapper: {
        marginRight: 10,
        borderRadius: 16,
        // padding: 4,
    },

    selectedThumb: {
        backgroundColor: '#8C3AFF33',
        borderWidth: 2,
        borderColor: '#250959',
    },
    thumbImage: {
        width: 60,
        height: 60,
        borderRadius: 14,
    },
    pagination: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },

    pageBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1EEF4',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#E5DCED',
        borderWidth: 1,
    },

    pageBtnActive: {
        borderColor: '#8C3AFF',
        borderWidth: 2,
        backgroundColor: 'white',
    },

    pageText: {
        fontSize: 18,
        color: '#8C3AFF',
    },

    pageTextActive: {
        fontWeight: '700',
    },
});

export default Review;
