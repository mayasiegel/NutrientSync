import { supabase } from '../lib/supabase';

export async function updateUserStreak(userId) {
  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Fetch current streak info
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_logged_date')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching streak info:', error);
    return;
  }

  let { current_streak, longest_streak, last_logged_date } = profile || {};
  current_streak = current_streak || 0;
  longest_streak = longest_streak || 0;

  // Calculate streak logic
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (last_logged_date === today) {
    // Already logged today, do nothing
    return;
  } else if (last_logged_date === yesterday) {
    // Continue streak
    current_streak += 1;
  } else {
    // Reset streak
    current_streak = 1;
  }

  if (current_streak > longest_streak) {
    longest_streak = current_streak;
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      current_streak,
      longest_streak,
      last_logged_date: today,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating streak:', updateError);
  }
} 