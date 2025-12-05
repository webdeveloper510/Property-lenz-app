import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {BlurView} from '@react-native-community/blur';

type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
};

export default function FilterModal({
    visible,
    onClose,
    onApply,
    onClear,
}: FilterModalProps) {
    const [value, setValue] = useState('last_week');
    const [value1, setValue1] = useState('Move_Out_Inspection');
    console.log('🚀 ~ FilterModal ~ visible:', visible);
    const data = [
        {label: 'Last Week', value: 'last_week'},
        {label: 'Last Month', value: 'last_month'},
        {label: 'Last Quarter', value: 'last_quarter'},
        {label: 'Last Year', value: 'last_year'},
    ];
    const data2 = [
        {label: 'Move-Out Inspection', value: 'Move_Out_Inspection'},
        {label: 'Move-In Inspection', value: 'Move_In_Inspection'},
        {label: 'Periodic Inspection', value: 'Periodic_Inspection'},
        {label: 'General Inspection', value: 'General_Inspection'},
    ];
    return (
        <Modal
            isVisible={visible}
            backdropOpacity={0.4}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            style={{margin: 0, justifyContent: 'center', alignItems: 'center'}}>
            {/* Blurred Background Behind Modal */}
            {/* <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={20} /> */}
            <View style={{...StyleSheet.absoluteFillObject}}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={20}
                />

                {/* Custom theme tint overlay */}
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: 'rgba(154, 70, 219, 0.3)', // #9A46DB + opacity
                    }}
                />
            </View>
            <View style={styles.container}>
                {/* Top Right Close Button */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Image
                        source={require('../assets/icon/filter.png')}
                        style={{width: 15, height: 15}}
                    />
                    {/* <Icon name="filter-outline" size={22} color="#8254F7" /> */}
                </TouchableOpacity>

                <Text style={styles.title}>Filters</Text>
                <Text style={styles.subtitle}>
                    Apply filters to narrow down your inspection results.
                </Text>

                <Text style={styles.sectionLabel}>Inspection Date</Text>
                <View style={{marginTop: 10}}>
                    <Dropdown
                        data={data}
                        value={value}
                        labelField="label"
                        valueField="value"
                        onChange={item => setValue(item.value)}
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        selectedTextStyle={styles.selectedText}
                        itemTextStyle={styles.itemText}
                        activeColor="transparent"
                        placeholder="Select"
                        placeholderStyle={styles.placeholderText}
                        renderItem={item => (
                            <Text
                                style={
                                    item.value === value
                                        ? styles.selectedItemStyle
                                        : styles.itemStyle
                                }>
                                {item.label}
                            </Text>
                        )}
                    />
                </View>
                <Text style={[styles.sectionLabel, {marginTop: 18}]}>
                    Inspection Type{' '}
                    <Text style={{color: '#999'}}>(Optional)</Text>
                </Text>
                <View style={{marginTop: 10}}>
                    <Dropdown
                        data={data2}
                        value={value1}
                        labelField="label"
                        valueField="value"
                        onChange={item => setValue1(item.value)}
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        selectedTextStyle={styles.selectedText}
                        itemTextStyle={styles.itemText}
                        activeColor="transparent"
                        placeholder="Select"
                        placeholderStyle={styles.placeholderText}
                        renderItem={item => (
                            <Text
                                style={
                                    item.value === value
                                        ? styles.selectedItemStyle
                                        : styles.itemStyle
                                }>
                                {item.label}
                            </Text>
                        )}
                    />
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={onClear}>
                        <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={onApply}>
                        <Text style={styles.applyText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '78%',
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 22,
        paddingTop: 35,
        elevation: 10,
        marginTop: 60,
        alignSelf: 'flex-end',
        marginRight: 20,
    },
    closeBtn: {
        position: 'absolute',
        top: -50,
        right: 8,
        height: 44,
        width: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#250959',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 10,
        color: '#250959',
    },
    sectionLabel: {
        marginTop: 18,
        fontSize: 14,
        fontWeight: '600',
        color: '#250959',
    },
    dropdownBox: {
        marginTop: 10,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F1FB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 14,
        color: '#3A3A3A',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 22,
        justifyContent: 'space-between',
    },
    clearButton: {
        borderWidth: 1,
        borderColor: '#9A46DB',
        borderRadius: 25,
        width: '40%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearText: {
        color: '#9A46DB',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#9A46DB',
        borderRadius: 25,
        width: '55%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyText: {
        color: '#fff',
        fontWeight: '600',
    },
    //drop dwon
    dropdown: {
        height: 54,
        borderRadius: 10,
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    dropdownContainer: {
        borderRadius: 12,
        backgroundColor: '#F2F2F2',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    selectedText: {
        fontSize: 15,
        color: '#5E3DB8',
        fontWeight: '600',
    },
    placeholderText: {
        fontSize: 15,
        color: '#777',
    },
    itemStyle: {
        fontSize: 15,
        color: '#444',
        paddingVertical: 8,
    },
    selectedItemStyle: {
        fontSize: 15,
        color: '#5E3DB8',
        fontWeight: '700',
        paddingVertical: 8,
    },
});
