import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { Box } from 'native-base';
import { Dimensions } from 'react-native';
// components
import Settings from '../screens/HomeStack/Settings';
import DetailScreen from '../screens/HomeStack/Details';
import InspectionDetails from '../screens/HomeStack/Inspection/InspectionDetails';
import Areas from '../screens/HomeStack/Inspection/Areas';
import TenantAreas from '../screens/HomeStack/Inspection/TenatAreas';
import CameraScreen from '../screens/HomeStack/Inspection/CameraScreen';
import AddPropertyScreen from '../screens/HomeStack/AddProperty/AddPropertyNew';
import AgreementScreen from '../screens/HomeStack/Inspection/Agreement/Agreement';
import ReviewScreen from '../screens/HomeStack/Inspection/Agreement/Review';
import InspectorSignScreen from '../screens/HomeStack/Inspection/Agreement/InspectorSign';
import TenantSignScreen from '../screens/HomeStack/Inspection/Agreement/TenantSign';
import NewPicture from '../screens/HomeStack/NewPictures/NewPicture';
import NewPictureCamera from '../screens/HomeStack/NewPictures/CameraScreen';
import HomeTab from './HomeTab';
import ProfileScreen from '@/screens/HomeStack/Profile/Profile';
import TenantHome from '../screens/HomeStack/Tenant/index';
import TenantAdd from '../screens/HomeStack/Tenant/add';
import TenantEdit from '../screens/HomeStack/Tenant/edit';
import Timeline from '../screens/HomeStack/Timeline/Timeline';
import QuickPictureShow from '../screens/HomeStack/NewPictures/QuickPictureShow';
import CompletedView from '../screens/HomeStack/Timeline/View';
import CreateTenant from '@/screens/HomeStack/Tenant/createTenant';
import TenantDataEdit from '@/screens/HomeStack/Tenant/TenantEdit';
import AmenitiesAdd from '@/screens/HomeStack/AddProperty/AmenitiesNew';
import AmenitiesEditScreen from '@/screens/HomeStack/AddProperty/AmenitiesEdit';
import InviteTenant from '@/screens/HomeStack/Tenant/Invite';
import SearchScreen from '@/screens/Search/Search';
import AddManagers from './../screens/HomeStack/MyManagers/Add';
import EditManager from './../screens/HomeStack/MyManagers/Edit';
import RecentCompletedScreen from '@/screens/HomeStack/Recently_completed';
import Reportlist from '@/screens/Report/reportlist';
import EditProperty from '@/screens/HomeStack/AddProperty/EditPropertyNew';
import EditSingleProperty from '@/screens/HomeStack/AddProperty/EditSingleProperty';
import Notification from './../screens/HomeStack/Notification';
import ImageZoom from '@/screens/HomeStack/Inspection/Agreement/ImageZoom';
import PropertyListScreen from '@/screens/HomeStack/Propertylist'
import PropertyDetails from '@/screens/HomeStack/PropertyDetails';
import Android from '@/screens/Subscription/Android';
import Ios from '@/screens/Subscription/Ios';
import { Platform } from 'react-native';
import CustomDrawer from '@/components/CustomDrawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
enableScreens(true);


const RootStacks = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function RootStackScreens() {
  return (
    <RootStacks.Navigator screenOptions={{ headerShown: false }}>
    <RootStacks.Screen name="HomeTab" component={HomeTab} options={{title: ('HomeTab'), headerShown: false}} />
      <RootStacks.Screen name="SearchTab" component={SearchScreen} options={{title: ('Search'), headerShown: false}}/>
    <RootStacks.Screen name="AddPropertyScreen" component={AddPropertyScreen} options={{title: ('AddPropertyScreen'), headerShown: false}} />
      <RootStacks.Screen name="DetailsRoot" component={DetailScreen} options={{title: ('Details'), headerShown: false}}/>
      <RootStacks.Screen name="EditRoot" component={EditProperty} options={{title: ('Edit'), headerShown: false}}/>
      <RootStacks.Screen name="EditSingleProperty" component={EditSingleProperty} options={{title: ('Edit'), headerShown: false}}/>
      <RootStacks.Screen name="Settings" component={Settings} options={{title: ('Settings'), headerShown: false}}/>
      <RootStacks.Screen name="InspectionDetails" component={InspectionDetails} options={{title: ('InspectionDetails'), headerShown: false}}/>
      <RootStacks.Screen name="Areas" component={Areas} options={()=>({title: ('Areas'), headerShown: false})}/>
      <RootStacks.Screen name="TenantAreas" component={TenantAreas} options={()=>({title: ('TenantAreas'), headerShown: false})}/>
      <RootStacks.Screen name="Camera" component={CameraScreen} options={{title: ('Camera'), headerShown: false}}/>
      <RootStacks.Screen name="Agreement" component={AgreementScreen} options={{title: ('Agreement'), headerShown: false}}/>
      <RootStacks.Screen name="Review" component={ReviewScreen} options={{title: ('Review'), headerShown: false}}/>
      <RootStacks.Screen name="InspectorSign" component={InspectorSignScreen} options={{title: ('InspectorSign'), headerShown: false}}/>
      <RootStacks.Screen name="TenantSign" component={TenantSignScreen} options={{title: ('TenantSign'), headerShown: false}}/>
      <RootStacks.Screen name="NewPicture" component={NewPicture} options={{title: ('NewPicture'), headerShown: false}}/>
      <RootStacks.Screen name="NewPictureCamera" component={NewPictureCamera} options={{title: ('NewPictureCamera'), headerShown: false}}/>
      <RootStacks.Screen name="TenantHome" component={TenantHome} options={{title: ('TenantHome'), headerShown: false}}/>
      <RootStacks.Screen name="TenantAdd" component={TenantAdd} options={{title: ('TenantAdd'), headerShown: false}}/>
      <RootStacks.Screen name="TenantEdit" component={TenantEdit} options={{title: ('TenantEdit'), headerShown: false}}/>
      <RootStacks.Screen name="Timeline" component={Timeline} options={{title: ('Timeline'), headerShown: false}}/>
      <RootStacks.Screen name="QuickPictureShow" component={QuickPictureShow} options={{title: ('QuickPictureShow'), headerShown: false}}/>
      <RootStacks.Screen name="CompletedView" component={CompletedView} options={{title: ('CompletedView'), headerShown: false}}/>
      <RootStacks.Screen name="CreateTenant" component={CreateTenant} options={{title: ('CreateTenant'), headerShown: false}}/>
      <RootStacks.Screen name="TenantDataEdit" component={TenantDataEdit} options={{title: ('TenantDataEdit'), headerShown: false}}/>
      <RootStacks.Screen name="AmenitiesAdd" component={AmenitiesAdd} options={{title: ('AmenitiesAdd'), headerShown: false}}/>
      <RootStacks.Screen name="AmenitiesEditScreen" component={AmenitiesEditScreen} options={{title: ('AmenitiesEditScreen'), headerShown: false}}/>
      <RootStacks.Screen name="InviteTenant" component={InviteTenant} options={{title: ('InviteTenant'), headerShown: false}}/>
      <RootStacks.Screen name="AddManagers" component={AddManagers} options={{title: ('AddManagers'), headerShown: false}}/>
      <RootStacks.Screen name="EditManager" component={EditManager} options={{title: ('EditManager'), headerShown: false}}/>
      <RootStacks.Screen name="Profile" component={ProfileScreen} options={{title: ('Profile'), headerShown: false}}/>
      <RootStacks.Screen name="Notification" component={Notification} options={{title: ('Notification'), headerShown: false}}/>
      <RootStacks.Screen name="PropertyListScreen" component={PropertyListScreen} options={{title: ('Property List'), headerShown: false}}/>
      <RootStacks.Screen name="PropertyDetails" component={PropertyDetails} options={{title: ('Property Details'), headerShown: false}}/>
      <RootStacks.Screen name="ImageZoom" component={ImageZoom} options={{title: ('ImageZoom'), headerShown: false}}/>
      <RootStacks.Screen name="RecentlyCompleted" component={RecentCompletedScreen} options={{title: ('RecentlyCompleted'), headerShown: false}}/>
      <RootStacks.Screen name="Reportlist" component={Reportlist} options={{title: ('Reportlist'), headerShown: false}}/>
      <RootStacks.Screen name="Subscribe" component={Platform.OS == 'android' ? Android : Ios} options={{title: ('Subscribe'), headerShown: false}}/>
 
      {/* ✅ All your other screens stay here */}
    </RootStacks.Navigator>
  );
}
const RootStack = ({navigation}: any): React.JSX.Element => {

  return (
    <Box style={{height: '100%', paddingBottom: 0}}>
    <NavigationContainer independent = { true }>
     <Drawer.Navigator
        drawerContent={(props:any) => <CustomDrawer {...props} />}
        screenOptions={{
          drawerStyle: { width: Dimensions.get('window').width * 0.8, borderTopRightRadius: 30, borderBottomRightRadius: 30 },
          sceneContainerStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Drawer.Screen name="Root" component={RootStackScreens} options={{ headerShown: false }} />
      </Drawer.Navigator>
  </NavigationContainer>
  </Box>
  );
};

export default RootStack;
