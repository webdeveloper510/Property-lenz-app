import React,{useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import {BlurView} from '@react-native-community/blur';
import {Subscription, UserDataObject} from '@/services/types';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {apiCancelSubscribe, apiLogout, apiTenantLogOut} from '@/apis/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import cacheService from '@/services/CacheServices';
import {
    setLoggedIn,
    setPackage,
    setProfile,
    setUserData,
} from '@/state/authSlice';
import {setInspection} from '@/state/propertyDataSlice';
export default function CustomDrawer({ navigation }: DrawerContentComponentProps) {
  const [isActive,setIsActive] = useState('PropertyListScreen')
   const userData: UserDataObject | any = useAppSelector(
          state => state.auth.userData,
      );
          const dispatch = useAppDispatch();
    const logout = async () => {
          const response =
              userData.type !== 'TENANT'
                  ? await apiLogout()
                  : await apiTenantLogOut();
          if (response.status) {
              cleanUp();
              if (userData.type == 'OWNER') {
                  await GoogleSignin.signOut();
              }
          }
      };

        const cleanUp = async () => {
        const status = await cacheService.resetData();
        if (status) {
            dispatch(setLoggedIn(false));
            dispatch(setUserData(null));
            dispatch(setProfile(null));
            dispatch(setPackage(null));
            dispatch(setInspection(null));
        }
    };
  return (
    <View style={styles.container}>
       {/* <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={6}
      /> */}
      
      {/* LOGO */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Image
          source={require('../assets/logo/logo1.png')}
          style={{ width: 150, height: 60, resizeMode: 'contain' }}
        />
      </View>

      {/* ACTIVE MENU BUTTON */}
   
     <View
        
        style={[styles.activeButton,{  backgroundColor: isActive == 'PropertyListScreen' ? '#9A46DB' :'#F2F2F2', borderRadius: isActive == 'PropertyListScreen'?50 :0, elevation: isActive == 'PropertyListScreen' ?3:0,paddingVertical: isActive== 'PropertyListScreen' ?10:5}]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("PropertyListScreen"),setIsActive('PropertyListScreen')}} style={styles.row}>
          <Image source={require('../assets/icon/home_d.png')} style={styles.icon}  tintColor={ isActive == 'PropertyListScreen' ? "#ffffff" :'#B598CB'}/>
          <Text style={[styles.activeText1,{color:isActive == 'PropertyListScreen' ? '#ffffff' :'#B598CB'}]}>Properties</Text>
        </TouchableOpacity>
      </View>
              <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:4}}/>

                 <View
        
        style={[styles.activeButton,{  backgroundColor: isActive == 'HomeTab' ? '#9A46DB' :'#F2F2F2', borderRadius: isActive == 'HomeTab'?50 :0, elevation: isActive == 'HomeTab' ?3:0, paddingVertical: isActive== 'HomeTab' ?12:5,}]}
      >
        <TouchableOpacity onPress={() => { navigation.navigate('RecentlyCompleted', {
                                title: {title :'Inspection List'},
                            }),setIsActive('HomeTab')}} style={styles.row}>
          <Image source={require('../assets/icon/ins.png')} style={styles.icon} tintColor={ isActive == 'HomeTab' ? "#ffffff" :'#B598CB'} />
          <Text style={[styles.activeText,{color:isActive == 'HomeTab' ? '#ffffff' :'#B598CB'}]}>Inspections</Text>
        </TouchableOpacity>
      </View>
        <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:4}}/>
       <View
        
        style={[styles.activeButton,{  backgroundColor: isActive == 'Manager' ? '#9A46DB' :'#F2F2F2', borderRadius: isActive == 'Manager'?50 :0, elevation: isActive == 'Manager' ?1:0,paddingVertical: isActive== 'Manager' ?10:5}]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("Manager",{id:'user'}),setIsActive('Manager')}} style={styles.row}>
          <Image source={require('../assets/icon/role.png')} style={styles.icon} tintColor={ isActive == 'Manager' ? "#ffffff" :'#B598CB'}/>
          <Text style={[styles.activeText1,{color:isActive == 'Manager' ? '#ffffff' :'#B598CB'}]}>Users</Text>
        </TouchableOpacity>
      </View>
              <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:15}}/>
         <View
        
        style={[styles.activeButton,{  backgroundColor: isActive == 'renter' ? '#9A46DB' :'#F2F2F2', borderRadius: isActive == 'renter'?50 :0, elevation: isActive == 'renter' ?1:0,paddingVertical: isActive== 'renter' ?10:5}]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("Manager",{id:'renter'}),setIsActive('renter')}} style={styles.row}>
          <Image source={require('../assets/icon/key_2.png')} style={styles.icon} tintColor={ isActive == 'renter' ? "#ffffff" :'#B598CB'} />
          <Text style={[styles.activeText1,{color:isActive == 'renter' ? '#ffffff' :'#B598CB'}]}>Renters</Text>
        </TouchableOpacity>
      </View>
              <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:15}}/>
       {/* <View
        
        style={styles.activeButton}
      >
        <TouchableOpacity onPress={() => navigation.navigate("HomeTab")} style={styles.row}>
          <Image source={require('../assets/icon/amen.png')} style={styles.icon} />
          <Text style={styles.activeText1}>Amenities</Text>
        </TouchableOpacity>
      </View> */}
          
       <View
        
        style={styles.activeButton}
      >
        <TouchableOpacity onPress={() => navigation.navigate("HomeTab")} style={styles.row}>
          <Image source={require('../assets/icon/history.png')} style={styles.icon} />
          <Text style={styles.activeText1}>History</Text>
        </TouchableOpacity>
      </View>
              <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:15}}/>
     <View
        
        style={[styles.activeButton,{  backgroundColor: isActive == 'Settings' ? '#9A46DB' :'#F2F2F2', borderRadius: isActive == 'Settings'?50 :0, elevation: isActive == 'Settings' ?1:0,paddingVertical: isActive== 'Settings' ?10:5}]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("Settings"),setIsActive('Settings')}} style={styles.row}>
          <Image source={require('../assets/icon/setting_3.png')} style={styles.icon} tintColor={ isActive == 'Settings' ? "#ffffff" :'#B598CB'}/>
          <Text style={[styles.activeText1,{color:isActive == 'Settings' ? '#ffffff' :'#B598CB'}]}>Settings</Text>
        </TouchableOpacity>
      </View>
              <View style={{width:'90%',height:1,backgroundColor:'#D9CBE5',marginBottom:15}}/>

<View
        
        style={styles.activeButton}
      >
        <TouchableOpacity onPress={() => logout()} style={styles.row}>
          <Image source={require('../assets/icon/turn_off.png')} style={styles.icon} />
          <Text style={styles.activeText1}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// helper component for list items


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingVertical: 50,
    paddingHorizontal: 25,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: { width: 20, height: 20, tintColor: '#B598CC', marginRight: 10 },
  activeButton: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 8,
    marginBottom: 5,
    // shadowColor: '#9B5CFF',
    // shadowOpacity: 0.4,
    // shadowRadius: 15,
  },
   activeButton1: {
    backgroundColor: '#ffffff',
   
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    // shadowColor: '#9B5CFF',
    // shadowOpacity: 0.4,
    // shadowRadius: 15,
    
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  activeText1: {
    color: '#B598CB',
    fontSize: 15,
    fontWeight: '500',
  },
});
