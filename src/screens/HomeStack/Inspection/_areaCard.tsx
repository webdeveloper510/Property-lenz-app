import React, {useState, useEffect, useMemo} from 'react';
import {
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    Modal,
    FlatList,
    Image,
} from 'react-native';
import {Text, Box, Badge, HStack, VStack, TextArea} from 'native-base';
import {apiUpdateStatus} from '@/apis/property';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// icon
import DisableIcon from '@/assets/icon/disable.png';

import FastImage from 'react-native-fast-image';
const _areaCard = React.memo(
    ({
        Data,
        inspectionId,
        page,
        onItemUpdate,
        isRenterUser = false,
    }: any): React.JSX.Element => {
        const {navigate} = useNavigation<NativeStackNavigationProp<any>>();
        const [status_item, setStatus] = useState(Data.status);
        const [comment, setComment] = useState<string>(Data.comments || '');
        console.log('🚀 ~ comment:===========>', comment);
        const [visible, setVisible] = useState(false);
        const [index, setIndex] = useState(0);
        console.log('data images', Data.comments);
        useEffect(() => {
            if (Data) {
                setStatus(Data.status);
                setComment(Data.comments);
            }
        }, [Data]);
        const prevImage = () => {
            if (index > 0) setIndex(index - 1);
        };

        const nextImage = () => {
            setIndex((index + 1) % Data.images.length);
        };

        const statusUpdate = async (stat: any, enabled: number) => {
            setStatus(stat);
            onItemUpdate(stat, Data?.item_id, comment, enabled);

            const data = {
                id: inspectionId,
                area_id: Data?.area_id,
                item_id: Data?.item_id,
                status: stat,
                comments: comment,
                is_enable: enabled,
            };
            console.log('updated data in test=======>', data);
            await apiUpdateStatus(data);
        };

        const handleStatusChange = async (newStatus: any) => {
            console.log('🚀 ~ handleStatusChange ~ newStatus:', newStatus);

            if (status_item !== newStatus) {
                await statusUpdate(newStatus, 1);

                if (isRenterUser && newStatus == 'DAMAGE') {
                    navigate('Camera', {
                        id: inspectionId,
                        area_id: Data.area_id,
                        item_id: Data.item_id,
                        page: page,
                        length: Data.images.length,
                    });
                }
            } else if (comment !== Data.comments) {
                await statusUpdate(newStatus, 1);
            }
        };

        const styles: any = useMemo(
            () =>
                StyleSheet.create({
                    mainContainer: {
                        padding: 20,
                        backgroundColor: '#FFFFFF',
                        minHeight: '100%',
                    },
                    textArea: {
                        borderWidth: 0,
                        height: 30,
                        marginBottom: -5,
                    },
                    textAreaFocus: {
                        flex: 1,
                        marginRight: 5,
                        borderWidth: 1,
                        height: 45,
                        borderColor: 'rgba(217,217,217,0.6)',
                    },
                    closeIcon: {
                        height: 20,
                        width: 20,
                        position: 'absolute',
                        right: -5,
                        top: -3,
                    },
                    cameraIcon: {
                        height: 37,
                        width: 37,
                    },
                    icon: {
                        height: 37,
                        width: 37,
                        resizeMode: 'stretch',
                    },
                    def: {
                        width: 49,
                        height: 46,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#E5DCED',
                    },
                    n: {
                        backgroundColor: '#9A46DB',
                        width: 49,
                        height: 44,
                        borderRadius: 10,
                    },
                    s: {
                        backgroundColor: '#90C94D',
                        width: 49,
                        height: 44,
                        borderRadius: 10,
                    },
                    d: {
                        backgroundColor: '#FFC953',
                        width: 49,
                        height: 44,
                        borderRadius: 10,
                    },
                    a: {
                        backgroundColor: '#FF5379',
                        width: 49,
                        height: 44,
                        borderRadius: 10,
                    },
                    y: {
                        backgroundColor: '#46AEDB',
                        width: 49,
                        height: 44,
                        borderRadius: 10,
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
                        // overflow: 'hidden',
                        backgroundColor: '#ddd',
                        position: 'relative',
                    },

                    image: {
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                    },

                    overlay: {
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(128, 0, 255, 0.4)', // purple transparent
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
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
                        fontSize: 12,
                        color: '#ffffff',
                    },

                    addButton: {
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: '#9B4DFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    container: {
                        width: '100%',
                        minHeight: 80,
                        backgroundColor: '#F3F3F3',
                        borderRadius: 20,
                        paddingHorizontal: 15,
                        paddingVertical: 12,
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
                    countView: {
                        width: 20,
                        height: 20,
                        position: 'absolute',
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50,
                        top: -8,
                        right: -8,
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
                    },

                    thumbImage: {
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                    },

                    deleteIconWrapper: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        backgroundColor: 'rgba(142, 54, 255, 0.6)',
                        width: '100%',
                        height: '100%',
                        borderRadius: 14,
                        justifyContent: 'center',
                        alignItems: 'center',
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
                }),
            [],
        );
        const statusTextColors: any = {
            NEW: '#9A46DB',
            SATISFACTORY: '#90C94D',
            DAMAGE: '#FFC953',
            ATTENTION: '#FF5379',
            NOT_AVAILABLE: '#46AEDB',
        };

        const statusTextBgColors: any = {
            NEW: '#EDE3FF',
            SATISFACTORY: '#F1FFE3',
            DAMAGE: '#FFF8E3',
            ATTENTION: '#FFE3F2',
            NOT_AVAILABLE: '#E3F7FF',
        };
        const images = [
            {uri: 'https://picsum.photos/200/300'},
            {uri: 'https://picsum.photos/id/237/200/300'},
            {uri: 'https://picsum.photos/200/300'},
            {uri: 'https://picsum.photos/id/237/200/300'},
            {uri: 'https://picsum.photos/200/300'},
            {uri: 'https://picsum.photos/id/237/200/300'},
        ];

        return (
            <VStack
                space={0}
                mb={3}
                style={{
                    backgroundColor: '#ffffff',
                    padding: 12,
                    borderRadius: 20,
                }}>
                {Data.is_enable == 1 ? (
                    <>
                        <HStack justifyContent={'space-between'}>
                            <Box width={'100%'}>
                                <Text bold fontSize={16} color={'#250959'}>
                                    {Data.name}
                                </Text>
                            </Box>
                            {/* <Pressable
                                onPress={() => {
                                    statusUpdate(status_item, 0);
                                }}>
                                <Image
                                    source={Close}
                                    mr={1}
                                    alt="close"
                                    style={styles.closeIcon}
                                />
                            </Pressable> */}
                        </HStack>
                        <HStack
                            space={1}
                            mt={2}
                            mb={1}
                            justifyContent={'space-between'}>
                            {[
                                'NEW',
                                'SATISFACTORY',
                                'DAMAGE',
                                'ATTENTION',
                                'NOT_AVAILABLE',
                            ].map((statusKey, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() =>
                                        handleStatusChange(statusKey)
                                    }>
                                    <Box
                                        justifyContent="center"
                                        // style={
                                        //     status_item === statusKey
                                        //         ? index < 4
                                        //             ? styles[
                                        //                   statusKey
                                        //                       .charAt(0)
                                        //                       .toLowerCase()
                                        //               ]
                                        //             : styles.y
                                        //         : styles.def
                                        // }

                                        style={{
                                            ...styles.def, // Start with the base default styles (width, border, etc.)
                                            backgroundColor:
                                                status_item === statusKey
                                                    ? index < 4 // If active/selected, use the special active style (which includes a background color)
                                                        ? styles[
                                                              statusKey
                                                                  .charAt(0)
                                                                  .toLowerCase()
                                                          ].backgroundColor
                                                        : styles.y
                                                              .backgroundColor
                                                    : statusTextBgColors[
                                                          statusKey
                                                      ] ||
                                                      styles.def
                                                          .backgroundColor, // <--- Dynamic Color
                                            // The rest of the style prop from your original logic is now cleaner:
                                            // status_item === statusKey
                                            //     ? index < 4
                                            //         ? styles[statusKey.charAt(0).toLowerCase()]
                                            //         : styles.y
                                            //     : { ...styles.def, backgroundColor: defaultBackgroundColors[statusKey] || '#F2F2F2' }
                                        }}
                                        alignItems="center">
                                        <Text
                                            bold
                                            color={
                                                status_item === statusKey
                                                    ? '#ffffff'
                                                    : statusTextColors[
                                                          statusKey
                                                      ]
                                            }
                                            fontSize="16">
                                            {index < 4
                                                ? index !== 3
                                                    ? statusKey.charAt(0)
                                                    : '!'
                                                : 'N/A'}
                                        </Text>
                                    </Box>
                                </TouchableOpacity>
                            ))}
                        </HStack>
                        <View style={styles.row}>
                            {/* 1️⃣ First Thumbnail With Overlay Eye Icon */}

                            {Data.images.length > 0 && (
                                <TouchableOpacity
                                    style={styles.thumb}
                                    onPress={() => setVisible(true)}>
                                    <FastImage
                                        source={{uri: Data.images[0]?.image}}
                                        style={styles.image}
                                    />
                                    <View style={styles.overlay}>
                                        <FastImage
                                            source={require('../../../assets/icon/eye_v.png')}
                                            style={{width: 24, height: 19}}
                                            resizeMode="contain"
                                        />
                                        {Data.images.length > 0 && (
                                            <View style={styles.countView}>
                                                <Text style={styles.countText}>
                                                    {Data?.images.length}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* 2️⃣ Normal Thumbnails */}
                            {/* {Data?.images.slice(0, 2).map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.thumb}>
                                    <FastImage
                                        source={{uri: img.image}}
                                        style={styles.image}
                                    />
                                </TouchableOpacity>
                            ))} */}

                            {/* 3️⃣ Count Box */}
                            {/* {Data.images.length > 0 && (
                                <View style={styles.countBox}>
                                    <Text style={styles.countText}>{Data?.images.length}</Text>
                                </View>
                            )} */}

                            {/* 4️⃣ Add New Image */}
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => {
                                    navigate('Camera', {
                                        id: inspectionId,
                                        area_id: Data.area_id,
                                        item_id: Data.item_id,
                                        page: page,
                                        length: Data.images.length,
                                    });
                                }}>
                                <FastImage
                                    source={require('../../../assets/icon/image_v.png')}
                                    style={{width: 24, height: 24}}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.container}>
                            {/* <Text style={styles.label}>Add Comment</Text> */}

                            <TextInput
                                placeholder="comment"
                                placeholderTextColor="#C2C0CC"
                                multiline
                                style={styles.input}
                                value={comment}
                                onChangeText={setComment}
                                onBlur={() => {
                                    handleStatusChange(status_item);
                                }}
                            />
                        </View>
                        {/* <HStack mt={3} space={1}>
                            <TextArea
                                mt={1}
                                placeholder="Comment..."
                                w="100%"
                                style={styles.textAreaFocus}
                                value={comment}
                                onChangeText={setComment}
                                onBlur={() => {
                                    handleStatusChange(status_item);
                                }}
                            />

                            <VStack mt={2}>
                                {Data.images.length > 0 && (
                                    <Badge
                                        colorScheme="danger"
                                        rounded="full"
                                        zIndex={1}
                                        mb={-4}
                                        mr={-1}
                                        variant="solid"
                                        _text={{fontSize: 9}}
                                        alignSelf={'flex-end'}>
                                        {Data.images.length}
                                    </Badge>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        navigate('Camera', {
                                            id: inspectionId,
                                            area_id: Data.area_id,
                                            item_id: Data.item_id,
                                            page: page,
                                            length: Data.images.length,
                                        });
                                    }}>
                                    <Image
                                        source={CameraOption}
                                        alt="picture"
                                        style={styles.cameraIcon}
                                    />
                                </TouchableOpacity>
                            </VStack>
                        </HStack> */}
                    </>
                ) : (
                    <Pressable
                        style={{width: '100%'}}
                        onPress={() => {
                            statusUpdate(status_item, 1);
                        }}>
                        <HStack alignItems={'center'} space={2}>
                            <Image
                                source={DisableIcon}
                                style={{height: 15, width: 15}}
                                alt="icon"
                            />
                            <Text color={'my.tl'} fontSize={'sm'}>
                                {Data.name}
                            </Text>
                        </HStack>
                    </Pressable>
                )}

                <Modal transparent visible={visible} animationType="fade">
                    {/* Overlay Background */}
                    <View style={styles.overlay1}>
                        {/* Popup Container */}
                        <View style={styles.popup1}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title1}>Preview</Text>

                                <TouchableOpacity
                                    onPress={() => setVisible(false)}
                                    style={styles.closeBtn1}>
                                    <Image
                                        source={require('../../../assets/icon/close_2.png')}
                                        alt="close"
                                        style={{width: 12, height: 12}}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Main Image */}
                            <FastImage
                                source={{uri: Data?.images[index]?.image}}
                                style={styles.mainImage}
                            />

                            {/* Thumbnails */}
                            <FlatList
                                horizontal
                                data={Data?.images}
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
                                        {index === i ? (
                                            <View
                                                style={
                                                    styles.deleteIconWrapper
                                                }>
                                                <Image
                                                    source={require('../../../assets/icon/trash_2.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        resizeMode: 'contain',
                                                    }}
                                                    tintColor={'#ffffff'}
                                                />
                                            </View>
                                        ) : null}
                                        <FastImage
                                            source={{uri: item.image}}
                                            style={styles.thumbImage}
                                        />
                                    </TouchableOpacity>
                                )}
                            />

                            {/* Pagination Buttons */}
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    style={styles.pageBtn}
                                    onPress={prevImage}>
                                    <Image
                                        source={require('../../../assets/icon/back.png')}
                                        style={{
                                            width: 12,
                                            height: 8,
                                            resizeMode: 'contain',
                                        }}
                                        tintColor={'#9A46DB'}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.pageBtn,
                                        styles.pageBtnActive,
                                    ]}
                                    onPress={nextImage}>
                                    <Image
                                        source={require('../../../assets/icon/right_2.png')}
                                        style={{
                                            width: 11,
                                            height: 7,
                                            resizeMode: 'contain',
                                        }}
                                        tintColor={'#9A46DB'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </VStack>
        );
    },
);

export default _areaCard;
