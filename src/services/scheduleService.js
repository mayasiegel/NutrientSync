import { supabase } from '../lib/supabase';

export const scheduleService = {
  // Format date for display
  formatDate: (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  },

  // Format time for display
  formatTime: (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  // Create ISO string for database
  createISOString: (date, time) => {
    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return newDate.toISOString();
  },

  // Get events for a specific date
  getEventsForDate: async (userId, date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events for date:', error);
      throw error;
    }
  },

  // Get all events for a user
  getAllEvents: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .insert([eventData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update an event
  updateEvent: async (eventId, updates) => {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .update(updates)
        .eq('id', eventId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Log an event (create event_log entry)
  logEvent: async (logData) => {
    try {
      const { data, error } = await supabase
        .from('event_logs')
        .insert([logData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  },

  // Get event logs for a user
  getEventLogs: async (userId, daysBack = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('event_logs')
        .select(`
          *,
          schedule_events (
            title,
            type,
            location
          )
        `)
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event logs:', error);
      throw error;
    }
  },

  // Calculate training load for a user
  calculateTrainingLoad: async (userId, daysBack = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('event_logs')
        .select('intensity, soreness_level')
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString());

      if (error) throw error;

      const logs = data || [];
      const highIntensity = logs.filter(log => log.intensity === 'high').length;
      const moderateIntensity = logs.filter(log => log.intensity === 'moderate').length;
      const averageSoreness = logs.length > 0 
        ? logs.reduce((sum, log) => sum + (log.soreness_level || 0), 0) / logs.length 
        : 0;

      return {
        totalEvents: logs.length,
        highIntensityEvents: highIntensity,
        moderateIntensityEvents: moderateIntensity,
        averageSoreness: Math.round(averageSoreness * 10) / 10,
        trainingLoad: highIntensity * 3 + moderateIntensity * 2 + logs.length,
      };
    } catch (error) {
      console.error('Error calculating training load:', error);
      throw error;
    }
  },

  // Mock data for testing
  getMockEvents: () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Generate recurring events for the current month
    const events = [];
    
    // Helper function to generate UUID-like strings for mock data
    const generateMockUUID = (prefix, week, day) => {
      return `${prefix}-${week}-${day}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };
    
    // Basketball Practice - Monday, Wednesday, Friday 5:00-7:00 PM
    const basketballDays = ['monday', 'wednesday', 'friday'];
    basketballDays.forEach((day, index) => {
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
      const firstDay = new Date(currentYear, currentMonth, 1);
      const firstDayOfWeek = firstDay.getDay();
      const firstOccurrence = 1 + (dayIndex - firstDayOfWeek + 7) % 7;
      
      for (let week = 0; week < 5; week++) {
        const eventDate = new Date(currentYear, currentMonth, firstOccurrence + week * 7);
        if (eventDate.getMonth() === currentMonth) {
          events.push({
            id: generateMockUUID('basketball', week, day),
            type: 'practice',
            title: 'Basketball Practice',
            start_time: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 17, 0, 0).toISOString(),
            end_time: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 19, 0, 0).toISOString(),
            location: 'High School Gym',
            recurrence: { frequency: 'weekly', days: basketballDays },
            isRecurring: true,
          });
        }
      }
    });
    
    // Morning Conditioning - Tuesday, Thursday 6:00-7:00 AM
    const conditioningDays = ['tuesday', 'thursday'];
    conditioningDays.forEach((day, index) => {
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
      const firstDay = new Date(currentYear, currentMonth, 1);
      const firstDayOfWeek = firstDay.getDay();
      const firstOccurrence = 1 + (dayIndex - firstDayOfWeek + 7) % 7;
      
      for (let week = 0; week < 5; week++) {
        const eventDate = new Date(currentYear, currentMonth, firstOccurrence + week * 7);
        if (eventDate.getMonth() === currentMonth) {
          events.push({
            id: generateMockUUID('conditioning', week, day),
            type: 'practice',
            title: 'Morning Conditioning',
            start_time: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 6, 0, 0).toISOString(),
            end_time: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 7, 0, 0).toISOString(),
            location: 'School Track',
            recurrence: { frequency: 'weekly', days: conditioningDays },
            isRecurring: true,
          });
        }
      }
    });
    
    // Add some one-time games
    const gameDates = [5, 12, 19, 26]; // Saturdays
    gameDates.forEach((date, index) => {
      const gameDate = new Date(currentYear, currentMonth, date);
      if (gameDate.getMonth() === currentMonth) {
        events.push({
          id: generateMockUUID('game', index, 'saturday'),
          type: 'game',
          title: `Game vs Team ${index + 1}`,
          start_time: new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate(), 16, 0, 0).toISOString(),
          end_time: new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate(), 18, 0, 0).toISOString(),
          location: 'Home Court',
          opponent: `Team ${index + 1}`,
          isRecurring: false,
        });
      }
    });
    
    return events;
  },
};

export default scheduleService; 