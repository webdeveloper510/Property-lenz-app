import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet,SafeAreaView,View,Platform,Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Text, Box, HStack, VStack, ScrollView } from 'native-base';
import { apiNotification } from '@/apis/home';
import BackButton from '@/components/BackButton';
// icons
import Back from '@/assets/icon/btnBack.png';
import { useIsFocused } from '@react-navigation/native';

const Notification = ({ navigation }: any): React.JSX.Element => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const isFocused = useIsFocused();

  const getNotification = async () => {
    const response = await apiNotification();
    if (response.status) {
      setNotifications(response.result.data);
    } else { }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Extract year, month, day, hour, and minute
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based index
    const day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Determine AM or PM
    const amPm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour format to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, change it to 12

    // Format the time string
    const formattedTime = `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;

    return formattedTime;
  };
  useEffect(() => {
    if (isFocused) {
      getNotification();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'#F2F2F2'}}>
         <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    marginTop: Platform.OS == 'ios' ? 0 : 28,
                    marginHorizontal: 20,
                    justifyContent: 'space-between',
                }}>
                <BackButton navigation={navigation} />
                <Text
                    style={{
                        fontSize: 18,
                        color: '#250959',
                        fontWeight: '700',
                        flex:1,
                        textAlign: 'center',
                    }}>
                    Notifications
                </Text>
                <View style={{width:24}}/>
            </View>
    <ScrollView>
      <Box style={styles.mainContainer} >
       
        <VStack space={1}>
          {notifications.length > 0 ? notifications.map((item, i) => {
            return (
              <Pressable key={i} onPress={() => { }}>
                <VStack space={0} mt={1} style={styles.notificationContiner}>
                  <Box>
                  {/* numberOfLines={1} ellipsizeMode="tail" */}
                    <Text bold color={'white'} lineHeight={18}  style={styles.text} >
                      {item.title}
                    </Text>
                  </Box>
                  {/* numberOfLines={2} ellipsizeMode="tail" */}
                  <Text color={'white'} fontSize={'xs'} my={1} lineHeight={16} style={styles.text} >
                    {item.body}
                  </Text>
                  <Text color={'white'} style={styles.date}>{formatDate(item.created_at)}</Text>
                </VStack>
              </Pressable>
            );
          }) :
           <View style={styles.container}>
      <Image
        source={require('../../assets/icon/empty.png')} // replace with your icon
        style={styles.icon}
        resizeMode="contain"
      />

      <Text style={styles.title}>Oops!</Text>

      <Text style={styles.subTitle}>Nothing to see here yet.</Text>

      <Text style={styles.description}>
        Once you add data, your charts will come alive.
      </Text>
    </View>
        
        }
        </VStack>
      </Box>
    </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    width: wp('100%'),
    minHeight: hp('100%'),
    backgroundColor: '#F2F2F2',
  },
  notificationContiner: {
    backgroundColor: 'rgba(10,113,189,0.9)',
    overflow: 'hidden',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  backIcon: {
    height: 40,
    width: 40,
  },
  text: {
    display: 'flex',
    verticalAlign: 'middle',
    flexWrap: 'wrap',
    width: '100%',
    maxHeight: 50,
    borderColor: 'black',
  },
  date: {
    fontSize: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',  // light grey background like screenshot
    paddingHorizontal: 25,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#9A46DB',
    marginBottom: 6,
    padding:10
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1446',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    width: '75%',
  },
});

export default Notification;
