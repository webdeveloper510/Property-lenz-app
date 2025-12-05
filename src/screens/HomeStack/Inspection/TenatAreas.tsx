import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { setInspection } from '@/state/propertyDataSlice';
import { Text, Button, Box, Image, HStack, ScrollView, Modal, Spinner } from 'native-base';
import { apiMarkAll, apiSpecificInspection } from '@/apis/property';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { InspectionGet, UserDataObject } from '@/services/types';
import Spinner_Loading from '@/components/Loading/Spinner_loading';
import AreaCard from './_areaCard';
import _header from '@/components/_header';
import cacheService from '@/services/CacheServices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// icon
import Back from '@/assets/icon/btnBack.png';
import geoService from '@/services/GeolocationServices';
interface LocationType {
  latitude: number,
  longitude: number,
}

const TenantAreas = ({ navigation }: any): React.JSX.Element => {
  const inspectionData = useAppSelector(state => state.property.inspection);
  const userData: UserDataObject | any = useAppSelector(state => state.auth.userData);
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [location, setCode] = useState<LocationType | number | null>(null);
  // const [message, setMessage] = useState<string>('');
  const [content, setContent] = useState({header: '', message: ''});
  const [loadingState, setLoadingState] = useState({
    loading: true,
    isLoading: false,
    nLoading: false,
    bLoading: false,
  });
  const [page, setPage] = useState<number>(0);
  const scrollRef: any = useRef()

  const route = useRoute();
  const insId: any = route.params;
  const count = useMemo(() => inspectionData?.areas?.length || 0, [inspectionData]);
  const getLocation = async () => {
    const response = await geoService.getLocation(false, 5);
    console.log('location screen: ', response);
    if (response.status) {
      return response.result;
    } else {
      setContent({header: 'Location Service', message: response.message});
      setCode(response.result);
      setModalVisible2(true);
      return null;
    }
  };

  const getInsDetails = useCallback(async () => {
	// console.log('my test', userData)
	let checkLocation = (userData && userData.hasOwnProperty('check_location')) ? userData.check_location : 0;
	console.log({checkLocation})

	const response = await apiSpecificInspection(insId);
	if (response.status) {

		if (checkLocation == 1) {
			const res: any = await getLocation();
			if (!res) {
				setLoadingState(prevState => ({ ...prevState, loading: false }));
				return;
			}

			const coord1 = {longitude: response.result.property.longitude , latitude: response.result.property.latitude};
			// const dumpyCoords = {longitude: res?.longitude - 0.01, latitude: res?.latitude - 0.01};
			const distance = await geoService.getDistance(coord1, res);
			if (!distance) {
				setModalVisible2(true);
				setContent({header: 'Location Service', message: 'You are too far from the property.'});
			}
		}

        const pageIndex = response.result.areas.findIndex((obj) => obj.is_completed === 0);
        setPage(pageIndex >= 0 ? pageIndex : 0);
        dispatch(setInspection(response.result));
        setLoadingState(prevState => ({ ...prevState, loading: false }));
	}
	await cacheService.makeAsyncResponse();

    
  }, [insId, dispatch]);
  const validateAreaComplete = useCallback(() => {
    // console.log('page: ', page);
    let items = inspectionData?.areas[page].items;
    // console.log('Items: ', JSON.stringify(items));
    if (items) {
      const hasPendingItems = items.some(item => {
        console.log(item.status);
        return item.status === 'PENDING';
      });
      // console.log('hasPendingItems: ', JSON.stringify(hasPendingItems));
      if (hasPendingItems) {
        setModalVisible2(true);
        setContent({ header: 'Precaution', message: 'Please complete all items before proceeding.' });
      } else {
        setPage(prevPage => Math.min(prevPage + 1, count - 1));
      }
    }
  }, [inspectionData, page, count]);
  const cleanUp = () => {
    setModalVisible2(false);
    content.header.includes('Location') && navigation.goBack(null);
    setContent({message: '', header: ''});
  };

  const handleNavigation = useCallback(async (action: string) => {
    setLoadingState(prevState => ({
      ...prevState,
      isLoading: true,
      [action === 'next' ? 'nLoading' : 'bLoading']: true,
    }));
    if (action == 'next') {
      validateAreaComplete();
    } else {
      setPage(prevPage => Math.max(prevPage - 1, 0));
    }
    await new Promise(resolve => setTimeout(resolve, 70));
    await cacheService.makeAsyncResponse();
    setLoadingState({ loading: false, isLoading: false, nLoading: false, bLoading: false });

    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0)
    }
  }, [count, validateAreaComplete]);

  const markAll = useCallback(async () => {
    setLoadingState(prevState => ({ ...prevState, bLoading: true, nLoading: true }));
    const response = await apiMarkAll({ id: inspectionData?.id, area_id: inspectionData?.areas[page].area_id });
    console.log(JSON.stringify(response));
    if (response.status) {
      selectAll();
    } else {
      setLoadingState(prevState => ({ ...prevState, bLoading: false, nLoading: false }));
    }
  }, [inspectionData, page]);

  const selectAll = useCallback(async () => {
    const updateStatus: any = {
      ...inspectionData,
      areas: inspectionData?.areas.map((area, areaIndex) => {
        if (areaIndex === page) {
          return {
            ...area,
            items: area.items.map((item) => ({ ...item, status: 'SATISFACTORY' })),
          };
        } else {
          return area;
        }
      }),
    };
    dispatch(setInspection(updateStatus));
    await cacheService.cacheUpdate('apiMarkAll', updateStatus);
    await cacheService.makeAsyncResponse();
    setModalVisible(false);
    setLoadingState(prevState => ({ ...prevState, bLoading: false, nLoading: false }));
  }, [inspectionData, page, dispatch]);

  const updateItemStatus = useCallback(async (s: string, i_id: number, c: string, enabled: number) => {
    if (inspectionData?.areas) {
      const updatedData: InspectionGet = {
        ...inspectionData,
        areas: inspectionData?.areas.map((area, areaIndex) => {
          if (areaIndex === page) {
            return {
              ...area,
              items: area.items.map((item) => {
                if (item.item_id === i_id) {
                  return { ...item, status: s, comments: c, is_enable: enabled };
                } else {
                  return item;
                }
              }),
            };
          } else {
            return area;
          }
        }),
      };
      await cacheService.cacheUpdate('apiUpdateStatus', updatedData);
      await cacheService.makeAsyncResponse();
      dispatch(setInspection(updatedData));
    }
  }, [inspectionData, page, dispatch]);

  useEffect(() => {
    getInsDetails();
  }, []);
  useEffect(() => {}, [location, page]);
  const handleTitle = (): any => {
    return inspectionData?.areas[page].sub_title || inspectionData?.areas[page].title;
  };

  return (
    <Box style={styles.mainContainer}>
      <_header />
      {loadingState.loading ? (
        <Spinner_Loading />
      ) : (
        <>
          <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} justifyContent="center" size="lg">
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>Are you sure?</Modal.Header>
              <Modal.Body>
                <Text>Do you want to mark all as Satisfactory?</Text>
              </Modal.Body>
              <Modal.Footer justifyContent={'space-around'}>
                <Button
                  style={{ ...styles.modalButton, backgroundColor: 'rgba(225,20,40,0.9)' }}
                  onPress={() => setModalVisible(false)}
                >
                  No
                </Button>
                <Button style={styles.modalButton} onPress={() => { markAll(); setModalVisible(false); }}>
                  Yes
                </Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
          <Modal isOpen={modalVisible2} onClose={() => {cleanUp();}} justifyContent="center" size="lg">
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>{content.header}</Modal.Header>
              <Modal.Body>
                <Text >{location == 2 ? 'Please Turn on Your GPS' : content.message}</Text>
              </Modal.Body>
              <Modal.Footer justifyContent={'space-around'}>
                <Button px={8} py={2} style={{ backgroundColor: 'rgba(253, 56, 24, 1)' }} onPress={() => { cleanUp(); }}>Close</Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
          <HStack mt={handleTitle()?.length > 15 ? 3 : 6} mb={handleTitle()?.length > 15 ? 3 : 6} alignItems={'center'} justifyContent={'space-between'}>
            <HStack alignItems={'center'} style={{ width: '75%' }}>
              <Pressable onPress={() => navigation.goBack(null)}>
                <Image source={Back} alt="Back" style={styles.backIcon} />
              </Pressable>
              <Text bold style={{ flex: 1 }} lineHeight={25} fontSize={'2xl'} ml={3} mb={1} color={'my.h'}>
                {handleTitle()}
              </Text>
            </HStack>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
              <Text bold fontSize={'xs'} textAlign={'center'} style={{ width: 100 }} mb={1} color={'my.bgBlue'}>
                Mark all as Satisfied
              </Text>
            </TouchableOpacity>
          </HStack>
          <KeyboardAwareScrollView 
            enableOnAndroid={true}
            enableAutomaticScroll={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={100}
            extraHeight={20}
            style={{
              height: '65%',
            }}
            innerRef={ref => {
              scrollRef.current = ref
            }}
          >
            {loadingState.loading ? (
              <Spinner color={'my.h3'} />
            ) : (inspectionData?.areas && inspectionData?.areas[page].items?.length > 0 ?
              inspectionData?.areas[page].items.map((item, i) => (
                <AreaCard
                  key={i}
                  Data={item}
                  inspectionId={inspectionData?.id}
                  page={page}
                  onItemUpdate={updateItemStatus}
                  isRenterUser={true}
                />
              )) : <Text mx={'auto'} bold mt={2} fontSize={'lg'} color={'my.td'}>No Items</Text>
            )}
          </KeyboardAwareScrollView>
          <HStack style={styles.footer} justifyContent={'space-between'} alignItems={'center'} w={'full'} mt={3}>
            <HStack justifyContent={'center'} alignItems={'center'} flex={1}>
              <Text ml={2} color={'my.td'} bold fontSize={'lg'}>{`${page + 1}/${count}`}</Text>
            </HStack>
            <Box style={{ flexDirection: 'row' }}>
              {page > 0 && (
                <Button
                  isLoading={loadingState.bLoading && loadingState.nLoading ? false : loadingState.bLoading}
                  isDisabled={loadingState.nLoading}
                  style={{ backgroundColor: 'rgba(10,113,189,0.9)' }}
                  mr={2}
                  onPress={() => { handleNavigation('prev'); }}
                >
                  Back
                </Button>
              )}
              {page >= count - 1 ? (
                <Button style={{ backgroundColor: 'rgba(10,113,189,0.9)' }} onPress={() => navigation.navigate('Agreement', insId)}>
                  Next
                </Button>
              ) : (
                <Button
                  isLoading={loadingState.nLoading && loadingState.bLoading ? false : loadingState.nLoading}
                  isDisabled={loadingState.bLoading}
                  style={{ backgroundColor: 'rgba(10,113,189,0.9)' }}
                  onPress={() => { handleNavigation('next'); }}
                >
                  Next
                </Button>
              )}
            </Box>
          </HStack>
        </>
      )}
    </Box>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  backIcon: {
    height: 40,
    width: 40,
  },
  footer: {
    backgroundColor: 'transparent',
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: 'rgba(217,217,217,1.0)',
    borderRadius: 50,
    marginLeft: 5,
  },
  active: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(10,113,189,0.9)',
    borderRadius: 50,
    marginLeft: 5,
  },
  modalOptions: {
    flex: 1,
    padding: 5,
    borderRadius: 10,
    height: 40,
  },
  modalButton: {
    backgroundColor: 'rgba(0, 113, 188,0.9)',
    height: 45,
    width: 80,
  },
});

export default React.memo(TenantAreas);
