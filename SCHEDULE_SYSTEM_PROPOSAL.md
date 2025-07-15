# 🗓️ Proposal: Schedule-Driven Meal Planning & Recovery System for NutrientSync

## 📌 Executive Summary

**Objective**: Integrate a comprehensive scheduling system into NutrientSync that transforms it from a passive nutrition tracker into an **active athletic performance companion**. This system will automatically link practice/game schedules with meal recommendations and recovery protocols, providing student-athletes with contextually relevant nutrition guidance.

**Business Impact**: 
- Increase user engagement through proactive, schedule-based interactions
- Differentiate from generic nutrition apps by addressing athletic-specific needs
- Improve user retention through personalized, timely recommendations
- Position NutrientSync as the go-to nutrition app for student-athletes

---

## 🧠 Feature Overview

| Component                      | Description                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| **Schedule Dashboard**         | Calendar-based view for managing recurring practices and game events                        |
| **Recurring Practice Tracker** | Weekly repeating practices that automatically adjust based on season status                 |
| **One-Time Game Tracker**      | Game events with location, opponent, and importance tracking                                |
| **Practice/Game Prompts**      | Intelligent notifications for post-event intensity, mood, and recovery logging              |
| **Meal Planning Integration**  | AI-powered meal suggestions based on training load and event timing                         |
| **Recovery Intelligence**      | Cumulative training history analysis for personalized recovery recommendations               |

---

## 🧱 Technical Architecture

### Backend Implementation (Supabase)

#### New Database Tables

**1. `schedule_events`**
```sql
CREATE TABLE schedule_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('practice', 'game')),
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence JSONB, -- { frequency: 'weekly', days: ['monday', 'wednesday'] }
  in_season_only BOOLEAN DEFAULT true,
  location TEXT,
  opponent TEXT, -- for games
  importance TEXT CHECK (importance IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own schedule" ON schedule_events
  FOR ALL USING (auth.uid() = user_id);
```

**2. `event_logs`**
```sql
CREATE TABLE event_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES schedule_events(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('practice', 'game')),
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')),
  mood TEXT,
  soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 10),
  injury_notes TEXT,
  completed BOOLEAN DEFAULT true,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own event logs" ON event_logs
  FOR ALL USING (auth.uid() = user_id);
```

#### Database Functions

**Training Load Calculation**
```sql
CREATE OR REPLACE FUNCTION calculate_training_load(user_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'high_intensity_events', COUNT(*) FILTER (WHERE intensity = 'high'),
    'moderate_intensity_events', COUNT(*) FILTER (WHERE intensity = 'moderate'),
    'average_soreness', AVG(soreness_level),
    'last_event_date', MAX(logged_at)
  ) INTO result
  FROM event_logs 
  WHERE user_id = user_uuid 
    AND logged_at >= NOW() - INTERVAL '1 day' * days_back;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Frontend Implementation (React Native/Expo)

#### New Screens

**1. ScheduleScreen.js**
- Calendar view with event management
- Add/edit recurring practices and one-time games
- Season-based filtering
- Integration with existing navigation

**2. EventPromptScreen.js**
- Post-event intensity and mood collection
- Optional injury/soreness tracking
- Direct link to meal planning

**3. ScheduleDashboard.js**
- Weekly/monthly calendar overview
- Quick event status updates
- Integration with daily nutrition goals

#### Key Components

**Calendar Component**
```jsx
// Using react-native-calendars or similar
<Calendar
  markedDates={getMarkedDates()}
  onDayPress={handleDayPress}
  theme={{
    selectedDayBackgroundColor: '#007AFF',
    todayTextColor: '#007AFF',
    arrowColor: '#007AFF',
  }}
/>
```

**Event Form Component**
```jsx
const EventForm = ({ onSubmit, initialData }) => {
  const [eventType, setEventType] = useState('practice');
  const [recurrence, setRecurrence] = useState(null);
  const [inSeasonOnly, setInSeasonOnly] = useState(true);
  
  // Form logic for creating/editing events
};
```

---

## 🔔 Notification System

### Implementation Strategy

**1. Expo Notifications Setup**
```javascript
// In App.js or notification service
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

**2. Notification Scheduling**
```javascript
const scheduleEventReminders = async (event) => {
  // Pre-event reminder (30 minutes before)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Upcoming ${event.type}`,
      body: `Your ${event.type} starts in 30 minutes. Time to fuel up!`,
      data: { eventId: event.id, type: 'pre_event' },
    },
    trigger: {
      date: new Date(event.start_time.getTime() - 30 * 60 * 1000),
    },
  });
  
  // Post-event prompt (15 minutes after)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `How was your ${event.type}?`,
      body: `Log your intensity and get recovery meal suggestions.`,
      data: { eventId: event.id, type: 'post_event' },
    },
    trigger: {
      date: new Date(event.end_time.getTime() + 15 * 60 * 1000),
    },
  });
};
```

---

## 🤖 AI Integration Enhancement

### Enhanced Meal Planning Prompts

**Current Prompt Structure:**
```
"Create a meal plan for a [sport] athlete with [goals]..."
```

**Enhanced Prompt Structure:**
```
"Create a meal plan for a [sport] athlete with [goals]. 
Context: 
- Training load: [high/moderate/low] intensity [X] times this week
- Last event: [X] hours ago, intensity: [high/moderate/low]
- Next event: [X] hours from now, type: [practice/game]
- Current soreness level: [X]/10
- Season status: [in-season/off-season]

Recommend meals that support [recovery/preparation] needs."
```

### Training Load Analysis
```javascript
const getTrainingContext = async (userId) => {
  const { data: trainingLoad } = await supabase
    .rpc('calculate_training_load', { 
      user_uuid: userId, 
      days_back: 7 
    });
  
  const { data: upcomingEvents } = await supabase
    .from('schedule_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3);
  
  return { trainingLoad, upcomingEvents };
};
```

---

## 📊 Success Metrics & KPIs

| Metric Category | Specific Metrics | Target Goals |
|----------------|------------------|--------------|
| **User Engagement** | Schedule completion rate | >70% of active users create schedules |
| **Feature Adoption** | Event logging rate | >60% of scheduled events get logged |
| **Retention Impact** | 7-day retention with schedule feature | 25% improvement over baseline |
| **User Satisfaction** | Feature usefulness rating | >4.2/5 average rating |
| **Nutrition Impact** | Post-event meal logging | 40% increase in recovery meal entries |

---

## 🗓️ Implementation Timeline

| Week | Phase | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| **Week 1** | Database & Backend | • Schema implementation<br>• RLS policies<br>• Database functions | Supabase access |
| **Week 2** | Core UI Components | • Schedule screen<br>• Event forms<br>• Calendar integration | React Native setup |
| **Week 3** | Notification System | • Expo notifications<br>• Event reminders<br>• Post-event prompts | Expo notifications |
| **Week 4** | AI Integration | • Enhanced meal prompts<br>• Training load analysis<br>• Recovery recommendations | OpenAI API |
| **Week 5** | Testing & Polish | • User testing<br>• Bug fixes<br>• Performance optimization | Beta testers |

---

## 💰 Resource Requirements

### Development Resources
- **Time Investment**: 20-25 hours/week for 5 weeks
- **Technical Skills**: React Native, Supabase, Expo Notifications
- **Testing**: 5-10 student-athlete beta testers

### Infrastructure Costs
- **Supabase**: No additional cost (within current limits)
- **OpenAI API**: Minimal increase (~$10-20/month)
- **Expo Notifications**: Free tier sufficient

### Risk Mitigation
- **Technical Risk**: Dependency on Expo Notifications API
- **Mitigation**: Fallback to local notifications and manual prompts
- **User Adoption Risk**: Complex scheduling might overwhelm users
- **Mitigation**: Progressive disclosure and guided onboarding

---

## 🎯 Competitive Advantage

### Differentiation from Generic Nutrition Apps
1. **Athletic Context**: Schedule-driven recommendations vs. generic meal plans
2. **Recovery Focus**: Post-event nutrition guidance vs. only pre-event
3. **Season Awareness**: Automatic adjustments for in-season/off-season
4. **Training Load Integration**: Cumulative analysis vs. single meal focus

### Market Positioning
- **Primary**: Student-athletes (high school and college)
- **Secondary**: Recreational athletes seeking structured nutrition
- **Tertiary**: Coaches and athletic trainers (future team features)

---

## 🚀 Future Roadmap

### Phase 2 (Next Quarter)
- **Team Scheduling**: Coach input and team-wide coordination
- **Calendar Integration**: Google Calendar and iOS Calendar sync
- **Wearable Integration**: Passive intensity detection via Apple Watch/Fitbit

### Phase 3 (6 Months)
- **Advanced Analytics**: Performance correlation with nutrition
- **Social Features**: Team nutrition challenges and leaderboards
- **Coach Dashboard**: Team nutrition insights and recommendations

---

## 📋 Next Steps

1. **Manager Approval**: Present this proposal for review and feedback
2. **Technical Deep Dive**: Detailed technical architecture review
3. **User Research**: Validate assumptions with target user interviews
4. **MVP Definition**: Define minimum viable features for initial release
5. **Development Kickoff**: Begin Week 1 implementation tasks

---

*This proposal represents a significant enhancement to NutrientSync's value proposition, positioning it as the premier nutrition app for student-athletes by addressing their unique scheduling and recovery needs.* 