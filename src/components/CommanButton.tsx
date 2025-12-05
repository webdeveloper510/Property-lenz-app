import React, {useEffect, useState} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
    ActivityIndicator,
} from 'react-native';
import {width} from 'styled-system';

const CommanButton = ({
    label,
    onCkick,
    isLoading,
    width,
    color,
    titleColor,
    height
}: any): React.JSX.Element => {
    return (
        <TouchableOpacity
            style={[styles.MainContainer, {width: width ? width : '90%',backgroundColor:color ? color :'#9A46DB',height:height ? height : 66}]}
            onPress={onCkick}>
            {isLoading ? (
                <ActivityIndicator size={'small'} color={'#ffffff'} />
            ) : (
                <Text style={[styles.labelStyle,{color:titleColor ? titleColor :'#ffffff'}]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    MainContainer: {
        width: '90%',
        height: 66,
        alignSelf: 'center',
        backgroundColor: '#9A46DB',
        borderRadius: 70,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9A46DB80',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 6,

        // ✅ Shadow for Android
        elevation: 6,
    },
    labelStyle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
});
export default CommanButton;
