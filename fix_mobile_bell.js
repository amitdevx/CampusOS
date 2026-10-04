const fs = require('fs');
const file = 'apps/mobile/src/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("const [showNotifs, setShowNotifs] = useState(false);")) {
  content = content.replace(
    "const [refreshing, setRefreshing] = useState(false);",
    "const [refreshing, setRefreshing] = useState(false);\n  const [showNotifs, setShowNotifs] = useState(false);"
  );
  
  content = content.replace(
    "<TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>",
    "<TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => setShowNotifs(true)}>"
  );

  const modalCode = `
      <Modal visible={showNotifs} transparent animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
          <View style={{width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '70%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>System Alerts</Text>
              <TouchableOpacity onPress={() => setShowNotifs(false)}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {notifications.length === 0 ? (
                <Text style={{color: '#888', textAlign: 'center', marginTop: 20}}>No active alerts.</Text>
              ) : (
                notifications.map((n, i) => (
                  <View key={i} style={{padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8}}>
                    <Text style={{fontWeight: 'bold', fontSize: 14}}>{n.title || 'Notification'}</Text>
                    <Text style={{fontSize: 13, color: '#555', marginTop: 4}}>{n.message || n}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
  `;
  
  content = content.replace("</Screen>", modalCode + "\n    </Screen>");
  
  if (!content.includes("import { Modal, ScrollView")) {
      content = content.replace(
        "import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';",
        "import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';"
      );
  }
  
  fs.writeFileSync(file, content);
}
