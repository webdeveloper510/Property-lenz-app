import React, {useState} from 'react';
import {Image} from 'react-native';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Example icon library
import {style} from 'styled-system';

// Sample data for the address list
const addressSuggestions = [
    {
        id: 1,
        name: 'Maplewood Apartments',
        address: '1234 Main Street Springfield, IL, 62704 U...',
    },
    {
        id: 2,
        name: 'Evergreen Terrace Homes',
        address: '742 Evergreen Terrace Los Angeles, CA...',
    },
    {
        id: 3,
        name: 'Parkview Office Tower',
        address: '55 Park Avenue New York, NY 10016 USA...',
    },
    {
        id: 4,
        name: 'Lakeside Residences',
        address: '8900 Riverbend Drive Austin, TX 78746...',
    },
    // Add more as needed
];

// Component for a single address item
interface AddressItemProps {
    id: number;
    name: string;
    address: string;
    isSelected: boolean;
    onPress?: () => void;
}

const AddressItem: React.FC<AddressItemProps> = ({
    name,
    address,
    isSelected,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.addressItemContainer} onPress={onPress}>
            <View>
                <Text style={styles.addressItemName}>{name}</Text>
                <View style={{width: '93%'}}>
                    <Text style={styles.addressItemAddress}>{address}</Text>
                </View>
            </View>
            {isSelected && (
                <Image
                    source={require('../assets/icon/tick.png')}
                    style={{width: 10, height: 10}}
                    resizeMode="contain"
                />
            )}
        </TouchableOpacity>
    );
};

const AddressSelector = ({onClose, data, initialSelectedIds = []}) => {
    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedAddresses, setSelectedAddresses] =
        useState<number[]>(initialSelectedIds);

    // A simple filter function for the suggestions (not shown in the image, but useful)
    const filteredSuggestions = data.filter(
        item =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.address.toLowerCase().includes(searchText.toLowerCase()),
    );

    const handleAddressSelect = (item: any) => {
        setSelectedAddresses(
            prev =>
                prev.includes(item.id)
                    ? prev.filter(id => id !== item.id) // remove
                    : [...prev, item.id], // add
        );
    };
    return (
        // The main container that mimics the modal/popup structure
        <SafeAreaView style={styles.overlay}>
            <View style={styles.propertyInputWrapper}>
                <View>
                    <Text style={styles.propertyInputLabel}>
                        Property 1.Address
                    </Text>
                    <TextInput
                        style={styles.propertyInput}
                        placeholder="Choose Address..."
                        editable={false}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => onClose(selectedAddresses)}
                    style={{
                        width: 60,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                    }}>
                    <Image
                        source={require('../assets/icon/up_dwon.png')}
                        style={{width: 12, height: 12, marginRight: 10}}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.popupContainer}>
                {/* Top Header/Input Mimicking the main form */}

                {/* Search Bar Section */}
                <View style={styles.searchBarContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search here..."
                        value={searchText}
                        onChangeText={setSearchText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {/* A small purple magnifying glass is visible on the right in the image */}
                    <Image
                        source={require('../assets/icon/search_3.png')}
                        style={styles.searchButtonIcon}
                    />
                </View>

                {/* Address List Section */}
                <ScrollView style={styles.listContainer}>
                    {filteredSuggestions.map((item, index) => (
                        <AddressItem
                            key={index}
                            name={item.name}
                            address={item.location}
                            isSelected={selectedAddresses.includes(item.id)}
                            onPress={() => handleAddressSelect(item)}
                        />
                    ))}
                    {/* Add a little padding at the bottom for scroll view */}

                    <View style={{height: 20}} />
                </ScrollView>
                <TouchableOpacity style={styles.DoneButton} onPress={() => onClose(selectedAddresses)}>
                    <Text style={{color: '#ffffff'}}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
// ... (Component code above)

const styles = StyleSheet.create({
    // --- Main Structure Styles (Mimicking the popup/modal) ---
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken the background
        justifyContent: 'center', // Aligns the popup to the bottom
        // Use the purple background color from the image for the surrounding elements
        // In a real app, this would be the main screen's style
        // For this example, we keep it simple by just focusing on the white popup
    },
    popupContainer: {
        width: '80%',
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingTop: 10,
        maxHeight: '70%', // Adjust height as needed
        // Shadow properties for iOS/Android to match the floating look
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },

    // --- Property Input (The 'Choose Address...' box) ---
    propertyInputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee', // A light grey border
        padding: 10,
        marginBottom: 15,
        // Add margin/padding to match the floating box style
        marginHorizontal: -5, // Slight horizontal expansion
        marginTop: 5,

        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    propertyInputLabel: {
        fontSize: 12,
        color: '#250959',
        marginBottom: 5,
        fontFamily: 'Goliryh-Regular',
    },
    propertyInput: {
        fontSize: 16,
        color: '#250959',
        padding: 0,
    },

    // --- Search Bar Styles ---
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff', // Light grey background for the search field
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
        height: 45,
        borderBottomWidth: 1,
        borderColor: '#B598CB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
        color: '#9A46DB',
    },
    searchButtonIcon: {
        // This is the little purple magnifying glass on the right
        width: 20,
        height: 20,
    },

    // --- Address List Styles ---
    listContainer: {
        height: 260, // Fixed height for the scrollable area
    },
    addressItemContainer: {
        paddingVertical: 8, // Thin separator line
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressItemName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#250959',
        marginBottom: 2,
    },
    addressItemAddress: {
        fontSize: 10,
        color: '#9A46DB',
        fontWeight: '400',
    },
    DoneButton: {
        alignSelf: 'center',
        width: 80,
        height: 40,
        marginVertical: 10,
        backgroundColor: '#9A46DB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
});

export default AddressSelector;
// ... (Styles section below)
