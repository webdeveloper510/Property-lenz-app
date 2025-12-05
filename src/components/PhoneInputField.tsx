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
import CountryPicker, {CountryCode} from 'react-native-country-picker-modal';

const PhoneInputField = ({
    label,
    optional,
    value,
    onChangeText,
    placeholder,
    onCallBack,
    code
}: any) => {
    const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>('US');
    const [showPhoneCountryPicker, setShowPhoneCountryPicker] = useState(false);
    const [callingCode, setCallingCode] = useState('+1');

    const handleCountrySelect = (country: any) => {
        console.log('Selected Country: ', country);

        setPhoneCountryCode(country.cca2);
        setCallingCode(`+${country.callingCode[0]}`);
        onCallBack(`+${country.callingCode[0]}`)
        setShowPhoneCountryPicker(false);
    };

     useEffect(()=>{
     onCallBack(callingCode)
     },[])
    return (
        <View style={styles.MainContainer}>
            <Text
                style={{
                    position: 'absolute',
                    paddingLeft: 54,
                    paddingTop: 5,
                    fontSize: 10,
                    color: '#250959',
                    fontFamily: 'Gilroy',
                    fontWeight: '400',
                }}>
               {label}
            </Text>
            {/* FLAG + CODE BUTTON */}
            <View style={{flexDirection: 'row', marginTop: 12}}>
                <TouchableOpacity
                    onPress={() => setShowPhoneCountryPicker(true)}
                    style={styles.flagContainer}>
                    {/* COUNTRY FLAG */}
                    <CountryPicker
                        countryCode={phoneCountryCode}
                        withFlag
                        withCallingCodeButton={false}
                        withCountryNameButton={false}
                        withFilter
                        visible={showPhoneCountryPicker}
                        onSelect={handleCountrySelect}
                        onClose={() => setShowPhoneCountryPicker(false)}
                        containerButtonStyle={{width: 30}}
                    />

                    {/* CALLING CODE */}
                    <Text style={styles.codeText}>{callingCode}</Text>
                </TouchableOpacity>

                {/* PHONE NUMBER INPUT */}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={'gray'}
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
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
        // flexDirection: 'row',
        // alignItems: 'center',
        paddingHorizontal: 15,
    },

    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },

    codeText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#250959',
        fontWeight: '600',
    },

    input: {
        flex: 1,
        // fontSize: 15,
        color: '#250959',
        fontWeight: '500',
        fontFamily:"Gilroy",
    },
});

export default PhoneInputField;
