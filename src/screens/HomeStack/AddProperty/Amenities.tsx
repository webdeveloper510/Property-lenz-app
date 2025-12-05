import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Box, Image, HStack, Button, Alert, Modal, Input, VStack, Divider, Switch } from 'native-base';
import { useRoute } from '@react-navigation/native';
// https://www.npmjs.com/package/react-native-draggable-flatlist
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import BackIcon from '@/assets/icon/btnBack.png';
import { apiAddMyProperties, apiUpdateProperties } from '@/apis/property';
import { warningTimer } from '@/constant/customHooks';
import AmenityCard from '@/components/DragAmenityCard/AmenityCard';
import { ScrollView } from 'react-native-gesture-handler';
import { apiGetItems } from '@/apis/areas';
import { propertyGet } from '@/services/types';

const render = ({ item, drag, isActive, getIndex, handleAmenityChange, handleAmenityDelete }: RenderItemParams<any>) => {
	const i = getIndex();
	return (
		<ScaleDecorator key={i}>
			<TouchableOpacity
				onLongPress={drag}
				disabled={isActive}
			>
				<AmenityCard data={item} index={i} onChange={handleAmenityChange} onDelete={handleAmenityDelete} />
			</TouchableOpacity>
		</ScaleDecorator>
	);
};

const AmenitiesSection = ({ navigation }: any): React.JSX.Element => {
	const route = useRoute();
	const areaData: any = route.params;
	const [area, setArea] = useState<any[]>(areaData.area);
	const [amenityName, setAmenityName] = useState<any>('');
	const [modalItem, setModalItem] = useState(false);
	const [amenityItems, setAmenityItems] = useState<any[]>([]);
	const [amenitySelectedItems, setSelectedItems] = useState<any[]>([]);
	const [errMsg, setErrMsg] = useState({ msg: '', error: false });
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const addNewAmenity = async () => {
		if (amenityName.trim() != '') {
			let ids = [...amenitySelectedItems.map(item => item.item_id)];
			setArea(prevArea => {
				return [...prevArea, { area_id: null, title: amenityName.trim(), sub_title: '', type: 'CUSTOM', item_id: ids, uniqueId: Math.floor(Math.random() * 100000) }];
			});
			setAmenityName('');
			setSelectedItems([]);
		} else {
			setErrMsg({ msg: 'Please give Name For Amenity', error: true });
			const timer = await warningTimer(1);
			timer && setErrMsg({ msg: '', error: false });
		}
		setModalItem(false);
	};

	const addProperty = async () => {
		setIsLoading(true);
		const dataFromArea: any = area.map(item => {
			const newItem = { ...item };
			delete newItem.uniqueId;
			if (newItem.id !== null) {
				delete newItem.id;
			}
			return newItem;
		});
		const propertyField = {
			type: areaData.data.type.type,
			name: areaData.data.name,
			location: areaData.data.location,
			address: areaData.data.address,
			address_line_2: !areaData.data.address_2 || areaData.data.address_2 == 'undefined' ? '' : areaData.data.address_2,
			city: areaData.data.city,
			state: areaData.data.state,
			zip: areaData.data.zip,
			country: areaData.data.country,
			latitude: areaData.data.latitude,
			longitude: areaData.data.longitude,
			cover_image: areaData.data.cover_image,
			areas: dataFromArea,
		};
		const response = await apiAddMyProperties(propertyField);
		let id: any = null;
		if (response.status) {
			id = response.result.id;
			navigation.navigate('DetailsRoot', id);
			setIsLoading(false);
		} else {
			setErrMsg({ msg: response.message, error: true });
			const timer = await warningTimer(5);
			timer && setErrMsg({ msg: '', error: false });
			setIsLoading(false);
		}
	};
	const updateProperty = async () => {
		setIsLoading(true);
		const dataFromArea: any = area.map(item => {
			const newItem = { ...item };
			delete newItem.uniqueId;
			if (newItem.id !== null) {
				delete newItem.id;
			}
			return newItem;
		});
		const tempData = {
			id: areaData.data.id,
			name: areaData.data.name.trim(),
			type: areaData.data.type,
			location: areaData.data.location.trim(),
			address: areaData.data.address.trim(),
			address_line_2: !areaData.data.address_2 || areaData.data.address_2 == 'undefined' ? '' : areaData.data.address_2,
			city: areaData.data.city.trim(),
			state: areaData.data.state.trim(),
			zip: areaData.data.zip.trim(),
			country: areaData.data.country.trim(),
			latitude: areaData.data.latitude,
			longitude: areaData.data.longitude,
			cover_image: areaData.data.cover_image,
			areas: dataFromArea,
		};
		console.log('before: ', tempData);
		const response = await apiUpdateProperties(tempData);
		console.log(response);
		if (response.status) {
			navigation.navigate('DetailsRoot', response.result);
			setIsLoading(false);
		} else {
			setErrMsg({ msg: response.message, error: true });
			const timer = await warningTimer(3);
			timer && setErrMsg({ msg: '', error: false });
			setIsLoading(false);
		}
	};
	const amenitiesSwitchCheck = (v: any) => {
		setSelectedItems((prevSelectedItems: any) => {
			const index = prevSelectedItems.findIndex((item: any) => item.item_id === v.id);
			if (index !== -1) {
				return prevSelectedItems.filter((item: any) => item.item_id !== v.id);
			} else {
				// return [...prevSelectedItems, { item_id: v.id, ...v }];
				return [...prevSelectedItems, { item_id: v.id }];
			}
		});
	};

	const handleAmenityChange = (valueChange: string, i: number) => {
		const newAreaData = [...area];
		newAreaData[i] = {
			...newAreaData[i],
			sub_title: valueChange,
		};
		setArea(newAreaData);
	};
	const handleAmenityDelete = (i: number) => {
		const newAreaData = area.filter((_, index) => index !== i);
		setArea(newAreaData);
	};
	const ItemsGet = async () => {
		const response: any = await apiGetItems();
		if (response.status) {
			setAmenityItems(response.result);
		}
	};
	useEffect(() => { ItemsGet(); }, []);

	return (
		<Box style={styles.mainContainer} flex={1}>
			<Modal isOpen={modalItem} onClose={() => setModalItem(false)} justifyContent="center" size="xl">
				<Modal.Content>
					<Modal.CloseButton />
					<Modal.Header>Amenity Add</Modal.Header>
					<Modal.Body>
						{errMsg.error &&
							<Alert w="100%" status={errMsg.error ? 'danger' : 'success'} mb={8} mt={-10}>
								<Text fontSize="md" color={errMsg.error ? 'red.500' : 'green.600'}>{errMsg.msg}</Text>
							</Alert>
						}
						<VStack mb={3}>
							<Text fontSize={'sm'}>Amenity Name</Text>
							<Input onChangeText={setAmenityName} value={amenityName} />
						</VStack>
						<Divider />
						<Text fontSize={'lg'} bold>Amenity Details</Text>
						<ScrollView>
							<Box style={styles.switchMain} mb={5} mt={2}>
								{amenityItems.length > 0 && amenityItems.map((item, i) => {
									return (
										<Box key={i} style={styles.switchContainer}>
											<Switch size={'sm'} onChange={() => { amenitiesSwitchCheck(item); }} />
											<Text color={'my.t3'} fontSize={'xs'} style={{ flexWrap: 'wrap' }} maxW="55%">{item.name}</Text>
										</Box>
									);
								})}
							</Box>
						</ScrollView>
					</Modal.Body>
					<Modal.Footer justifyContent={'space-around'} alignItems={'center'}>
						<Button style={styles.modalButton} py={2} px={8} onPress={() => { addNewAmenity(); }}>Add</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>
			<SafeAreaView>
				<HStack mb={5} mt={3} height={50} alignItems={'center'}>
					<Pressable onPress={() => navigation.goBack(null)}>
						<Image source={BackIcon} alt="Back" style={styles.backIcon} />
					</Pressable>
					<Text bold fontSize={'3xl'} ml={3} mb={1} color={'my.h4'}>Amenities Order</Text>
				</HStack>
			</SafeAreaView>
			<Button style={{ backgroundColor: 'rgba(10,113,199,0.9)', width: 140 }} onPress={() => { setModalItem(true); }} mb={3}>Add Amenity +</Button>
			<Box style={styles.listContainer} >
				<DraggableFlatList
					scrollEnabled={true}
					data={area.length > 0 ? area : []}
					renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<any>) => {
						return render({ item, drag, isActive, getIndex, handleAmenityChange, handleAmenityDelete });
					}}
					keyExtractor={(item, index) => item.uniqueId.toString()}
					onDragEnd={({ data }) => { setArea([...data]); }}
				/>
			</Box>
			{errMsg.error &&
				<Alert w="100%" status={'danger'} my={3}>
					<Text fontSize="md" color={'red.500'}>{errMsg.msg}</Text>
				</Alert>
			}
			<Button isLoading={isLoading} style={styles.button} my={5}
				onPress={() => { areaData.action == 'Add' ? addProperty() : updateProperty(); }}>{`${areaData.action} Property`}</Button>
		</Box>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		padding: 20,
		backgroundColor: '#FFFFFF',
		height: '100%',
	},
	backIcon: {
		height: 40,
		width: 40,
	},
	listContainer: {
		flexDirection: 'column',
		flex: 1,
	},
	button: {
		backgroundColor: 'rgba(10,113,189,0.9))',
		alignSelf: 'center',
		width: '100%',
		height: 45,
		borderRadius: 10,
	},
	buttonDisabled: {
		backgroundColor: 'rgba(90,113,189,0.9)',
		alignSelf: 'center',
		width: '100%',
		height: 45,
		borderRadius: 10,
	},
	switchMain: {
		display: 'flex',
		width: '100%',
		minHeight: 40,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	switchContainer: {
		gap: 10,
		flexDirection: 'row',
		alignItems: 'center',
		width: '50%',
		height: 60,
		flexWrap: 'wrap',
	},
	modalButton: {
		backgroundColor: 'rgba(0, 113, 188,0.9)',
	},
});

export default AmenitiesSection;
