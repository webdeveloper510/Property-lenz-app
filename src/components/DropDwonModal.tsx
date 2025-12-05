import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    FlatList
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {BlurView} from '@react-native-community/blur';

type FilterModalProps = {
    visible: boolean;
    isRanter: boolean;
    label: string;
    placeholder: string;
    listType: string;
    data: [];
    onClose: () => void;
    onCreate: () => void;
    onClear: () => void;
    onSelect:() => void;
};

export default function DropDwonModal({
    visible,
    onClose,
    onCreate,
    onClear,
    isRanter,
    label,
    placeholder,
    listType,
    data,
    onSelect
}: FilterModalProps) {
    const [value, setValue] = useState('last_week');
    const [value1, setValue1] = useState('Move_Out_Inspection');
    console.log('🚀 ~ FilterModal ~ visible:', isRanter);
    const namesData = [
        {id: '1', name: 'Amelia Whitmore'},
        {id: '2', name: 'Henry Pembroke'},
        {id: '3', name: 'Eleanor Fairchild'},
        {id: '4', name: 'Thomas Carrington'},
    ];
    interface item {
        id:string,
        name:string
    }
    const renderItem = ({ item }:{item:item}) => (
    <TouchableOpacity style={styles.itemContainer} onPress={()=> {onSelect(item),onClose()}}>
        {
                    isRanter ?(

                        <Text style={styles.nameText}>{item.tenant_first_name} {item.tenant_last_name}</Text>
                    ) :(
                       <Text style={styles.nameText}>{item.first_name} {item.last_name}</Text> 
                    )

        }
    </TouchableOpacity>
  );
    return (
        <Modal
            isVisible={visible}
            // backdropOpacity={0.1}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            style={{margin: 0, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{flex:1,backgroundColor:'rgba(82,60,121,0.85)'}}>
            {/* Blurred Background Behind Modal */}
            {/* <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={20} /> */}
            <TouchableOpacity
                style={styles.dropdownView}
                activeOpacity={0.8}
                onPress={() => onClose()}>
                <Text style={styles.label}>{label}</Text>

                <View style={styles.row}>
                    <Text style={styles.valueText}>{placeholder}</Text>

                    <Image
                        source={require('../assets/icon/up_dwon.png')} // change your icon path
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>
            <View style={styles.container}>
                {/* Top Right Close Button */}

                <Text style={styles.title}>{label} List</Text>
                <View
                    style={{
                        width: '100%',
                        height: 2,
                        backgroundColor: '#B598CB',
                        marginVertical: 10,
                    }}
                />

                <FlatList
                    data={data} // The source array of data
                    renderItem={renderItem} // The function to render each item
                    keyExtractor={item => item.id} // A unique key for performance
                />

                {/* Buttons */}
                {/* {
                    isRanter && 
                     <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={onCreate}>
                        <Image
                            style={{width: 11, height: 11, marginRight: 10}}
                            source={require('../assets/icon/plus.png')}
                        />

                        <Text style={styles.clearText}>Add Renter</Text>
                    </TouchableOpacity>
                </View>
                } */}
               
            </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 22,
        paddingTop: 35,
        elevation: 10,
        alignSelf: 'center',
        marginTop: 10,
        height: '40%',
        // alignContent:'center'
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
        fontSize: 10,
        fontWeight: '600',
        color: '#9A46DB',
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
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#9A46DB',
        borderRadius: 25,
        width: '45%',
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
        backgroundColor: '#F3F1FB',
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
    dropdownView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginHorizontal: 10,
        marginTop: 100,
        elevation: 10,
        alignSelf: 'center',
    },
    label: {
        fontSize: 10,
        color: '#250959',
        marginBottom: 4,
        fontWeight: '400',
        fontFamily: 'Gilroy-Regular',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        color: '#250959',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Gilroy-SemiBold',
    },
    icon: {
        width: 10,
        height: 10,
        tintColor: '#250959',
        position: 'absolute',
        right: 0,
        top: -12,
    },
    itemContainer: {
    padding: 10,
    marginVertical: 4,
    // Add styling similar to the image's appearance (e.g., color, size)
  },
  nameText: {
    fontSize: 14,
    color: '#250959', // A deep purple color similar to the image
    fontWeight: '500',
  },
});
