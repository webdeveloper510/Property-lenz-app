import React from 'react';
import { StyleSheet,View,Image } from 'react-native';
import { Text, VStack } from 'native-base';
// icons
import { MyTenants } from '@/services/types';
import _cardManager from './_cardManager';

 const Tenants = ({navigation, renterData, deleteRenter}:any): React.JSX.Element => {

  return (
<VStack pt={4} space={1}>
  {renterData.length == 0 ?
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
  renterData.map((renter: MyTenants, i: number) => {
    return (
        <_cardManager key={i} type={'tenant'} item={renter} del={deleteRenter} />
    );
   }))
   }
 </VStack>
   );
 };

 const styles = StyleSheet.create({
 icon1: {
        height: 80,
        width: 80,
    },  
      title1: {
        fontSize: 24,   
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    subTitle: {   
        fontSize: 18,
        color: '#555555',
        marginBottom: 5,  
    },
    description: {
        fontSize: 16,
        color: '#777777',
        textAlign: 'center',
        marginTop: 5,
    },
});
export default Tenants;
