import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getOrCreateProfile, getTransactions, Transaction } from '../../lib/supabase';

type FilterType = 'all' | 'credit' | 'debit';

const TransactionsScreen = () => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const loadData = useCallback(async () => {
    try {
      const prof = await getOrCreateProfile();
      setProfileId(prof.id);
      const txs = await getTransactions(prof.id, 50);
      setTransactions(txs);
    } catch (e) {
      console.error('Error cargando transacciones:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const getTxType = (tx: Transaction): 'credit' | 'debit' =>
    profileId && tx.receiverId === profileId ? 'credit' : 'debit';

  const filtered = transactions.filter(tx => {
    const type = getTxType(tx);
    const desc = tx.description || '';
    const matchSearch = desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || type === filter;
    return matchSearch && matchFilter;
  });

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Buscar transacciones..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filters}>
        {(['all', 'credit', 'debit'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todas' : f === 'credit' ? 'Entradas' : 'Salidas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const type = getTxType(item);
          return (
            <View style={styles.txItem}>
              <View style={[styles.txIcon, type === 'credit' ? styles.iconCredit : styles.iconDebit]}>
                <Text style={styles.iconText}>{type === 'credit' ? '↓' : '↑'}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>
                  {item.description || (type === 'credit' ? 'Transferencia recibida' : 'Transferencia enviada')}
                </Text>
                <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.txStatus}>{item.status}</Text>
              </View>
              <Text style={[styles.txAmount, type === 'credit' ? styles.amtCredit : styles.amtDebit]}>
                {type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No hay transacciones</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  txItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconCredit: { backgroundColor: '#D1FAE5' },
  iconDebit: { backgroundColor: '#FEE2E2' },
  iconText: { fontSize: 18 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  txDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  txStatus: { fontSize: 11, color: '#9CA3AF', marginTop: 1, textTransform: 'capitalize' },
  txAmount: { fontSize: 15, fontWeight: '600' },
  amtCredit: { color: '#059669' },
  amtDebit: { color: '#DC2626' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});

export default TransactionsScreen;
