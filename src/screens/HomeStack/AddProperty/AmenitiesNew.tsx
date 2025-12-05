import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, TouchableOpacity,View,ScrollView, Platform,Dimensions } from 'react-native';
import { Alert as RNAlert } from 'react-native';
import { Text, Box, Image, HStack, Button, Alert, Modal, Input, VStack, Divider, Switch } from 'native-base';
import { useRoute } from '@react-navigation/native';
// https://www.npmjs.com/package/react-native-draggable-flatlist
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import BackIcon from '@/assets/icon/btnBack.png';
import { apiAddMyProperties, apiUpdateProperties } from '@/apis/property';
import { warningTimer } from '@/constant/customHooks';
import AmenityCard from '@/components/DragAmenityCard/AmenityCard';

import { apiGetItems, apiNewPictureAreas } from '@/apis/areas';
import { propertyGet } from '@/services/types';
import CommanButton from '@/components/CommanButton';
import BackButton from '@/components/BackButton';
const {height: windowHeight} = Dimensions.get('window');
const render = ({ item, drag, isActive, getIndex, handleAmenityChange, handleAmenityDelete }: any) => {
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
	const paramData: any = route.params;
	const propertyId = paramData.propertyId
	const propertyType = paramData.propertyType
	const [area, setArea] = useState<any[]>([]);

	const [showModal, setShowModal] = useState<boolean>(false)
	const [amenityName, setAmenityName] = useState<any>('');
	const [amenityItems, setAmenityItems] = useState<any[]>([]);
	const [amenitySelectedItems, setAmenitySelectedItems] = useState<any[]>([]);

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errMsg, setErrMsg] = useState<string>('');

	useEffect(() => {
		(async () => {
			const response: any = await apiGetItems();
			if (response.status) {
				setAmenityItems(response.result);
			}
		})()
	}, [])
	
	useEffect(() => {
		if (!propertyId) return

		(async () => {
			const areasResponse: any = await apiNewPictureAreas(propertyId)
			if (areasResponse.status) {
				setArea([...areasResponse.result.map((a: any) => {
					return {
						...a,
						uniqueId: Math.floor(Math.random() * 100000)
					}
				})])
			}
		})()
		
	}, [propertyId])

	const handleAmenityChange = (valueChange: string, i: number) => {
		const newAreaData = [...area];
		newAreaData[i] = {
			...newAreaData[i],
			sub_title: valueChange,
		};
		setArea(newAreaData);
	};
	const handleAmenityDelete = (i: number) => {
		RNAlert.alert(
			"Confirm Action",
			`Are you sure you want to delete ${area[i]?.title}?`,
			[
				{
					text: "Cancel",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel"
				},
				{
				text: "OK",
					onPress: () => {
						const newAreaData = area.filter((_, index) => index !== i);
						setArea(newAreaData);
					}
				}
			],
			{ cancelable: false }
		);
		
	};

	const amenitiesSwitchCheck = (v: any) => {
		setAmenitySelectedItems((prevSelectedItems: any) => {
			const index = prevSelectedItems.findIndex((item: any) => item.item_id === v.id);
			if (index !== -1) {
				return prevSelectedItems.filter((item: any) => item.item_id !== v.id);
			} else {
				return [...prevSelectedItems, { item_id: v.id }];
			}
		});
	};

	const addNewAmenity = async () => {
		if (amenityName.trim() == '') {
			RNAlert.alert('', 'Please fill amenity name')
			return;
		}
		
		let ids = [...amenitySelectedItems.map(item => item.item_id)];
		setArea(prevArea => {
			return [...prevArea, { area_id: null, title: amenityName.trim(), sub_title: '', type: 'CUSTOM', item_id: ids, uniqueId: Math.floor(Math.random() * 100000) }];
		});
		setAmenityName('');
		setAmenitySelectedItems([]);
		setShowModal(false);
	};

	const handleSubmit = async () => {
		console.log('areas', area)

		const finalAreas = area.map(a => ({
			area_id: a.id || null,
			title: a.title,
			sub_title: a.sub_title || '',
			type: a.type || null,
			item_id: a.item_id || [],
		}));

		const data: any = {
			id: propertyId,
			type: propertyType,
			areas: finalAreas,
		}

		setIsLoading(true);
		const response = await apiUpdateProperties(data);
		console.log("🚀 ~ handleSubmit ~ response:", response)
		setIsLoading(false);
		if (response.status) {
			// navigation.navigate('DetailsRoot', propertyId);
			navigation.goBack(null)
		}
		else {
			setErrMsg(response.message)
		}
	}
	

	return (
		<SafeAreaView style={{flex:1}}>
			 <View
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
						    marginTop:Platform.OS == 'ios' ? 0 :30
                        }}>
                        <BackButton navigation={navigation} />
                        <Text
                            style={{
                                fontSize: 18,
                                color: '#250959',
                                fontWeight: '700',
                            }}>
                           Amenities Order
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowModal(true)}
                            style={{
                                height: 50,
                                width: 50,
                                // marginTop: 20,
                                backgroundColor: '#ffffff',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 50,
                                elevation: 3,
                            }}>
                            <Image
                                source={require('../../../assets/icon/add_c.png')}
                                style={{width: 24, height: 24}}
                            />
                        </TouchableOpacity>
                    </View>
		<ScrollView style={{flex:1}}>
		<View style={styles.mainContainer}>
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
			{errMsg &&
				<Alert w="100%" status={'danger'} my={3}>
					<Text fontSize="md" color={'red.500'}>{errMsg}</Text>
				</Alert>
			}
			{/* <Button isLoading={isLoading} style={styles.button} my={5} onPress={handleSubmit} >Submit</Button> */}
			<CommanButton
			label={'Submit'}
			isLoading={isLoading}
			onCkick={handleSubmit}
			/>
		</View>

		<Modal isOpen={showModal} onClose={() => setShowModal(false)} justifyContent="center" size="xl">
			<Modal.Content>
				<Modal.CloseButton />
				<Modal.Header>Amenity Add</Modal.Header>
				<Modal.Body>
					<VStack mb={3}>
						<Text fontSize={'sm'} bold>Amenity Name</Text>
						<Input onChangeText={setAmenityName} value={amenityName} />
					</VStack>
					<Text fontSize={'sm'} bold>Amenity Items</Text>
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
				</Modal.Body>
				<Modal.Footer justifyContent={'space-around'} alignItems={'center'}>
					<Button style={styles.modalButton} py={2} px={8} onPress={addNewAmenity}>Add</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal>
		<View style={{height:windowHeight * 0.5}}/>
		</ScrollView>
		</SafeAreaView>
	)
}


const styles = StyleSheet.create({
	mainContainer: {
		padding: 20,
		backgroundColor: '#F2F2F2',
		// height: '100%',
	},
	backIcon: {
		height: 40,
		width: 40,
	},
	listContainer: {
		// flexDirection: 'column',
		flex: 1,
		// marginTop:15
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
