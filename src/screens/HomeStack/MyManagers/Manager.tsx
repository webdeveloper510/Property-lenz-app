import React from 'react';
import { StyleSheet,View,Image } from 'react-native';
import { Text, VStack } from 'native-base';
// icons
import { MyManagers } from '@/services/types';
import _cardManager from './_cardManager';

 const Mangers = ({navigation, mangerData, deleteManager}:any): React.JSX.Element => {

  return (
<VStack pt={4} space={1}>
  {mangerData.length == 0 ?
  (
      <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#F3F3F3', // light grey background like screenshot
                                    paddingHorizontal: 25,
                                }}>
                                <Image
                                    source={require('../../../assets/icon/empty.png')} // replace with your icon
                                    style={styles.icon1}
                                    resizeMode="contain"
                                />
    
                                <Text style={styles.title1}>Oops!</Text>
    
                                <Text style={styles.subTitle}>
                                    Nothing to see here yet.
                                </Text>
    
                                <Text style={styles.description}>
                                    Once you add data, your charts will come alive.
                                </Text>
                            </View> 
  ) :(
   mangerData.map((manager: MyManagers, i: number) => {
    return (
        <_cardManager key={i} type={'manager'} item={manager} del={deleteManager} />
    );
   }))
   }
 </VStack>
   );
 };

const styles = StyleSheet.create({
mainContainer: {
  padding: 20,
  minHeight: '100%',
},
backIcon: {
  height: 40,
  width: 40,
},
 icon1: {
        height: 80,
        width: 80,
        resizeMode: 'contain',
    },
     title1: {
        fontSize: 30,
        fontWeight: '700',
        color: '#9A46DB',
        marginBottom: 6,
        padding: 10,
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
export default Mangers;
