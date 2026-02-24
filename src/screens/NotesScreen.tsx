import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';
import NoteCard from '../components/NoteCard';
import type { Note } from '../types/note';

const STORAGE_KEY = '@taskflow_notes';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json) as Note[];
          setNotes(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.warn('Failed to load notes:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadNotes();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (e) {
        console.warn('Failed to save notes:', e);
      }
    };
    save();
  }, [notes, isLoaded]);

  const handleAddNote = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setNotes((prev) => [...prev, { id: Date.now().toString(), text: trimmed, createdAt: Date.now() }]);
    setInputText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
      </View>
      <View style={styles.content}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Write a note..."
            placeholderTextColor={colors.light.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Pressable
            onPress={handleAddNote}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
            <Text style={styles.addBtnText}>Add Note</Text>
          </Pressable>
        </KeyboardAvoidingView>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NoteCard note={item} onDelete={() => handleDeleteNote(item.id)} />}
          contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={<Text style={styles.placeholder}>No notes yet. Add one above!</Text>}
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
  inputSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.light.text,
    minHeight: 80,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
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
  placeholder: {
    fontSize: 16,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
});
