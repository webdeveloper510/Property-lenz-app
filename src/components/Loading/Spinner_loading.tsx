import React from 'react';
import { StyleSheet,View,ImageBackground,StatusBar } from 'react-native';

interface alert {
  show?: boolean;
  msg?: string;
  error?: boolean;
}



const Spinner_Loading = ({ show, msg, error }: alert): React.JSX.Element => {
  return (
    <>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ImageBackground source={require('../../assets/logo/Splash.png')} resizeMode="cover" style={styles.container}>

        </ImageBackground>
        </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spin: {
    alignSelf: 'center',
  },
});

export default Spinner_Loading;
