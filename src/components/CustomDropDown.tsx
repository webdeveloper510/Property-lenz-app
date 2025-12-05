import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    Dimensions,
    Image
} from 'react-native';

// You might need an external library for icons, but we'll use simple text here.
// import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

// --- Component Definition ---

/**
 * Props:
 * @param {string} label - The label displayed above the dropdown.
 * @param {Array<{label: string, value: any}>} data - The list of options.
 * @param {string | null} value - The currently selected value (e.g., 'red', 'green').
 * @param {string} placeholder - Text shown when no value is selected.
 * @param {(value: any, label: string) => void} onSelect - Callback function when an item is selected.
 */
const CustomDropdown = ({
    label,
    data,
    value,
    placeholder = 'Select an option',
    onSelect,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Find the currently selected label based on the value prop
    const selectedItem = data.find(item => item.value === value);
    const selectedLabel = selectedItem ? selectedItem.label : placeholder;

    const toggleDropdown = () => setIsVisible(!isVisible);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.option}
            onPress={() => {
                onSelect(item.value, item.label);
                setIsVisible(false); // Close dropdown on selection
            }}
        >
            <Text style={styles.optionText}>{item.label}</Text>
        </TouchableOpacity>
    );

    // Render the list of options inside a Modal
    const renderDropdown = () => {
        return (
            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={toggleDropdown}
            >
                {/* Tappable overlay to dismiss the modal */}
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={toggleDropdown}
                >
                    <View style={styles.dropdown}>
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={item => item.value.toString()}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
            >  

                <Image
             source={require('../assets/icon/home_2.png')}
             style={{width:19,height:19,resizeMode:'contain',marginLeft:15}}
             
            />
            <View style={{marginLeft:16,marginTop:3,width:'70%'}}>
                <Text style={styles.labelStyle}>{label}</Text>
                <Text style={[styles.selectedText, selectedItem ? styles.selected : styles.placeholder]}>
                    {selectedLabel}
                </Text>
                </View>
                {/* Simple Down Arrow (could be an Icon component) */}
                <Image
                source={require('../assets/icon/drop_2.png')}
                style={{width:19,height:19,resizeMode:'contain'}}
                />
            </TouchableOpacity>

            {/* Render the Modal */}
            {renderDropdown()}
        </View>
    );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
    container: {
        width: screenWidth * 0.9,
        marginBottom: 20,
        alignSelf: 'center',
    },
     labelStyle: {
        fontSize: 10,
        color: '#250959',
        fontFamily: 'Gilroy',
        fontWeight: '400',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    dropdownButton: {
        width:'90%',
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
         borderRadius: 70,
        // padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        minHeight: 66,
        alignSelf:'center',
        
    },
    selectedText: {
        fontSize: 14,
        flex: 1,
        color:'#250959',
        paddingTop:8
        // Allows text to take up most space
    },
    placeholder: {
        color: '#999',
    },
    selected: {
        color: '#333',
    },
    arrowIcon: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
    // Modal Styles
    overlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdown: {
        width: screenWidth * 0.8,
        maxHeight: 300, // Limit height to make it scrollable
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 5,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
});
export default CustomDropdown;
// --- Usage Example ---

