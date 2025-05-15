import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const ScanScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Scan</Text>
        <Text style={styles.subtitle}>Scan your food items</Text>
      </View>

      <View style={styles.scanContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Camera View</Text>
        </View>

        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualButton}>
          <Text style={styles.manualButtonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  scanContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  scanButtonText: {
    color: COLORS.whiteSmoke,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  manualButton: {
    backgroundColor: COLORS.whiteSmoke,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  manualButtonText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

export default ScanScreen;
