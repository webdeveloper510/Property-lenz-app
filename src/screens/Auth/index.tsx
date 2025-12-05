import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Image, Button, VStack, Stack } from 'native-base';
import Logo from '@/assets/logo/Logo.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/state/hooks';
import { useIsFocused } from '@react-navigation/native';

const AuthHome = ({ navigation }: any): React.JSX.Element => {
    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])

    console.log('AuthHome', {isFocused, loading})

    if (loading) {
        return (<></>);
    }

    return (
        <VStack justifyContent={'space-between'} style={styles.mainContainer}>
            <SafeAreaView>
                <Stack space={100} style={{ marginTop: 150 }}>
                    <Image source={Logo} mx={'auto'} style={styles.logo} alt="logo" />
                    <VStack space={5} >
                        <Button style={styles.button} size={'lg'} onPress={() => { navigation.navigate('Login'); }} >I am a Manager</Button>
                        <Button style={styles.button} size={'lg'} onPress={() => { navigation.navigate('TenantLogin'); }} >I am a Renter</Button>
                    </VStack>
                </Stack>
            </SafeAreaView>
            <Text bold color={'my.tf'} style={styles.footer} mb={1} mx={'auto'}>PropertyLenz2024</Text>
        </VStack>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        padding: 20,
        minHeight: '100%',
    },
    logo: {
        height: 75,
        width: '85%',
        resizeMode: 'stretch',
    },
    button: {
        height: 55,
        width: '80%',
        alignSelf: 'center',
        borderRadius: 10,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 113, 188,0.9)',
    },
    footer: {
        alignSelf: 'center',
        color: 'rgba(153, 153, 153, 1.0)',
    },
});

export default AuthHome;
