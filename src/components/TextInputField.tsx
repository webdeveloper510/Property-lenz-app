import React, {useEffect, useState} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
} from 'react-native';
import {style} from 'styled-system';

const TextInputField = ({
    placeholder,
    value,
    isEye,
    url,
    label,
    onChangeText,
    secureTextEntry,
    onClick,
    isDisable,
    rightIcon,
    optional,
    keyboardType,
    uppercase,
}: any): React.JSX.Element => {
    return (
        <View style={styles.MainContainer}>
            <View
                style={{
                    width: '15%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Image
                    source={url}
                    style={{width: 19, height: 19}}
                    resizeMode="contain"
                />
            </View>
            <View style={{width: '70%'}}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.labelStyle}>{label} </Text>
                    {optional && (
                        <Text
                            style={[
                                styles.labelStyle,
                                {color: '#9A46DB'},
                            ]}>{`(${optional})`}</Text>
                    )}
                </View>
                <TextInput
                    style={styles.inputStyle}
                    placeholder={placeholder}
                    onChangeText={onChangeText}
                    placeholderTextColor={'gray'}
                    secureTextEntry={secureTextEntry}
                    value={
                        uppercase
                            ? (value ?? '').toUpperCase()
                            : (value ?? '').replace(/_/g, ' ')
                    }
                    editable={!isDisable}
                    maxLength={30}
                    keyboardType={keyboardType ? 'numeric' : 'default'}
                />
            </View>
            {isEye && (
                <TouchableOpacity style={{width: '10%'}} onPress={onClick}>
                    <Image
                        source={rightIcon}
                        style={{width: 19, height: 19}}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    MainContainer: {
        width: '90%',
        height: 66,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 70,
        marginVertical: 10,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelStyle: {
        fontSize: 10,
        color: '#250959',
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
    inputStyle: {
        backgroundColor: '#fff',
        height: 40,
        fontFamily: 'Gilroy',
        fontWeight: '600',
        color: '#250959',
    },
});
export default TextInputField;
