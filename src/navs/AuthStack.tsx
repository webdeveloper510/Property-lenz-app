import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import Home from '@/screens/HomeStack/Home';
import AuthHome from '@/screens/Auth/index';
import Login from '@/screens/Auth/Login';
import TenantLogin from '@/screens/Auth/TenantLogin';
import Register from '@/screens/Auth/Register';
import ForgetPassword from '@/screens/Auth/forgot';
import Android from '@/screens/Subscription/Android';
import Ios from '@/screens/Subscription/Ios';
import { Platform } from 'react-native';
import { Box } from 'native-base';

enableScreens(true);


const AuthStack = createNativeStackNavigator();

const Auth = (): React.JSX.Element => {

  console.log('auth stack-----')
  return (
    <NavigationContainer>
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={Login} options={{title: ('Login'), headerShown: false}}/>
      <AuthStack.Screen name="Home" component={Home} options={{title: ('Welcome'), headerShown: false}} />
      {/* <AuthStack.Screen name="AuthHome" component={AuthHome} options={{title: ('AuthHome'), headerShown: false}}/> */}
      <AuthStack.Screen name="TenantLogin" component={TenantLogin} options={{title: ('TenantLogin'), headerShown: false}}/>
      <AuthStack.Screen name="Register" component={Register} options={{title: ('Register'), headerShown: false}}/>
      <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} options={{title: ('ForgetPassword'), headerShown: false}}/>
      {/* <AuthStack.Screen name="Subscribe" component={Platform.OS == 'android' ? Android : Ios} options={{title: ('Subscribe'), headerShown: false}}/> */}
    </AuthStack.Navigator>
  </NavigationContainer>
  );
};

export default Auth;
