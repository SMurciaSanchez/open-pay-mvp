import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';

const services = [
  { id: '1', name: 'Electricidad (CFE)', icon: '⚡', category: 'Servicios básicos' },
  { id: '2', name: 'Agua', icon: '💧', category: 'Servicios básicos' },
  { id: '3', name: 'Gas natural', icon: '🔥', category: 'Servicios básicos' },
  { id: '4', name: 'Internet (Telmex)', icon: '🌐', category: 'Telecomunicaciones' },
  { id: '5', name: 'Teléfono celular', icon: '📱', category: 'Telecomunicaciones' },
  { id: '6', name: 'TV de paga', icon: '📺', category: 'Telecomunicaciones' },
  { id: '7', name: 'Predial', icon: '🏠', category: 'Gobierno' },
  { id: '8', name: 'Tenencia vehicular', icon: '🚗', category: 'Gobierno' },
];

type Service = typeof services[0];

const ServicesScreen = () => {
  const [selected, setSelected] = useState<Service | null>(null);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!reference.trim() || !amount.trim()) {
      Alert.alert('Error', 'Completa referencia y monto');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSelected(null);
    setReference('');
    setAmount('');
    Alert.alert('¡Pago exitoso!', `Pago de $${Number(amount).toLocaleString('es-MX')} realizado correctamente`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pago de servicios</Text>
      <FlatList
        data={services}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selected?.icon} {selected?.name}</Text>
            <Text style={styles.label}>Número de referencia</Text>
            <TextInput style={styles.input} placeholder="Ej: 123456789" value={reference} onChangeText={setReference} keyboardType="number-pad" />
            <Text style={styles.label}>Monto (MXN)</Text>
            <TextInput style={styles.input} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handlePay} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Pagar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, margin: 6, padding: 16, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
  cardCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#6B7280', fontSize: 15 },
});

export default ServicesScreen;
