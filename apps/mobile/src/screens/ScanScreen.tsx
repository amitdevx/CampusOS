import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

import { markAttendance } from '@campusos/api-client';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (processing) return;
    setScanned(true);
    setProcessing(true);
    try {
      const parsedData = JSON.parse(data);
      const sessionId = parsedData.session || parsedData.sessionId;
      const secret = parsedData.token || parsedData.secret;
      
      if (parsedData.type === 'ATTENDANCE' && sessionId && secret) {
        
        await markAttendance(sessionId, secret);
        
        Alert.alert(
          '✓ Attendance Marked',
          `Successfully checked in for Session #${sessionId}`,
          [{ text: 'Done', onPress: () => { setScanned(false); setProcessing(false); } }]
        );
      } else {
        throw new Error("Invalid format");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'QR Code Expired or Invalid.\nAsk your teacher to generate a new one.';
      Alert.alert('QR Error', msg, [
        { text: 'Scan Again', onPress: () => { setScanned(false); setProcessing(false); } },
      ]);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
        <Text style={[styles.text, { marginTop: 10, textAlign: 'center', marginHorizontal: 20 }]}>
          ResoSync needs camera access to scan attendance QR codes.
        </Text>
        <TouchableOpacity style={styles.rescanButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.rescanText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <View style={styles.scannerBox} />
        <Text style={styles.instructionText}>
          Point your camera at the instructor's QR code
        </Text>
        {scanned && (
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: 'transparent',
    marginBottom: 40,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescanButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rescanText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
