import React from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    useWindowDimensions,
    Text,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Svg, {Path} from 'react-native-svg';
import {useAppSelector, useAppDispatch} from '@/state/hooks';
import HomeNew from '@/assets/icon/homenew.png';
import HomeFill from '@/assets/icon/home_fill.png';
import CalNew from '@/assets/icon/calendarnew.png';
import CalNew2 from '@/assets/icon/calender_5.png';
import ReportNew from '@/assets/icon/reports.png';
import Report1 from '@/assets/icon/report_5.png';
import PlusNew from '@/assets/icon/plus.png';
import CloseIcon from '@/assets/icon/close_2.png';
import UserNew from '@/assets/icon/role.png';
import {setSideBar} from '@/state/propertyDataSlice';
import {useNavigation} from '@react-navigation/native';
const {width} = Dimensions.get('window');
const height = 100; // tab bar height
const curveHeight = 40; // curve depth

const CustomTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
    const dispatch = useAppDispatch();
    const sideBarStatus: boolean = useAppSelector(
        state => state.property.sideBar,
    );
    const {width} = useWindowDimensions();
    const tabBarHeight = 80; // Adjust as needed
    const curveRadius = 30; // Adjust for the desired curve depth
    const centerButtonWidth = 60; // If you have a center button

    // Create the top curve path

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/icon/bottombar.png')}
                style={{
                    width: width,
                    height: tabBarHeight,
                    resizeMode: 'stretch',
                    position: 'absolute',
                    top: -22,
                }}
            />

            <View style={styles.tabContainer}>
                {state.routes.map((route, index) => {
                    const {options} = descriptors[route.key];
                    const label =
                        options.tabBarLabel ?? options.title ?? route.name;

                    const isFocused = state.index === index;
                    console.log('🚀 ~ CustomTabBar ~ isFocused:', isFocused);
                    let iconSource;

                    switch (route.name) {
                        case 'HomeStack':
                            iconSource = isFocused ? HomeFill : HomeNew;
                            break;
                        case 'CalendarTab':
                            iconSource = isFocused ? CalNew : CalNew2;
                            break;
                        case 'ReportsTab':
                            iconSource = isFocused ? ReportNew : Report1;
                            break;
                        case 'Manager':
                            iconSource = UserNew;
                            break;
                        default:
                            iconSource = HomeNew;
                    }

                    const onPress = () => {
                        if (route.name === 'AddTab') return;
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Center Add (+) Button
                    if (route.name === 'AddTab') {
                        return (
                            <TouchableOpacity
                                key={route.key}
                                style={styles.plusButton}
                                onPress={() =>
                                    dispatch(setSideBar(!sideBarStatus))
                                }>
                                <Image
                                    source={
                                        !sideBarStatus ? PlusNew : CloseIcon
                                    }
                                    style={styles.plusIcon}
                                    tintColor={'#9A46DB'}
                                />
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={
                                isFocused ? {selected: true} : {}
                            }
                            accessibilityLabel={
                                options.tabBarAccessibilityLabel
                            }
                            testID={options.tabBarTestID}
                            onPress={() => {
                                if (route.name !== 'AddTab') {
                                    if (sideBarStatus) {
                                        dispatch(setSideBar(false)); // 👉 close sidebar
                                    }
                                }

                                onPress();
                            }}
                            style={[
                                styles.tabButton,

                                // Detect index of AddTab
                                index ===
                                state.routes.findIndex(
                                    r => r.name === 'AddTab',
                                ) -
                                    1
                                    ? {marginRight: 35} // left item padding
                                    : null,

                                index ===
                                state.routes.findIndex(
                                    r => r.name === 'AddTab',
                                ) +
                                    1
                                    ? {marginLeft: 35} // right item padding
                                    : null,
                            ]}>
                            <Image
                                source={iconSource}
                                style={[
                                    styles.icon,
                                    isFocused && {tintColor: 'white'},
                                ]}
                            />

                            <Text
                                style={{
                                    fontSize: 12,
                                    color: isFocused ? '#ffffff' : '#CA88FD',
                                    padding: 5,
                                }}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 90,
        alignItems: 'center',
        backgroundColor: '#9A46DB',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        shadowColor: '#000',
    },
    svg: {
        position: 'absolute',
        top: 0, // curve at top
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height,
        width: '100%',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: '#EDE7F6',
    },
    plusButton: {
        position: 'absolute',
        bottom: 9, // distance from bottom of screen
        left: width / 2 - 29, // center horizontally (70 / 2)
        backgroundColor: '#ffff',
        width: 60,
        height: 60,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 0,
        top: -15, // raise the button above the tab bar
    },
    plusIcon: {
        width: 28,
        height: 28,
        tintColor: 'white',
    },
});

export default CustomTabBar;
