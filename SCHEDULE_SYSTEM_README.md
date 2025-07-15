# 📅 Schedule System Implementation

## Overview
The Schedule System is now fully integrated into NutrientSync! This feature allows student-athletes to manage their practice and game schedules, log post-event intensity and recovery data, and get personalized meal recommendations based on their training load.

## ✅ What's Implemented

### 1. **Database Tables**
- `schedule_events` - Stores practice and game events
- `event_logs` - Stores post-event intensity, mood, and recovery data
- Both tables have proper RLS (Row Level Security) policies

### 2. **UI Components**
- **ScheduleScreen** - Main calendar view with event management
- **EventLogModal** - Post-event logging interface
- **Modern, minimalist design** with iOS-style components

### 3. **Features**
- 📅 **Calendar View** - Monthly calendar with event indicators
- ➕ **Add Events** - Create practice and game events
- 📝 **Event Logging** - Log intensity, mood, and soreness after events
- 🎯 **Event Actions** - Quick access to log intensity and view meals
- 📱 **Responsive Design** - Works on both iOS and Android

### 4. **Services**
- `scheduleService.js` - Handles all schedule-related operations
- Date/time formatting utilities
- Database operations (CRUD)
- Training load calculations

## 🚀 How to Use

### Adding the Schedule Tab
The Schedule screen is now available as a new tab in your bottom navigation. Users can:

1. **View Calendar** - See all events in a monthly view
2. **Add Events** - Tap the + button to create new events
3. **Select Dates** - Tap on any date to see events for that day
4. **Log Events** - Tap "Log Intensity" to record post-event data

### Creating Events
1. Tap the + button in the Schedule screen
2. Choose event type (Practice or Game)
3. Enter event details:
   - Title (e.g., "Basketball Practice")
   - Start and end times (ISO format for now)
   - Location (optional)
   - Notes (optional)
4. Tap "Save Event"

### Logging Event Data
1. Tap "Log Intensity" on any event
2. Select intensity level (Low, Moderate, High)
3. Choose mood (Great!, Good, Okay, Tired, Sore, Injured)
4. Set soreness level (1-10 scale)
5. Add injury notes (optional)
6. Tap "Log Event"

## 🔧 Technical Details

### Database Schema
```sql
-- schedule_events table
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('practice', 'game')),
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  notes TEXT,
  -- ... other fields
);

-- event_logs table
CREATE TABLE event_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES schedule_events(id),
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')),
  mood TEXT,
  soreness_level INTEGER,
  injury_notes TEXT,
  -- ... other fields
);
```

### Key Functions
- `scheduleService.getAllEvents(userId)` - Get all events for a user
- `scheduleService.createEvent(eventData)` - Create new event
- `scheduleService.logEvent(logData)` - Log post-event data
- `scheduleService.calculateTrainingLoad(userId)` - Calculate training load

## 🎨 UI/UX Features

### Design Principles
- **Minimalist** - Clean, uncluttered interface
- **Modern** - iOS-style components and animations
- **Intuitive** - Easy-to-use calendar and forms
- **Responsive** - Works on different screen sizes

### Color Scheme
- **Primary Blue** (#007AFF) - Main actions and highlights
- **Success Green** (#34C759) - Game events
- **Warning Orange** (#FF9500) - Moderate intensity
- **Error Red** (#FF3B30) - High intensity
- **Neutral Grays** - Backgrounds and secondary text

## 🔮 Future Enhancements

### Phase 2 Features
- **Date/Time Pickers** - Better date and time selection
- **Recurring Events** - Weekly/monthly repeating events
- **Notifications** - Pre and post-event reminders
- **Google Calendar Sync** - Import/export calendar data

### Phase 3 Features
- **Team Scheduling** - Coach input and team coordination
- **Advanced Analytics** - Performance correlation with nutrition
- **Wearable Integration** - Passive intensity detection

## 🧪 Testing

### Current Mock Data
The system currently uses mock data for testing:
- Basketball Practice (Dec 9, 5:00 PM)
- Game vs Riverside (Dec 11, 4:00 PM)
- Morning Conditioning (Dec 10, 6:00 AM)

### To Test Real Data
1. Comment out the mock data in `ScheduleScreen.js`
2. Uncomment the `fetchEvents()` call
3. Add real events through the UI
4. Test event logging functionality

## 📱 Navigation

The Schedule screen is accessible via:
- Bottom tab navigation (new "Schedule" tab)
- Direct navigation from other screens (future)

## 🔒 Security

- All database operations use RLS policies
- Users can only access their own events and logs
- Proper authentication checks on all operations

## 🐛 Known Issues

1. **Date/Time Input** - Currently requires ISO format (will be improved with date pickers)
2. **Mock Data** - Using hardcoded mock data instead of real database queries
3. **Recurring Events** - Not yet implemented (UI ready, logic pending)

## 📞 Support

For questions or issues with the schedule system:
1. Check the console for error messages
2. Verify database tables are created correctly
3. Ensure RLS policies are in place
4. Test with mock data first

---

**The Schedule System is ready for testing and further development!** 🎉 