import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    ScrollView,
    FlatList,
    SafeAreaView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '@/components/BackButton';
import CommonInspectionCard from '@/components/CommonInspectionCard';
const PropertyDetails = ({navigation}) => {

    interface InspectionItem {
        id: number;
        type: string;
        date: string;
        renter: string;
        status: 'Completed' | 'Pending';
        iconColor: string;
        iconTint: string;
        statusColor: string;
    }
    const inspections: InspectionItem[] = [
        {
            id: 1,
            type: 'Move Out Nirman',
            date: '10/02/2025',
            renter: 'Nerd Renttest',
            status: 'Completed',
            iconColor: '#E6F8EC',
            iconTint: '#43C465',
            statusColor: '#43C465',
        },
        {
            id: 2,
            type: 'Move In Nirman',
            date: '10/02/2025',
            renter: 'Nerd Renttest',
            status: 'Pending',
            iconColor: '#FFF3E8',
            iconTint: '#F6A54B',
            statusColor: '#F6A54B',
        },
        {
            id: 3,
            type: 'Move In Nirman',
            date: '10/02/2025',
            renter: 'Nerd Renttest',
            status: 'Pending',
            iconColor: '#FFF3E8',
            iconTint: '#F6A54B',
            statusColor: '#F6A54B',
        },
        {
            id: 4,
            type: 'Move In Nirman',
            date: '10/02/2025',
            renter: 'Nerd Renttest',
            status: 'Pending',
            iconColor: '#FFF3E8',
            iconTint: '#F6A54B',
            statusColor: '#F6A54B',
        },
    ];
     const renderItem = ({item}: {item: InspectionItem}) => (
        <CommonInspectionCard
        data={item}
        />)
    return (
        <SafeAreaView style={{flex:1}}>
        <ScrollView style={styles.container}>
            <View style={{marginHorizontal:10}}>
            {/* Header */}
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
                    Property Details
                </Text>
                <View></View>
            </View>

            {/* Image Card */}
            <View style={styles.card}>
                <ImageBackground
                    source={require('../../assets/icon/banner.png')}
                    style={styles.propertyImage}
                    resizeMode='contain'
                    >
                    <View style={styles.inspectionRow}>
                        <TouchableOpacity style={styles.menuBtn}>
                            <Image
                                source={require('../../assets/icon/menu_2.png')} // Change image
                                style={{width: 16, height: 16}}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.inspectionBtn}>
                            <Text style={styles.inspectionText}>
                                New Inspection
                            </Text>
                            </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
            <Text style={styles.title1}>Nirman</Text>
            {/* Property Name + Location */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                }}>
                <Image
                    source={require('../../assets/icon/location_3.png')}
                    style={{width: 11, height: 11}}
                    resizeMode="contain"
                />
                <Text
                    style={[
                        styles.location,
                        {
                            paddingLeft: 5,
                            fontSize: 13,
                            color: '#250959',
                            fontWeight: '600',
                        },
                    ]}>
                    Location:
                </Text>
                <Text style={[styles.location, {paddingLeft: 5}]}>
                    Mississauga, ON
                </Text>
            </View>

            {/* Bottom Info Row */}
            <View style={styles.infoRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>3 Beds</Text>
                </View>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>2 Baths</Text>
                </View>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>1 Garage</Text>
                </View>
            </View>
            <View style={{width:'70%',height:1,backgroundColor:'#D9D9D9',alignSelf:'center',marginTop:20}}/>
            <Text style={styles.title}>Pending</Text>
               <FlatList
                                    data={inspections}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{paddingVertical: 10}}
                                />
            <View style={{width:'70%',height:1,backgroundColor:'#D9D9D9',alignSelf:'center',marginTop:20}}/>

            <Text style={styles.title}>In-Progress</Text>
             <FlatList
                                    data={inspections}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{paddingVertical: 10}}
                                />
            <View style={{width:'70%',height:1,backgroundColor:'#D9D9D9',alignSelf:'center',marginTop:20}}/>

                                  <Text style={styles.title}>Completed</Text>
                                    <FlatList
                                    data={inspections}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{paddingVertical: 10}}
                                />
                                   <View style={{width:'70%',height:1,backgroundColor:'#D9D9D9',alignSelf:'center',marginTop:20}}/>
                                   </View>
        </ScrollView>
        </SafeAreaView>
    );
};

export default PropertyDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingTop: 20,
        
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 35,
        height: 35,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        marginRight: 35,
        fontSize: 16,
        fontWeight: '600',
        color: '#250959',
    },

    card: {
        width:'90%',
        height:180,
        position: 'relative',
        marginTop: 20,
        borderRadius: 20,
        backgroundColor: '#F2F2F2',
        elevation: 3,
        alignSelf:'center',
    
    },
    propertyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        alignSelf:'center'
    },

    inspectionRow: {
        alignSelf: 'center',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        bottom: -30,
        zIndex: 999,
    },
    menuBtn: {
        width: 45,
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    inspectionBtn: {
        width: '70%',
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor:'#9A46DB',
        justifyContent:'center',
        alignItems:'center'
    },
    inspectionText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
  title1: {
        marginTop: 18,
        fontSize: 20,
        fontWeight: '700',
        color: '#250959',
    },
    title: {
        marginTop: 18,
        fontSize: 18,
        fontWeight: '600',
        color: '#250959',
    },
    subTitle: {
        fontSize: 12,
        color: '#6F6F6F',
        marginTop: 4,
    },

    infoRow: {
        flexDirection: 'row',
        marginTop: 18,
    },
    badge: {
        backgroundColor: '#EEE4FF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
    },
    badgeText: {
        color: '#250959',
        fontWeight: '600',
        fontSize: 12,
    },
    location: {
        fontSize: 12,
        color: '#6A6A6A',
    },
});
