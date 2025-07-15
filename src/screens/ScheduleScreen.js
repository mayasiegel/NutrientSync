import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import EventLogModal from '../components/EventLogModal';
import TimePickerModal from '../components/TimePickerModal';
import scheduleService from '../services/scheduleService';

const ScheduleScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerType, setTimePickerType] = useState('start'); // 'start' or 'end'
  const [newEvent, setNewEvent] = useState({
    type: 'practice',
    title: '',
    date: new Date(),
    startTime: '17:00',
    endTime: '18:00',
    location: '',
    notes: '',
    isRecurring: false,
    recurrenceDays: [],
  });

  // Mock data for testing
  const mockEvents = scheduleService.getMockEvents();

  useEffect(() => {
    // For now, use mock data
    setEvents(mockEvents);
    // TODO: Replace with actual Supabase query
    // fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    }
  };

  const addEvent = async () => {
    if (!newEvent.title) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      // Create ISO strings from date and time
      const startDateTime = new Date(newEvent.date);
      const [startHour, startMinute] = newEvent.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const endDateTime = new Date(newEvent.date);
      const [endHour, endMinute] = newEvent.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const eventData = {
        type: newEvent.type,
        title: newEvent.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: newEvent.location,
        notes: newEvent.notes,
        isRecurring: newEvent.isRecurring,
        recurrence: newEvent.isRecurring ? {
          frequency: 'weekly',
          days: newEvent.recurrenceDays
        } : null,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('schedule_events')
        .insert([eventData])
        .select();

      if (error) throw error;

      setEvents([...events, data[0]]);
      setModalVisible(false);
      setNewEvent({
        type: 'practice',
        title: '',
        date: new Date(),
        startTime: '17:00',
        endTime: '18:00',
        location: '',
        notes: '',
        isRecurring: false,
        recurrenceDays: [],
      });
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (timeString) => {
    return scheduleService.formatTime(timeString);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'practice':
        return '🏀';
      case 'game':
        return '⚽';
      default:
        return '📅';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'practice':
        return '#007AFF';
      case 'game':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendar = [];
    let dayCounter = 1;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        if (week === 0 && day < startingDay) {
          weekDays.push(<View key={`empty-${week}-${day}`} style={styles.calendarDay} />);
        } else if (dayCounter > daysInMonth) {
          weekDays.push(<View key={`empty-end-${week}-${day}`} style={styles.calendarDay} />);
        } else {
          const currentDate = new Date(currentYear, currentMonth, dayCounter);
          const isToday = currentDate.toDateString() === today.toDateString();
          const isSelected = currentDate.toDateString() === selectedDate.toDateString();
          const dayEvents = getEventsForDate(currentDate);

          weekDays.push(
            <TouchableOpacity
              key={`day-${week}-${dayCounter}`}
              style={[
                styles.calendarDay,
                isToday && styles.today,
                isSelected && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(currentDate)}
            >
              <Text style={[
                styles.dayText,
                isToday && styles.todayText,
                isSelected && styles.selectedDayText,
              ]}>
                {dayCounter}
              </Text>
              {dayEvents.length > 0 && (
                <View style={[styles.eventDot, { backgroundColor: getEventColor(dayEvents[0].type) }]} />
              )}
            </TouchableOpacity>
          );
          dayCounter++;
        }
      }
      calendar.push(
        <View key={week} style={styles.calendarWeek}>
          {weekDays}
        </View>
      );
    }

    return calendar;
  };

  const renderEventList = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    if (dayEvents.length === 0) {
      return (
        <View style={styles.noEvents}>
          <Text style={styles.noEventsText}>No events scheduled</Text>
          <Text style={styles.noEventsSubtext}>Tap + to add an event</Text>
        </View>
      );
    }

    return dayEvents.map(event => (
      <View key={event.id} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>
              {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </Text>
            {event.location && (
              <Text style={styles.eventLocation}>📍 {event.location}</Text>
            )}
            {event.isRecurring && (
              <View style={styles.recurringBadge}>
                <Ionicons name="repeat" size={12} color="#007AFF" />
                <Text style={styles.recurringText}>Weekly</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedEvent(event);
              setLogModalVisible(true);
            }}
          >
            <Text style={styles.actionText}>Log Intensity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>View Meals</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => {
            setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
          }}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => {
            setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
          }}>
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={`weekday-${index}`} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {renderCalendar()}
        </View>
      </View>

      {/* Events for Selected Date */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <ScrollView style={styles.eventsList}>
          {renderEventList()}
        </ScrollView>
      </View>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Event Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newEvent.type === 'practice' && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type: 'practice' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newEvent.type === 'practice' && styles.typeButtonTextActive,
                    ]}>
                      🏀 Practice
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newEvent.type === 'game' && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type: 'game' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newEvent.type === 'game' && styles.typeButtonTextActive,
                    ]}>
                      ⚽ Game
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Event Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                  placeholder="e.g., Basketball Practice"
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    // For now, just show the current date
                    // TODO: Add proper date picker
                    Alert.alert('Date', formatDate(newEvent.date));
                  }}
                >
                  <Text style={styles.dateButtonText}>{formatDate(newEvent.date)}</Text>
                  <Ionicons name="calendar" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {/* Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <View style={styles.timeContainer}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Start</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setTimePickerType('start');
                        setTimePickerVisible(true);
                      }}
                    >
                      <Text style={styles.timeButtonText}>{newEvent.startTime}</Text>
                      <Ionicons name="time" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>End</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setTimePickerType('end');
                        setTimePickerVisible(true);
                      }}
                    >
                      <Text style={styles.timeButtonText}>{newEvent.endTime}</Text>
                      <Ionicons name="time" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Recurring Event */}
              <View style={styles.inputGroup}>
                <View style={styles.recurringHeader}>
                  <Text style={styles.inputLabel}>Repeat</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setNewEvent({ ...newEvent, isRecurring: !newEvent.isRecurring })}
                  >
                    <View style={[
                      styles.toggleSwitch,
                      newEvent.isRecurring && styles.toggleSwitchActive
                    ]}>
                      <View style={[
                        styles.toggleThumb,
                        newEvent.isRecurring && styles.toggleThumbActive
                      ]} />
                    </View>
                  </TouchableOpacity>
                </View>
                
                {newEvent.isRecurring && (
                  <View style={styles.recurringDays}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day.key}
                        style={[
                          styles.dayButton,
                          newEvent.recurrenceDays.includes(day.key) && styles.dayButtonActive
                        ]}
                        onPress={() => {
                          const updatedDays = newEvent.recurrenceDays.includes(day.key)
                            ? newEvent.recurrenceDays.filter(d => d !== day.key)
                            : [...newEvent.recurrenceDays, day.key];
                          setNewEvent({ ...newEvent, recurrenceDays: updatedDays });
                        }}
                      >
                        <Text style={[
                          styles.dayButtonText,
                          newEvent.recurrenceDays.includes(day.key) && styles.dayButtonTextActive
                        ]}>
                          {day.label.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                  placeholder="e.g., High School Gym"
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.notes}
                  onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
                  placeholder="Any additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addEvent}
              >
                <Text style={styles.saveButtonText}>Save Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Log Modal */}
      <EventLogModal
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        event={selectedEvent}
        onLogComplete={(loggedEvent) => {
          console.log('Event logged:', loggedEvent);
          // You can add additional logic here, like updating the UI
        }}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        currentTime={timePickerType === 'start' ? newEvent.startTime : newEvent.endTime}
        onTimeSelect={(time) => {
          if (timePickerType === 'start') {
            setNewEvent({ ...newEvent, startTime: time });
          } else {
            setNewEvent({ ...newEvent, endTime: time });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  calendar: {
    marginBottom: 8,
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarDay: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  today: {
    backgroundColor: '#007AFF',
  },
  todayText: {
    color: 'white',
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#E5F2FF',
  },
  selectedDayText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  eventsList: {
    flex: 1,
  },
  noEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
  },
  eventCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '500',
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 4,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  recurringDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  recurringText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 2,
  },
});

export default ScheduleScreen; 