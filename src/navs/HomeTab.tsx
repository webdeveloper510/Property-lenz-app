/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import {StyleSheet, Image, Pressable} from 'react-native';
import {Box} from 'native-base';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import CalendarScreen from '@/screens/Calendar/Calendar';
import ReportScreen from '@/screens/Report/index';
import UserScreen from '@/screens/HomeStack/MyManagers/MyManager';
import HomeNew from '@/assets/icon/homenew.png';
import CalNew from '@/assets/icon/calendarnew.png';
import ReportNew from '@/assets/icon/reports.png';
import PlusNew from '@/assets/icon/plusmark.png';
import UserNew from '@/assets/icon/user.png';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import {setSideBar} from '@/state/propertyDataSlice';
import CustomTabBar from '@/components/CustomTabBar';
const TabStacks = createBottomTabNavigator();

const HomeTab = ({navigation}: any): React.JSX.Element => {
    const userData: any = useAppSelector(state => state.auth.userData);
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const dispatch = useAppDispatch();

    return (
        <>
            <TabStacks.Navigator
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}>
                <TabStacks.Screen
                    name="HomeStack"
                    component={HomeStack}
                    options={{
                        title: 'HomeStack',
                        tabBarLabel: 'Home',
                        headerShown: false,
                    }}
                />
                <TabStacks.Screen
                    name="CalendarTab"
                    component={CalendarScreen}
                    options={{
                        title: 'Calendar',
                        tabBarLabel: 'Calendar',
                        headerShown: false,
                    }}
                    screenOptions={{
                        tabBarStyle: {
                            paddingRight: 20, // entire tab bar padding
                            // paddingLeft: 20,
                        },
                    }}
                />
                {userData?.type === 'OWNER' ? (
                    <>
                        <TabStacks.Screen
                            name="AddTab"
                            component={HomeStack}
                            options={{
                                title: 'Add',
                                tabBarShowLabel: false,
                                headerShown: false,
                            }}
                        />
                        <TabStacks.Screen
                            name="ReportsTab"
                            component={ReportScreen}
                            options={{
                                title: 'Report',
                                tabBarLabel: 'Reports',
                                headerShown: false,
                            }}
                        />
                        <TabStacks.Screen
                            name="Manager"
                            component={UserScreen}
                            options={{
                                title: 'Manager',
                               tabBarLabel: 'Users',
                                headerShown: false,
                            }}
                        />
                    </>
                ) : (
                    userData?.type === 'MANAGER' && (
                        <>
                            <TabStacks.Screen
                                name="AddTab"
                                component={HomeStack}
                                options={{
                                    title: 'Add',
                                    tabBarShowLabel: false,
                                    headerShown: false,
                                }}
                            />
                            <TabStacks.Screen
                                name="ReportsTab"
                                component={ReportScreen}
                                options={{
                                    title: 'Report',
                                    tabBarShowLabel: false,
                                    headerShown: false,
                                }}
                            />
                            <TabStacks.Screen
                                name="Manager"
                                component={UserScreen}
                                options={{
                                     tabBarLabel: 'Users',
                                    tabBarShowLabel: false,
                                    headerShown: false,
                                }}
                            />
                        </>
                    )
                )}
            </TabStacks.Navigator>
        </>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'transparent',
    },
    tabIcon: {
        maxHeight: 20,
        maxWidth: 20,
    },
    shadow: {
        zIndex: 5,
        height: 5,
        width: '100%',
        position: 'absolute',
        bottom: 75,
        elevation: 3,
        backgroundColor: 'rgba(1,161,240,0.9)',
    },
});

export default HomeTab;
