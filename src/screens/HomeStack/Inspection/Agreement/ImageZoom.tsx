import React from 'react';
import { Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Box, Image } from 'native-base';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ImageViewer from 'react-native-image-zoom-viewer';
// icons
import BackIcon from '@/assets/icon/close.png';

const ImageZoom = ({ navigation }: any): React.JSX.Element => {
    const route = useRoute();
    const RoutePrams: any = route.params;

    return (
        <Box style={styles.mainContainer}>
            <SafeAreaView>
                    <Pressable onPress={() => { navigation.goBack(null); }}>
                        <Box style={styles.box}>
                        <Image source={BackIcon} alt="Back" style={styles.backIcon} />
                        </Box>
                    </Pressable>
            </SafeAreaView>
                    <ImageViewer style={{zIndex: -1}} imageUrls={[{ url: RoutePrams, props: {} }]} />
            </Box>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        height: hp('100%'),
        backgroundColor: 'black',
    },
    box:{
        position: 'relative',
        top: 20,
        right: 20,
        alignSelf:'flex-end',
        width: 45,
        padding: 2,
        backgroundColor: '#fff',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        height: 40,
        width: 40,
        resizeMode: 'stretch',
    },
});
export default ImageZoom;
