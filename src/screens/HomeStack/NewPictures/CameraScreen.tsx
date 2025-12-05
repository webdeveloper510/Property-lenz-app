import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
// https://www.npmjs.com/package/react-native-permissions
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
// https://www.npmjs.com/package/react-native-image-picker
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// https://www.npmjs.com/package/react-native-fs
import RNFS from 'react-native-fs';
// https://www.npmjs.com/package/react-native-photo-editor
// example    https://codesandbox.io/s/react-native-mobile-forked-fl4z4c?file=/src/App.js
import PhotoEditor from 'react-native-photo-editor';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
// import { useCameraDevice, Camera, useCameraPermission, CameraPermissionStatus } from 'react-native-vision-camera';

const CameraScreen = ({ navigation }: any): React.JSX.Element => {
  // const { hasPermission, requestPermission } = useCameraPermission();
  // const camera = useRef<Camera>(null);
  // const device: any = useCameraDevice('back');
  // const [showCamera, setShowCamera] = useState(true);
  const photoPath = RNFS.DocumentDirectoryPath + '/photo.jpg';

  const route = useRoute();
  const pId = route.params;

  const addUpdateImage = async (value: any) =>{
    const result = await fetch(Platform.OS === 'ios' ? value.replace('file://', '') : `file://${value}`);
    const photo = await result.blob();
    const picData = {
      name: 'img.jpg',
      type: photo.type,
      size: photo.size,
      uri:  Platform.OS === 'ios' ? value.replace('file://', '') : `file://${value}`,
    };
    if (picData.uri) {
      navigation.navigate('NewPicture', {image: picData, id: pId});
    } else {
    }

  };

  const capturePhoto = async (res: any) => {
      // const file = await camera.current.takePhoto({});
      // const result = await fetch(Platform.OS === 'ios' ? file.path : `file://${file.path}`);
      // const photo = await result.blob();
      try {
        await RNFS.moveFile( Platform.OS === 'ios' ? res[0].uri.replace('file://', '') : res[0].uri , photoPath);
      } catch (err: any) {
      }
      PhotoEditor.Edit({
        path: photoPath,
        colors: [ '#ff0000', '#0000ff', '#00ff00',  '#ffff00','#ffa500', '#000000', '#FFFFFF' ],
        hiddenControls: ['share', 'sticker', 'save'],
        onDone: (e) => {
          addUpdateImage(e);
        },
        onCancel: () => {
          navigation.goBack(null);
        },
      });
  };
  const cameraOpen = async () =>{
    let options: any = {
      cameraType: 'back',
      saveToPhotos: false,
	  quality: 0.8,
	//   conversionQuality: 0.8,
    };
    const result: any = await launchCamera(options, ()=>{});
    if (result?.didCancel == true) {
      navigation.goBack(null);
    } else {
      if (Platform.OS === 'ios') {
        navigation.navigate('NewPicture',
          {image: {
            name: 'img.jpg',
            type: result.assets[0].type,
            size: result.assets[0].size,
            uri: result.assets[0].uri.replace('file://', ''),
          }, id: pId});
      } else {
        capturePhoto(result.assets);
      }
    }
  };

  useEffect(() => {
    const cameraPermission = async () => {
      const permissionType = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });
      const res = await check(permissionType!);
      if (res === RESULTS.DENIED) {
        const requestResult = await request(permissionType!);
        if (requestResult === RESULTS.BLOCKED) {
          await Linking.openSettings();
        } else {
          cameraOpen();
        }
      } else {
        cameraOpen();
      }
    };
    cameraPermission();
  }, []);

  return (
    <Box style={styles.container}>
      <Spinner_Loading />
    </Box>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  absoluteFill: {
    display: 'flex',
    flex: 1,
    height: '100%',
    width: '100%',
  },
  button: {
    backgroundColor: 'gray',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: 0,
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  buttonContainer2: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    // justifyContent: 'flex-start',
    // alignItems: 'flex-start',
    width: '100%',
    top: 0,
    padding: 20,
  },
  camButton2: {
    // height: 80,
    // width: 80,
    padding: 10,
    borderRadius: 5,
    // backgroundColor: 'rgba(89,137,9,0.9)',
    backgroundColor: 'rgba(119,195,236,0.5)',
    borderColor: 'rgba(10,113,199,0.9)',
    alignSelf: 'flex-start',
    borderWidth: 2,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    //ADD backgroundColor COLOR GREY
    backgroundColor: '#B2BEB5',
    //   backgroundColor: '#B2BE',

    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 9 / 16,
  },
});

export default CameraScreen;
