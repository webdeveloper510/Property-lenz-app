import React, {useEffect, useState} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    BackHandler
} from 'react-native';

const BackButton = ({navigation,isLogin}: any): React.JSX.Element => {
    return (
        <TouchableOpacity
            style={styles.backIcon}
            onPress={() => {
                isLogin ? BackHandler.exitApp() :
                navigation.goBack(null);
            }}>
            <Image
                alt="back"
                source={require('../assets/icon/back.png')}
                resizeMode="contain"
                style={{width: 14, height: 14}}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
 	backIcon: {
		height: 50,
		width: 50,
		backgroundColor: '#ffffff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 50,
		elevation: 3,
	},
});
export default BackButton;
