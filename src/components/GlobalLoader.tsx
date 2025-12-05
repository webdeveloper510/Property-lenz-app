// GlobalLoader.js
import React from 'react';
import { View, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

export default function GlobalLoader() {
  const loading = useSelector(state => state.loader.loading);

  return (
    <Modal visible={loading} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#9A46DB" /> 
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
  },
});
