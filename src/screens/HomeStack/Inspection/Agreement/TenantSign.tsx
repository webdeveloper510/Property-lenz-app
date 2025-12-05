import React, {useRef, useState} from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import {Text, Box, Image, HStack, Button, Alert} from 'native-base';
import BackIcon from '@/assets/icon/btnBack.png';
// https://www.npmjs.com/package/react-native-signature-capture
import SignatureCapture from 'react-native-signature-capture';
import {useRoute} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {setTenantSign} from '@/state/propertyDataSlice';
import {SafeAreaView} from 'react-native';
import {apiRenterSign} from '@/apis/property';
import {warningTimer} from '@/constant/customHooks';
import cacheService from '@/services/CacheServices';
import CommanButton from '@/components/CommanButton';
import { showLoader,hideLoader } from '@/state/loaderSlice';
interface Canvas {
    encoded: string;
    pathName: string;
}

const TenantSign = ({navigation}: any): React.JSX.Element => {
    const inspectionData: any = useAppSelector(
        state => state.property.inspection,
    );
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const canvasRef: any = useRef();
    const dispatch = useAppDispatch();
    let imgData: any = null;

    const route = useRoute();
    const insId = route.params;

    const save = async (data: Canvas) => {
        try {
             dispatch(showLoader())
            setErrMsg('');
            await warningTimer(2);
            const res = await fetch(
                Platform.OS === 'ios'
                    ? data.pathName
                    : `file://${data.pathName}`,
            );
            const image = await res.blob();
            const File = {
                name: 'img.jpg',
                type: image.type,
                size: image.size,
                uri:
                    Platform.OS === 'ios'
                        ? data.pathName
                        : `file://${data.pathName}`,
            };

            let dataToSend = {
                id: inspectionData?.id,
                tenant_sign: File.uri,
            };
            const response = await apiRenterSign({
                id: inspectionData?.id,
                tenant_sign: File,
            });
            console.log('res: ', response);
            setLoading(false);

            if (response.status) {
                dispatch(hideLoader())
                dispatch(
                    setTenantSign({path: data.pathName, data: data.encoded}),
                );
                await cacheService.cacheUpdate('apiRenterSign', dataToSend);
                setTimeout(() => {
                    navigation.goBack(null);
                }, 1000);
            } else {
                setErrMsg(response.message);
            }
        } catch (e) {
         dispatch(hideLoader())
            console.log('Error in save image', e);
            setLoading(false);
            setErrMsg('Unable to save sign, Please try again!');
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.mainContainer}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        justifyContent: 'space-between',
                        marginTop: Platform.OS === 'ios' ? 0 : 30,
                    }}>
                    <TouchableOpacity
                        style={styles.backIcon}
                        onPress={() => {
                            navigation.goBack(insId);
                        }}>
                        <Image
                            alt="back"
                            source={require('../../../../assets/icon/back.png')}
                            resizeMode="contain"
                            style={{width: 14, height: 14}}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 18,
                            color: '#250959',
                            fontWeight: '700',
                        }}>
                        Renter Signature
                    </Text>
                    <View style={{width: 40}}></View>
                </View>
                {/* <SafeAreaView>
				<HStack mb={5} height={50} alignItems={'center'}>
					<Pressable onPress={() => { navigation.navigate('Agreement', insId); }}>
						<Image source={BackIcon} alt="Back" style={styles.backIcon} />
					</Pressable>
					<Text bold fontSize={'3xl'} ml={3} mb={1} color={'my.h4'} >Renter Signature</Text>
				</HStack>
			</SafeAreaView> */}
               
                {errMsg && errMsg != '' ? (
                    <Alert w="100%" status={'danger'} mt={3} mb={1}>
                        <Text fontSize="md" color={'red.500'}>
                            {errMsg}
                        </Text>
                    </Alert>
                ) : null}
                <Box style={styles.signature}>
                    <SignatureCapture
                        style={{flex: 0.9, width: '100%'}}
                        onSaveEvent={(data: Canvas) => {
                            imgData == null ? save(data) : null;
                        }}
                        // backgroundColor="#dbeaff"
                        ref={canvasRef}
                        strokeColor="#000000"
                        minStrokeWidth={4}
                        maxStrokeWidth={4}
                        showTitleLabel={false}
                        showBorder={false}
                        showNativeButtons={false}
                        rotateClockwise={false}
                        viewMode={'portrait'}
                        saveImageFileInExtStorage={true}
                    />
                </Box>
				  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:60}}>
				<CommanButton
				label={"Save"}
				width={"45%"}
				onCkick={()=>{
					  if (canvasRef && canvasRef.current) {
                                canvasRef.current.saveImage();
                            } else {
                                console.log('canvasRef is null');
                            }
				}}
				/>
				<CommanButton
				label={"Reset"}
				width={"45%"}
				onCkick={()=>{
					  if (canvasRef && canvasRef.current) {
                                canvasRef.current.resetImage();
                            } else {
                                console.log('canvasRef is null');
                            }
				}}
				/>
			  </View>
				
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#F2F2F2',
        minHeight: '100%',
        flex: 1,
        marginHorizontal: 15,
    },
   backIcon: {
        height: 50,
        width: 50,
        // marginTop: 20,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        elevation: 3,
    },
    signature: {
        flex: 1,
        width: '100%',
        // transform: 'rotate(-90deg)'
    },
    buttonStyle: {
        height: 40,
        width: 80,
        backgroundColor: 'rgba(0, 113, 188,0.9)',
        marginBottom: 10,
    },
});

export default TenantSign;
