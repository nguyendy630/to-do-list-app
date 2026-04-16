// StAuth10244: I Dylan Nguyen, 000949131 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

import { useState, useEffect } from 'react';
import {
	Text,
	View,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	FlatList,
	Alert,
	SafeAreaView
} from 'react-native';

import {
	useFonts,
	FunnelSans_400Regular,
	FunnelSans_500Medium
} from '@expo-google-fonts/funnel-sans';

const BACKEND_URL = 'http://localhost:3001';

export default function App() {
	const [todos, setTodos] = useState([]);
	const [inputText, setInputText] = useState('');
	const [editingIndex, setEditingIndex] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	let [fontsLoaded] = useFonts({
		FunnelSans_400Regular,
		FunnelSans_500Medium,
	});

	useEffect(() => {
		loadTodos();
	}, []);

	const loadTodos = async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/load`);
			const data = await response.json();
			setTodos(data);
			setIsLoading(false);
		} catch (err) {
			console.error('Error loading todos:', err);
			setIsLoading(false);
			Alert.alert('Error', 'Failed to load TODO items');
		}
	};

	const saveTodos = async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(todos),
			});
			const data = await response.json();
			if (data.status === 'save successful') {
				Alert.alert('Saved', 'Your tasks have been saved');
			}
		} catch (err) {
			console.error('Error saving todos:', err);
			Alert.alert('Error', 'Failed to save TODO items');
		}
	};

	const clearTodos = async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/clear`);
			const data = await response.json();
			if (data.status === 'clear successful') {
				setTodos([]);
				Alert.alert('Cleared', 'All tasks have been removed');
			}
		} catch (err) {
			console.error('Error clearing todos:', err);
			Alert.alert('Error', 'Failed to clear TODO items');
		}
	};

	const handleAdd = () => {
		if (inputText.trim() === '') return;
		setTodos([...todos, inputText.trim()]);
		setInputText('');
	};

	const handleEdit = () => {
		if (inputText.trim() === '') return;
		const newTodos = [...todos];
		newTodos[editingIndex] = inputText.trim();
		setTodos(newTodos);
		setInputText('');
		setEditingIndex(null);
	};

	const handleDelete = (index) => {
		setTodos(todos.filter((_, i) => i !== index));
	};

	const startEditing = (index) => {
		setInputText(todos[index]);
		setEditingIndex(index);
	};

	const cancelEditing = () => {
		setInputText('');
		setEditingIndex(null);
	};

	if (!fontsLoaded) return null;

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Tasks</Text>
					<Text style={styles.subtitle}>{todos.length} items</Text>
				</View>

				{/* Action buttons */}
				<View style={styles.actionRow}>
					<TouchableOpacity style={styles.actionButton} onPress={saveTodos}>
						<Text style={styles.actionButtonText}>Save</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionButtonSecondary} onPress={loadTodos}>
						<Text style={styles.actionButtonSecondaryText}>Restore</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionButtonSecondary} onPress={clearTodos}>
						<Text style={styles.actionButtonSecondaryText}>Clear</Text>
					</TouchableOpacity>
				</View>

				{/* Input */}
				<View style={styles.inputContainer}>
					<View style={styles.inputWrapper}>
						<Text style={styles.inputPrefix}>+</Text>
						<TextInput
							style={styles.input}
							value={inputText}
							onChangeText={setInputText}
							placeholder={editingIndex !== null ? 'Edit task...' : 'Add a task...'}
							placeholderTextColor="#9b9b9b"
							onSubmitEditing={editingIndex !== null ? handleEdit : handleAdd}
						/>
						{editingIndex !== null ? (
							<TouchableOpacity style={styles.inputButton} onPress={handleEdit}>
								<Text style={styles.inputButtonText}>Save</Text>
							</TouchableOpacity>
						) : (
							inputText.length > 0 && (
								<TouchableOpacity style={styles.inputButton} onPress={handleAdd}>
									<Text style={styles.inputButtonText}>Add</Text>
								</TouchableOpacity>
							)
						)}
						{editingIndex !== null && (
							<TouchableOpacity style={styles.cancelTextButton} onPress={cancelEditing}>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* List */}
				<FlatList
					data={todos}
					keyExtractor={(item, index) => index.toString()}
					style={styles.list}
					contentContainerStyle={styles.listContent}
					renderItem={({ item, index }) => (
						<TouchableOpacity
							style={styles.todoItem}
							onPress={() => startEditing(index)}
							activeOpacity={0.7}
						>
							<View style={styles.todoBullet} />
							<Text style={styles.todoText}>{item}</Text>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => handleDelete(index)}
							>
								<Text style={styles.deleteButtonText}>×</Text>
							</TouchableOpacity>
						</TouchableOpacity>
					)}
				/>

				{todos.length === 0 && (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyTitle}>No tasks yet</Text>
						<Text style={styles.emptySubtitle}>Type a task above to get started</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		color: '#9b9b9b',
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		marginBottom: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#191919',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: '#9b9b9b',
	},
	actionRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 20,
	},
	actionButton: {
		backgroundColor: '#191919',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 6,
	},
	actionButtonText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '500',
	},
	actionButtonSecondary: {
		backgroundColor: '#f5f5f5',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 6,
	},
	actionButtonSecondaryText: {
		color: '#191919',
		fontSize: 14,
		fontWeight: '500',
	},
	inputContainer: {
		marginBottom: 24,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f7f7f5',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	inputPrefix: {
		fontSize: 18,
		color: '#9b9b9b',
		marginRight: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: '#191919',
		paddingVertical: 12,
	},
	inputButton: {
		backgroundColor: '#191919',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 6,
		marginLeft: 8,
	},
	inputButtonText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '500',
	},
	cancelTextButton: {
		paddingHorizontal: 12,
	},
	cancelText: {
		color: '#9b9b9b',
		fontSize: 14,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingBottom: 20,
	},
	todoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	todoBullet: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#e0e0e0',
		marginRight: 12,
	},
	todoText: {
		flex: 1,
		fontSize: 16,
		color: '#37352f',
		lineHeight: 22,
	},
	deleteButton: {
		padding: 8,
		marginRight: -8,
	},
	deleteButtonText: {
		fontSize: 20,
		color: '#9b9b9b',
		fontWeight: '300',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 100,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#37352f',
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: '#9b9b9b',
	},
});