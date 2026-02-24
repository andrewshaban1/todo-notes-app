import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../constants/theme';
import { Task } from '../types/task';
import TaskItem from '../components/TaskItem';

const STORAGE_KEY = '@taskflow_tasks';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json) as Task[];
          setTasks(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.warn('Error to load tasks:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.warn('Error to save tasks:', error);
      }
    };
    save();
  }, [tasks, isLoaded]);

  const handleAddTask = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setTasks((prevTasks) => [...prevTasks, { id: Date.now().toString(), text: trimmed, done: false }]);
    setInputText('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
      </View>
      <View style={styles.content}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a task..."
            placeholderTextColor={colors.light.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTask}
            returnKeyType="go"
          />
          <Pressable
            onPress={handleAddTask}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </KeyboardAvoidingView>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={() => handleToggleTask(item.id)}
              onDelete={() => handleDeleteTask(item.id)}
            />
          )}
          contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={<Text style={styles.placeholder}>No tasks yet. Add one above!</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.light.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholder: {
    fontSize: 16,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.light.text,
  },
  addBtn: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnPressed: {
    opacity: 0.8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
