import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import Home from '@/screens/HomeStack/Home';
import Details from '@/screens/HomeStack/Details';
import { Box } from 'native-base';

enableScreens(true);


const HomeStacks = createNativeStackNavigator();

const HomeStack = ({navigation}: any): React.JSX.Element => {

  return (
    <Box style={{height: '100%', paddingBottom: 0}}>
    <>
    <HomeStacks.Navigator initialRouteName="Home" >
      <HomeStacks.Screen name="Home" component={Home} options={{title: ('Welcome'), headerShown: false}} />
      <HomeStacks.Screen name="Details" component={Details} options={{title: ('Details'), headerShown: false}}/>
    </HomeStacks.Navigator>
  </>
  </Box>
  );
};

export default HomeStack;
