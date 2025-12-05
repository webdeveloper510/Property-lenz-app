import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
// import { useCameraDevice, Camera, useCameraPermission, CameraPermissionStatus } from 'react-native-vision-camera';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { setInspection } from '@/state/propertyDataSlice';
import { apiUpdateInspectionImage } from '@/apis/property';
// https://www.npmjs.com/package/react-native-permissions
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
// https://www.npmjs.com/package/react-native-fs
import RNFS from 'react-native-fs';
// https://www.npmjs.com/package/react-native-photo-editor
// example    https://codesandbox.io/s/react-native-mobile-forked-fl4z4c?file=/src/App.js
import PhotoEditor from 'react-native-photo-editor';
// https://www.npmjs.com/package/react-native-image-picker
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import cacheService from '@/services/CacheServices';



const CameraScreen = ({ navigation }: any): React.JSX.Element => {
  const inspectionData = useAppSelector(state => state.property.inspection);

  const dispatch = useAppDispatch();
  // const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('not-determined');
  // const { hasPermission, requestPermission } = useCameraPermission();
  // const camera = useRef<Camera>(null);
  // const device: any = useCameraDevice('back');
  const route = useRoute();
  const dataId: any = route.params;
  const [showCamera, setShowCamera] = useState(true);
  const photoPath = RNFS.DocumentDirectoryPath + `/L${dataId.length}_P${dataId.page}_I${dataId.item_id}.jpg`;

   
  const openCamera = async () =>{
    let options: any = {
      cameraType: 'back',
      saveToPhotos: false,
	    quality: 0.8,
	//   conversionQuality: 0.8,
    };
    const result: any = await launchCamera(options, () => { });
    if (result?.didCancel == true) {
      navigation.goBack(null);
    } else {
		capturePhoto(result.assets);
    }
    setShowCamera(false);
  };

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
        openCamera();
      }
    } else {
      openCamera();
    }
  };
  useEffect(() => {
    cameraPermission();
  }, []);

  const capturePhoto = async (res: any) => {
    try {
      await RNFS.moveFile(Platform.OS === 'ios' ? res[0].uri.replace('file://', '') : res[0].uri, photoPath);
    } catch (err: any) {
    }
    PhotoEditor.Edit({
      path: photoPath,
      colors: ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ffa500', '#000000', '#FFFFFF'],
      hiddenControls: ['share', 'sticker', 'save'],
      onDone: (e) => {
		console.log('edit result', e)
        addInspectionImage(e);
      },
      onCancel: () => {
        navigation.goBack(null);
      },
    });
  };

  const updateImage = useCallback(async (image: any) => {
    const updatedData: any = {
      ...inspectionData,
      areas: inspectionData?.areas.map((area, areaIndex) => {
        if (areaIndex === dataId.page) {
          return {
            ...area,
            items: area.items.map(item => {
              if (item.item_id === dataId.item_id) {
                return { ...item, images: [...item.images, { image: image }] };
              } else {
                return item;
              }
            }
            ),
          };
        } else {
          return area;
        }
      }),
    };
   
    dispatch(setInspection(updatedData));
    await cacheService.cacheUpdate('apiUpdateInspectionImage', updatedData);
    await cacheService.makeAsyncResponse();
  }, [dataId]);

  const addInspectionImage = async (value: any) => {
    // value = /data/user/0/com.propertylenzapp/files/photo.jpg
    try {
      let data;
      if (false) {
        data = {
          id: dataId?.id,
          area_id: dataId?.area_id,
          item_id: dataId?.item_id,
          image: value,
        };
      } else {
        const result = await fetch(`file://${value}`);
        const photo = await result.blob();
        const picData = {
          name: `${dataId?.item_id}img.jpg`,
          type: photo.type,
          size: photo.size,
          uri: `file://${value}`,
        };
        data = {
          id: dataId?.id,
          area_id: dataId?.area_id,
          item_id: dataId?.item_id,
          image: picData,
        };
      }

      const response = await apiUpdateInspectionImage(data);
      console.log("🚀 ~ addInspectionImage ~ response:", response)
      if (response.status) {
        updateImage(`file://${value}`);
      }
    } catch (error) {
    } finally {
      navigation.goBack(null);
    }
  };

  return (
    <Box style={styles.container}>
      <Spinner_Loading />
    </Box>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
