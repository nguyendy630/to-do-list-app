// StAuth10244: I Dylan Nguyen, 000949131 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

import { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';

import {
  useFonts,
  FunnelSans_400Regular,
  FunnelSans_500Medium,
} from '@expo-google-fonts/funnel-sans';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:3001'

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['Personal', 'Work', 'School', 'Health', 'Finance', 'Other'];

// Notion-like neutral palette
const PRIORITY_COLOR = {
  low: '#9ca3af',
  medium: '#6b7280',
  high: '#374151',
};

const PRIORITY_BG = {
  low: '#fafafa',
  medium: '#f5f5f5',
  high: '#f0f0f0',
};

const today = () => new Date().toISOString().split('T')[0];

const blankForm = () => ({
  title: '',
  priority: 'medium',
  category: 'Personal',
  due_date: today(),
  completed: false,
});

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null); // null = adding new
  const [form, setForm] = useState(blankForm());
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [detailTodo, setDetailTodo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  let [fontsLoaded] = useFonts({ FunnelSans_400Regular, FunnelSans_500Medium });

  // ── Derived stats ──
  const completedCount = todos.filter(t => t.completed).length;
  const streak = completedCount; // simple streak: total completed

  const filtered = todos.filter(t => {
    const byPriority = filterPriority === 'all' || t.priority === filterPriority;
    const byCategory = filterCategory === 'all' || t.category === filterCategory;
    return byPriority && byCategory;
  });

  // ── API: GET /api/ ── load all
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/`);
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      Alert.alert('Error', 'Could not reach the server. Is it running on port 3001?');
    } finally {
      setIsLoading(false);
    }
  };

  // ── API: POST /api/ ── create item
  const createTodo = async (item) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.status === 'CREATE ENTRY SUCCESSFUL') await fetchAll();
      else Alert.alert('Error', 'Server rejected the create request.');
    } catch (e) {
      Alert.alert('Error', 'Failed to create task.');
    }
  };

  // ── API: PUT /api/:id ── update item
  const updateTodo = async (id, updates) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.status === 'UPDATE ITEM SUCCESSFUL') await fetchAll();
      else Alert.alert('Error', 'Server rejected the update request.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  // ── API: DELETE /api/:id ── delete item
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'DELETE ITEM SUCCESSFUL') await fetchAll();
      else Alert.alert('Error', 'Server rejected the delete request.');
    } catch (e) {
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  // ── API: DELETE /api/ ── delete entire collection
  const deleteAll = async () => {
    Alert.alert('Clear All', 'This will permanently delete every task. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${BACKEND_URL}/api/`, { method: 'DELETE' });
            const data = await res.json();
            if (data.status === 'DELETE COLLECTION SUCCESSFUL') await fetchAll();
          } catch (e) {
            Alert.alert('Error', 'Failed to clear tasks.');
          }
        }
      }
    ]);
  };

  // ── API: PUT /api/ ── replace entire collection
  const replaceCollection = async (newCollection) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection),
      });
      const data = await res.json();
      if (data.status === 'REPLACE COLLECTION SUCCESSFUL') await fetchAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to replace collection.');
    }
  };

  // ── API: GET /api/:id ── view single item (used in detail modal)
  const viewDetail = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/${id}`);
      const data = await res.json();
      setDetailTodo(data);
      setDetailVisible(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to load task detail.');
    }
  };

  // ── Modal helpers ──
  const openAdd = () => {
    setEditingTodo(null);
    setForm(blankForm());
    setModalVisible(true);
  };

  const openEdit = (todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title,
      priority: todo.priority,
      category: todo.category,
      due_date: todo.due_date,
      completed: todo.completed,
    });
    setModalVisible(true);
  };

  const submitForm = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Task title cannot be empty.');
      return;
    }
    setModalVisible(false);
    if (editingTodo) {
      await updateTodo(editingTodo.id, form);
    } else {
      await createTodo(form);
    }
  };

  const toggleComplete = async (todo) => {
    await updateTodo(todo.id, { ...todo, completed: !todo.completed });
  };

  // ── Mark all complete (uses PUT /api/ replace) ──
  const markAllComplete = () => {
    const updated = todos.map(t => ({ ...t, completed: true }));
    replaceCollection(updated);
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading tasks…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Tasks</Text>
          <Text style={styles.appSubtitle}>{todos.length} tasks, {completedCount} done</Text>
        </View>
      </View>

      {/* ── Filter bar ── */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', ...PRIORITIES].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.filterChip, filterPriority === p && styles.filterChipActive]}
              onPress={() => setFilterPriority(p)}
            >
              {p !== 'all' && (
                <View style={[styles.filterDot, { backgroundColor: PRIORITY_COLOR[p] }]} />
              )}
              <Text style={[styles.filterChipText, filterPriority === p && styles.filterChipTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginTop: 6 }]}>
          {['all', ...CATEGORIES].map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.filterChip, filterCategory === c && styles.filterChipActive]}
              onPress={() => setFilterCategory(c)}
            >
              <Text style={[styles.filterChipText, filterCategory === c && styles.filterChipTextActive]}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Toolbar ── */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={fetchAll}>
          <Text style={styles.toolbarBtnText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarBtn} onPress={markAllComplete}>
          <Text style={styles.toolbarBtnText}>Complete All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolbarBtn, styles.toolbarBtnDanger]} onPress={deleteAll}>
          <Text style={[styles.toolbarBtnText, styles.toolbarBtnDangerText]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks</Text>
            <Text style={styles.emptyBody}>Click + to add a new task</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.completed && styles.cardDone, { borderLeftColor: PRIORITY_COLOR[item.priority] }]}>
            {/* Checkbox */}
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleComplete(item)}>
              <View style={[styles.checkboxInner, item.completed && styles.checkboxChecked]}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Content */}
            <TouchableOpacity style={styles.cardContent} onPress={() => viewDetail(item.id)} activeOpacity={0.7}>
              <Text style={[styles.cardTitle, item.completed && styles.cardTitleDone]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.cardMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_BG[item.priority] }]}>
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
                  <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>
                    {item.priority}
                  </Text>
                </View>
                <Text style={styles.categoryText}>{item.category}</Text>
                <Text style={styles.dateText}>{item.due_date}</Text>
              </View>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTodo(item.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── Add / Edit Modal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editingTodo ? 'Edit Task' : 'New Task'}</Text>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
              placeholder="What needs to be done?"
              placeholderTextColor="#aaa"
              autoFocus
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.segmentRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.segmentBtn, form.priority === p && { backgroundColor: PRIORITY_COLOR[p] }]}
                  onPress={() => setForm(f => ({ ...f, priority: p }))}
                >
                  <Text style={[styles.segmentText, form.priority === p && { color: '#fff', fontWeight: '600' }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.segmentBtn, form.category === c && styles.segmentBtnActive]}
                  onPress={() => setForm(f => ({ ...f, category: c }))}
                >
                  <Text style={[styles.segmentText, form.category === c && { color: '#fff', fontWeight: '600' }]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.due_date}
              onChangeText={v => setForm(f => ({ ...f, due_date: v }))}
              placeholder="2025-12-31"
              placeholderTextColor="#aaa"
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={submitForm}>
                <Text style={styles.modalSaveText}>{editingTodo ? 'Save Changes' : 'Add Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal visible={detailVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {detailTodo && (
              <>
                <Text style={styles.modalTitle}>Task Detail</Text>
                <View style={[styles.detailRow, { borderLeftWidth: 4, borderLeftColor: PRIORITY_COLOR[detailTodo.priority], paddingLeft: 12, marginBottom: 16 }]}>
                  <Text style={styles.detailTitle}>{detailTodo.title}</Text>
                </View>
                <DetailRow label="ID" value={String(detailTodo.id)} />
                <DetailRow label="Priority" value={detailTodo.priority} />
                <DetailRow label="Category" value={detailTodo.category} />
                <DetailRow label="Due Date" value={detailTodo.due_date} />
                <DetailRow label="Status" value={detailTodo.completed ? '✅ Completed' : '⏳ Pending'} />
                <TouchableOpacity style={[styles.modalSaveBtn, { marginTop: 20 }]} onPress={() => setDetailVisible(false)}>
                  <Text style={styles.modalSaveText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── SMALL COMPONENTS ──────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRowContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', fontSize: 16 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0efee',
  },
  appName: { fontSize: 26, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  appSubtitle: { fontSize: 12, color: '#aaa', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: {
    backgroundColor: '#f5f5f4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 48,
  },
  statNumber: { fontSize: 15, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 10, color: '#aaa', marginTop: 1 },

  // Filters
  filterSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0efee' },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f4',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: { backgroundColor: '#111', borderColor: '#111' },
  filterDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0efee',
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f5f5f4',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  toolbarBtnDanger: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  toolbarBtnText: { fontSize: 12, color: '#444', fontWeight: '500' },

  // List
  list: { flex: 1 },
  listContent: { padding: 16, gap: 10, paddingBottom: 100 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDone: { opacity: 0.55 },
  checkbox: { marginRight: 12 },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d4d4d0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1c1c1c', marginBottom: 6 },
  cardTitleDone: { textDecorationLine: 'line-through', color: '#aaa' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  priorityDot: { width: 5, height: 5, borderRadius: 3 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  categoryText: { fontSize: 11, color: '#888', backgroundColor: '#f5f5f4', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  dateText: { fontSize: 11, color: '#aaa' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 15 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 22, color: '#ccc', fontWeight: '300', lineHeight: 22 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#444', marginBottom: 6 },
  emptyBody: { fontSize: 14, color: '#aaa' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '300' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#f5f5f4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f4',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    marginRight: 6,
  },
  segmentBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  segmentText: { fontSize: 13, color: '#555', fontWeight: '500' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f4',
    alignItems: 'center',
  },
  modalCancelText: { color: '#555', fontSize: 15, fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Detail
  detailRowContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0efee' },
  detailLabel: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#111', fontWeight: '600' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  detailRow: {},
});