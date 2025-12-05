
import { Actionsheet, Button, FormControl, Text, VStack } from 'native-base';
import React, { FC, useEffect, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet } from 'react-native';
// https://www.npmjs.com/package/@react-native-community/datetimepicker
import RNDateTimePicker, { AndroidNativeProps, IOSNativeProps, WindowsNativeProps } from '@react-native-community/datetimepicker';
import { dateTOIsoString, formatDate } from '@/constant/customHooks';

const DatePicker = (props: IOSNativeProps | AndroidNativeProps | WindowsNativeProps): React.JSX.Element => {
	const [showPicker, setShowPicker] = useState<boolean>(false);


	if (Platform.OS == 'ios') {
		return (
			<>
				<Pressable onPress={() => { setShowPicker(true); }}>
					<FormControl
						isRequired
						style={{
							display: 'flex',
							alignSelf: 'center',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
							height: 'auto',
							width: '100%',
							// borderRadius: 8,
							marginBottom: 20,
						}}>
						<Text style={{
							flex: 1,
							height: 45,
							color: 'black',
							borderWidth: 1,
							borderColor: 'rgba(125, 125, 125,0.2)',
							backgroundColor: 'transparent',
							borderRadius: 4,
							textAlignVertical: 'center',
							padding: 10,
						}} >{formatDate(props.value, '/')}</Text>
					</FormControl>
				</Pressable>
				{showPicker && (
					<Actionsheet isOpen={showPicker} onClose={() => setShowPicker(false)}>
						<Actionsheet.Content>
							<RNDateTimePicker
								{...props}
								display="spinner"
								textColor="black"
								themeVariant="light"
							/>
							<Button
								variant="ghost"
								colorScheme="rgba(10,113,189,1)"
								style={{
									display: 'flex',
									width: '100%',
								}}
								onPress={() => setShowPicker(false)}
							>OK</Button>
						</Actionsheet.Content>
					</Actionsheet>

				)}
			</>
		);
	}

	return (
		<VStack>
			<Pressable onPress={() => { setShowPicker(true); }}>
				<FormControl
					isRequired
					style={{
					
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
						height:20,
						width:80
						// borderRadius: 8,
						// marginBottom: 20,
					}}>
					<Text style={{
						height: 45,
						color: '#250959',
					
						borderColor: 'rgba(125, 125, 125,0.2)',
						backgroundColor: 'transparent',
						textAlignVertical: 'center'
					}} >{formatDate(props.value, '/')}</Text>
				</FormControl>
			</Pressable>
			{showPicker && (
				<RNDateTimePicker
					{...props}
					onChange={(event, selectedDate) => {
						setShowPicker(false);
						if (props.onChange) {
							props.onChange(event, selectedDate);
						}
					}}
				/>
			)}
		</VStack>
	);
};

export default DatePicker;
