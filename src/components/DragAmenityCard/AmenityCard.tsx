import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet,View} from 'react-native';
import { Text, Box, Image, HStack, Input, VStack, Divider, Modal, Button, Icon, CheckIcon } from 'native-base';
// icons
import Edit from '@/assets/icon/edit_4.png';
import Delete from '@/assets/icon/trash_3.png';
import Drag from '@/assets/icon/Drag.png';

const AmenityCard = ({ data, index, onChange, onDelete }: any): React.JSX.Element => {
	const [inputValue, setInputValue] = useState(data.sub_title);
	const [show, setShow] = useState(false);

	const onSave = () => {
		onChange(inputValue, index);
		setShow(false);
	};
	
	return (
		<>
			{false ? (
			<Modal isOpen={show} onClose={() => { setShow(false); }} justifyContent="center" size="xl">
				<Modal.Content>
					<Modal.CloseButton />
					<Modal.Header>{data?.title}</Modal.Header>
					<Modal.Body>
						<VStack mb={3}>
							<Text fontSize={'sm'}>Subtitle</Text>
							<Input onChangeText={setInputValue} value={inputValue} />
						</VStack>
						<Divider />
					</Modal.Body>
					<Modal.Footer justifyContent={'space-around'}>
						<Button style={styles.modalButton} onPress={onSave}>Done</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>
			) : null}
			<VStack style={styles.card} my={1}>
				{(data.sub_title !== '' && !show) ? (
					<>
						<Text ml={2} color={'my.tl'} style={styles.cardHeader} disabled>{data.title}</Text>
						<Divider />
					</>
				) : null}
				<HStack py={1} alignItems={'center'} justifyContent={'space-evenly'}>
					<View style={{width:22,height:40,backgroundColor:'#F2F2F2',borderRadius:5,justifyContent:'center',alignItems:'center'}}>

					<Image source={Drag} style={styles.cardDrag} alt="icon" tintColor={'#9A46DB'} />
					</View>
					<Text mt={2} ml={2} fontSize={'sm'} style={styles.cardText} >{(data.sub_title === '' || show) ? data.title : data.sub_title}</Text>
					<Box>
						{show ? (
							<Button style={styles.modalButton} size="sm" mr={2} onPress={onSave}>Save</Button>
						) : (
						<HStack space={3}>
							<Pressable onPress={() => { setShow(true); }}>
								<Image source={Edit} style={styles.cardIcon} alt="icon" />
							</Pressable>
							<Pressable onPress={() => { onDelete(index); }}>
								<Image source={Delete} mr={1} style={styles.cardIcon} alt="del" />
							</Pressable>
						</HStack>
						)}
					</Box>
				</HStack>
				{show ? (
					<>
					<Divider mb={1} />
					<Input mb={1} 
						onChangeText={setInputValue} 
						value={inputValue} 
						placeholder='Subtitle' 
						style={{borderWidth: 0}} 
						autoFocus={true}
					/>
					</>
				) : null}
			</VStack>
		</>
	);
};
const styles = StyleSheet.create({
	card: {
		borderColor: 'rgba(200,200,200,0.5)',
		borderRadius: 7,
		backgroundColor: '#ffffff',
		height:66,
		elevation:1,
		alignItems:'center',
		justifyContent:'center',
		paddingHorizontal:10
	},
	cardInput: {
		flex: 1,
		borderWidth: 0,
	},
	cardInputFocus: {
		flex: 1,
		borderTopWidth: 0,
		borderBottomWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 1,
		borderRadius: 0,
	},
	cardText: {
		flex: 1,
		height: 30,
		textAlignVertical: 'center',
		color:'#250959',
		fontWeight:'700'
	},
	cardIcon: {
		height: 25,
		width: 25,
	},
	cardDrag: {
		height: 18,
		width: 18,
	},
	cardHeader: {
		fontSize: 12,
	},
	modalButton: {
		backgroundColor: 'rgba(0, 113, 188,0.9)',
		// height: 45,
		// width: 80,
	},
});

export default AmenityCard;
