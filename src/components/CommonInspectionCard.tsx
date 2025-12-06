import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import moment from 'moment';
type Props = {
    iconColor?: string;
    iconTint?: string;
    type?: string;
    status?: string;
    statusColor?: string;
    data?: InspectionGet;
    renter?: string;
    showText: boolean;
    onPress?: () => void;
};

interface InspectionGet {
    id: number;
    activity: string;
    inspection_date: string;
    inspection_type: string;
    status: string;
    property: {
        id: number;
        name: string;
    };
    tenants: {
        id: number;
        first_name: string;
        last_name: string;
    }[];
}

const CommonInspectionCard: React.FC<Props> = ({
    iconColor = '#EEE4FF',
    iconTint = '#9A46DB',
    type = '',
    status = '',
    statusColor = '#6F6F6F',
    data,
    renter = '',
    showText,
    onPress = () => {},
}) => {
    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'recent':
                return '#6ACA45';
            case 'upcoming':
                return '#FF7184';
            case 'in_progress':
                return '#FFB674';
            case 'overdue':
                return '#FFB674';
            case 'awaiting_review':
                return '#8CABF9';
            case 'completed':
                return '#6ACA45';
            default:
                return '#6F6F6F';
        }
    };

    const getBackGroundColor = (status?: string) => {
        switch (status) {
            case 'recent':
                return '#E7F8E1';
            case 'upcoming':
                return '#FAD7D8';
            case 'in_progress':
                return '#FFEAD6';
            case 'overdue':
                return '#FFB674';
            case 'awaiting_review':
                return '#aec4fbd1';
            case 'completed':
                return '#E7F8E1';
            default:
                return '#6F6F6F';
        }
    };
    return (
        <View
            style={{
                width: '90%',
                // height: 90,
                backgroundColor: '#ffffff',
                alignSelf: 'center',
                marginVertical: 10,
                padding: 10,
                borderRadius: 20,
            }}>
            {/* Top Row */}
            <View
                style={{flexDirection: 'row', justifyContent: 'space-between',width:'100%',}}>
                {/* Icon + Title */}
                <View style={{flexDirection: 'row',width:'80%'}}>
                    <View
                        style={{
                            width: 45,
                            height: 45,
                            borderRadius: 12,
                            backgroundColor: getBackGroundColor(
                                data?.inspection_type,
                            ),
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                        }}>
                        <Image
                            source={require('../assets/icon/calender.png')}
                            style={{width: 22, height: 22, tintColor: iconTint}}
                            resizeMode="contain"
                            tintColor={getStatusColor(data?.inspection_type)}
                        />
                    </View>

                    <View>
                        <Text
                            style={{
                                color: '#9A46DB',
                                fontSize: 10,
                                fontWeight: '600',
                            }}>
                            Inspection Type :
                        </Text>
                        <Text
                            style={{
                                color: '#250959',
                                fontSize: 15,
                                fontWeight: '600',
                            }}>
                            {data?.activity?.replace(/_/g, ' ')}{' '}
                            {data?.property?.name?.length > 8
                                ? data?.property.name.slice(0, 8) + '...'
                                : data?.property?.name}
                        </Text>
                    </View>
                </View>

                {/* Status */}
                {/* <View style={{width:'20%',alignItems:'flex-end'}}>
                <Text
                    style={{
                        color: getStatusColor(data?.inspection_type),
                        fontSize: 8,
                        fontWeight: '400',
                    }}>
                    {data?.inspection_type.replace('_', ' ')}
                </Text>
                </View> */}
                 <TouchableOpacity
                    onPress={onPress}
                    style={{
                        width: 60,
                        height: 40,
                        // position: 'relative',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop:25
                        // backgroundColor:'red'
                    }}>
                    {/* Arrow Button */}
                    <View
                        style={{
                            width: 43,
                            height: 43,
                            borderRadius: 50,
                            borderWidth: 1,
                            borderColor: '#F3E7FD',
                            justifyContent: 'center',
                            alignItems: 'center',
                            // position: 'absolute',
                        }}>
                        <Image
                            source={require('../assets/icon/right_2.png')}
                            style={{width: 11, height:11, tintColor: '#9A46DB'}}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Middle Row */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                }}>
                <View style={{flex: 1}}>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 4,
                            paddingLeft: 10,
                        }}>
                        <Text style={{color: '#250959', fontSize: 10}}>
                            Event Date:{' '}
                            <Text style={{fontWeight: '600'}}>
                                {moment(data?.inspection_date).format(
                                    'MM/DD/YYYY',
                                )}
                            </Text>
                        </Text>

                        <Text
                            style={{
                                color: '#250959',
                                fontSize: 10,
                                marginLeft: 12,
                            }}>
                            Renter:{' '}
                            <Text style={{fontWeight: '600'}}>
                                {data?.tenants[0]?.first_name}{' '}
                                {data?.tenants[0]?.last_name}
                            </Text>
                        </Text>
                    </View>
                </View>
               
            </View>
        </View>
    );
};

export default CommonInspectionCard;
