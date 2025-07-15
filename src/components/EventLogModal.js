import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const EventLogModal = ({ visible, onClose, event, onLogComplete }) => {
  const [intensity, setIntensity] = useState('');
  const [mood, setMood] = useState('');
  const [sorenessLevel, setSorenessLevel] = useState(5);
  const [injuryNotes, setInjuryNotes] = useState('');

  const intensityLevels = [
    { value: 'low', label: 'Low', color: '#34C759' },
    { value: 'moderate', label: 'Moderate', color: '#FF9500' },
    { value: 'high', label: 'High', color: '#FF3B30' },
  ];

  const moodOptions = [
    'Great!', 'Good', 'Okay', 'Tired', 'Sore', 'Injured'
  ];

  const handleSubmit = async () => {
    if (!intensity) {
      Alert.alert('Error', 'Please select an intensity level');
      return;
    }

    try {
      // Check if this is a mock event (doesn't have a proper UUID)
      const isMockEvent = event.id && event.id.includes('-');
      
      if (isMockEvent) {
        // For mock events, just show success and don't save to database
        const mockLogData = {
          id: `mock-log-${Date.now()}`,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_id: event.id,
          type: event.type,
          intensity,
          mood,
          soreness_level: sorenessLevel,
          injury_notes: injuryNotes,
          logged_at: new Date().toISOString(),
        };
        
        Alert.alert('Success', 'Event logged successfully! (Mock data)');
        onLogComplete(mockLogData);
        onClose();
        
        // Reset form
        setIntensity('');
        setMood('');
        setSorenessLevel(5);
        setInjuryNotes('');
        return;
      }

      // For real events, save to database
      const { data, error } = await supabase
        .from('event_logs')
        .insert([{
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_id: event.id,
          type: event.type,
          intensity,
          mood,
          soreness_level: sorenessLevel,
          injury_notes: injuryNotes,
        }])
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Event logged successfully!');
      onLogComplete(data[0]);
      onClose();
      
      // Reset form
      setIntensity('');
      setMood('');
      setSorenessLevel(5);
      setInjuryNotes('');
    } catch (error) {
      console.error('Error logging event:', error);
      Alert.alert('Error', 'Failed to log event');
    }
  };

  const renderIntensitySelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>How intense was this {event?.type}?</Text>
      <View style={styles.intensityContainer}>
        {intensityLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.intensityButton,
              intensity === level.value && {
                backgroundColor: level.color,
                borderColor: level.color,
              },
            ]}
            onPress={() => setIntensity(level.value)}
          >
            <Text
              style={[
                styles.intensityButtonText,
                intensity === level.value && styles.intensityButtonTextActive,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMoodSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>How are you feeling?</Text>
      <View style={styles.moodContainer}>
        {moodOptions.map((moodOption) => (
          <TouchableOpacity
            key={moodOption}
            style={[
              styles.moodButton,
              mood === moodOption && styles.moodButtonActive,
            ]}
            onPress={() => setMood(moodOption)}
          >
            <Text
              style={[
                styles.moodButtonText,
                mood === moodOption && styles.moodButtonTextActive,
              ]}
            >
              {moodOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSorenessSlider = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Soreness Level (1-10)</Text>
      <View style={styles.sorenessContainer}>
        <Text style={styles.sorenessLabel}>1</Text>
        <View style={styles.sorenessSlider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.sorenessDot,
                sorenessLevel >= level && styles.sorenessDotActive,
              ]}
              onPress={() => setSorenessLevel(level)}
            />
          ))}
        </View>
        <Text style={styles.sorenessLabel}>10</Text>
      </View>
      <Text style={styles.sorenessValue}>Level {sorenessLevel}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log {event?.type}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event?.title}</Text>
              <Text style={styles.eventTime}>
                {event?.start_time && new Date(event.start_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>

            {renderIntensitySelector()}
            {renderMoodSelector()}
            {renderSorenessSlider()}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Injury Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={injuryNotes}
                onChangeText={setInjuryNotes}
                placeholder="Any injuries or concerns..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Log Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 20,
  },
  eventInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  intensityButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  intensityButtonTextActive: {
    color: 'white',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  moodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  moodButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moodButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  sorenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sorenessLabel: {
    fontSize: 12,
    color: '#8E8E93',
    width: 20,
  },
  sorenessSlider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  sorenessDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E5EA',
  },
  sorenessDotActive: {
    backgroundColor: '#007AFF',
  },
  sorenessValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default EventLogModal; 