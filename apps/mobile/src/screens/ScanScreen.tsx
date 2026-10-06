import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { markAttendance } from '@campusos/api-client';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.65;

type ScanState = 'scanning' | 'processing' | 'success' | 'error';

interface SuccessData {
  sessionId: number;
  markedAt: string;
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      if (mounted) setHasPermission(status === 'granted');
    });
  
    return () => { mounted = false; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset scan state when screen comes into focus
      setScanned(false);
      setScanState('scanning');
      setSuccessData(null);
      setErrorMsg('');
    }, [])
  );

  useEffect(() => {
    let timer;
    if (scanState === 'success') {
      timer = setTimeout(() => {
        resetScan();
        navigation.navigate('Home');
      }, 5000); // auto-reset after 5 seconds so they don't get stuck
    }
    return () => clearTimeout(timer);
  }, [scanState]);

  const resetScan = () => {
    setScanned(false);
    setScanState('scanning');
    setSuccessData(null);
    setErrorMsg('');
  };

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanState('processing');

    try {
      // The QR code contains JSON stringified data from the teacher dashboard
      const parsedData = JSON.parse(data);
      const sessionId = parsedData.session || parsedData.sessionId;
      const secret = parsedData.token || parsedData.secret;

      if (parsedData.type === 'ATTENDANCE' && sessionId && secret) {
        await markAttendance(sessionId, secret);
        setSuccessData({ 
          sessionId, 
          markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        });
        setScanState('success');
      } else {
        throw new Error('Invalid QR format. Not a ResoSync attendance code.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'QR code is invalid or expired.';
      setErrorMsg(msg);
      setScanState('error');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            ResoSync needs camera access to scan attendance QR codes from your instructor.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.permissionButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* We keep CameraView mounted at all times to prevent Android crash bugs when unmounting rapidly */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFill}
      />

      {/* Dark overlay with QR cutout */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.qrFrame}>
            {/* Corner marks */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.title}>Scan Attendance</Text>
      </View>

      {/* Bottom instructions */}
      {scanState === 'scanning' && (
        <View style={styles.bottomBar}>
          <Text style={styles.instruction}>Align the QR code inside the frame</Text>
        </View>
      )}

      {scanState === 'processing' && (
        <View style={styles.overlayFull}>
          <View style={styles.processingCard}>
            <Text style={styles.processingText}>Verifying Access...</Text>
          </View>
        </View>
      )}

      {scanState === 'success' && successData && (
        <View style={styles.overlayFull}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <CheckCircle size={56} color={colors.success} strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>Attendance Marked</Text>
            <Text style={styles.successSubtitle}>Session #{successData.sessionId}</Text>
            <Text style={styles.successTime}>Marked at {successData.markedAt}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => { resetScan(); navigation.navigate('Home' as never); }}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scanState === 'error' && (
        <View style={styles.overlayFull}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <X size={48} color={colors.danger} strokeWidth={1.5} />
            </View>
            <Text style={styles.errorTitle}>Scan Failed</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
              <Text style={styles.retryButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(9, 9, 11, 0.85)';
const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#09090B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#09090B',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: '#09090B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  permissionText: { color: '#71717A', fontSize: 16 },

  // Overlay
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'column' },
  overlayTop: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayMiddle: { flexDirection: 'row', height: QR_SIZE },
  overlaySide: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayBottom: { flex: 1, backgroundColor: OVERLAY_COLOR },
  qrFrame: {
    width: QR_SIZE,
    height: QR_SIZE,
    backgroundColor: 'transparent',
  },
  overlayFull: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10,
  },

  // Corners
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFFFFF',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },

  // UI elements
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: '#09090B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },

  // Processing
  processingCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  processingText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  // Success
  successCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#09090B',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#52525B',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  successTime: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#09090B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  // Error
  errorCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  errorIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#09090B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
