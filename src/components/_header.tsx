import React from 'react';
import { SafeAreaView, StyleSheet,View,TouchableOpacity,Platform } from 'react-native';
import { Text, Box, Image, HStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/state/hooks';

// icons
import SetIcon from '@/assets/icon/setting_2.png';
import Search from '@/assets/icon/search_2.png';
import NotificationIcon from '@/assets/icon/notification_2.png';    
const _header = ({location}: any): React.JSX.Element => {
    const userData: any = useAppSelector(state => state.auth.userData);
    const profileData: any = useAppSelector(state => state.auth.profileData);
    const { navigate } = useNavigation<NativeStackNavigationProp<any>>();

    const formatDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentDate = new Date();
        const dayOfWeek = days[currentDate.getDay()];
        const month = months[currentDate.getMonth()];
        const dayOfMonth = String(currentDate.getDate()).padStart(2, '0');
        const year = currentDate.getFullYear().toString();
        return `It's ${month}, ${dayOfWeek} ${dayOfMonth}, ${year}`;
    };

    return (
        <View style={[styles.main,{marginTop:Platform.OS == 'ios' ? 0 : 20}]}>
                            <TouchableOpacity>
                                <Image source={NotificationIcon} alt="icon" style={{height: 40, width: 40, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                            <Text style={{color:'#250959',fontSize:14,fontWeight:'700',textTransform:'capitalize'}}>{location}</Text>
                            <View style={{flexDirection:'row',gap:10}}>
                                  <TouchableOpacity onPress={() => { navigate('SearchTab'); }}>
                                   <Image source={Search} alt="icon" style={{height: 40, width: 40, resizeMode: 'contain'}} />
                                   </TouchableOpacity>
                                   <TouchableOpacity onPress={() => navigate('Settings')}>
                                    <Image source={SetIcon} alt="icon" style={{height: 40, width: 40, resizeMode: 'contain'}} />
                                    </TouchableOpacity>
                            </View>
                {/* <Box style={styles.headerContainer}>
                    <Box style={styles.userContainer}>
                        <Text bold fontSize="2xl" color={'my.t'}>{profileData == null ? userData?.first_name : profileData?.first_name}!</Text>
                        <Text fontSize="sm" color={'my.t'}>{formatDate()}</Text>
                    </Box>
                    <Box style={styles.alertContainer}>
                        <HStack alignItems={'center'} space={2}>
                            <TouchableOpacity onPress={() => { navigate('SearchTab'); }}>
                                <Image source={Search} alt="icon" style={{height: 40, width: 40, resizeMode: 'stretch'}} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate('Settings')}>
                                <Image source={SetIcon} alt="icon" style={styles.icon} />
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                </Box> */}
        
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
     width: '100%',
     alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor:'#F2F2F2'
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(240,240,240,0.9)',
        height: 100,
        padding: 10,
        paddingLeft: 15,
        elevation: 2,
    },
    userContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    alertContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        gap: 4,
        zIndex: 1,
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
    uName: {
        fontSize: 20,
    },
    icon: {
        height: 50,
        width: 50,
    },
});
export default _header;
