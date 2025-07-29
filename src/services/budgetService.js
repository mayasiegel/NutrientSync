import { supabase } from '../lib/supabase';

class BudgetService {
  // Get current month's budget for a user
  async getCurrentMonthBudget(userId) {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('budget_month', monthStart.toISOString().split('T')[0])
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching budget:', error);
      return null;
    }
    
    return data;
  }

  // Set or update monthly budget
  async setMonthlyBudget(userId, monthlyBudget) {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('user_budgets')
      .upsert({
        user_id: userId,
        monthly_budget: parseFloat(monthlyBudget),
        budget_month: monthStart.toISOString().split('T')[0],
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
    
    return data;
  }

  // Get monthly spending data
  async getMonthlySpending(userId, monthDate = new Date()) {
    const { data, error } = await supabase
      .rpc('get_monthly_spending', {
        user_uuid: userId,
        month_date: monthDate.toISOString().split('T')[0]
      });

    if (error) {
      console.error('Error fetching spending:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  }

  // Add a transaction
  async addTransaction(userId, amount, foodName, category = 'grocery') {
    // Get current budget
    const budget = await this.getCurrentMonthBudget(userId);
    if (!budget) {
      throw new Error('No budget set for current month');
    }

    const { data, error } = await supabase
      .from('budget_transactions')
      .insert({
        user_id: userId,
        budget_id: budget.id,
        amount: parseFloat(amount),
        food_name: foodName,
        category: category,
        transaction_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    
    return data;
  }

  // Get food cost from database
  async getFoodCost(foodName) {
    const { data, error } = await supabase
      .from('food_costs')
      .select('*')
      .ilike('food_name', `%${foodName.toLowerCase()}%`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching food cost:', error);
      return null;
    }
    
    return data;
  }

  // Estimate cost for a food item
  async estimateFoodCost(foodName) {
    const foodCost = await this.getFoodCost(foodName);
    if (foodCost) {
      return foodCost.average_cost;
    }
    
    // Fallback to default costs based on category
    const foodNameLower = foodName.toLowerCase();
    
    if (foodNameLower.includes('milk') || foodNameLower.includes('dairy')) return 4.50;
    if (foodNameLower.includes('chicken') || foodNameLower.includes('meat')) return 8.00;
    if (foodNameLower.includes('apple') || foodNameLower.includes('fruit')) return 0.75;
    if (foodNameLower.includes('lettuce') || foodNameLower.includes('vegetable')) return 2.00;
    if (foodNameLower.includes('rice') || foodNameLower.includes('grain')) return 2.00;
    
    return 3.00; // Default fallback
  }

  // Check if budget alert should be triggered
  async checkBudgetAlerts(userId) {
    const spending = await this.getMonthlySpending(userId);
    if (!spending) return null;

    const budget = await this.getCurrentMonthBudget(userId);
    if (!budget) return null;

    const percentageUsed = spending.percentage_used;
    
    // Check if we should create an alert (80% threshold)
    if (percentageUsed >= 80 && percentageUsed < 100) {
      // Check if alert already exists
      const { data: existingAlert } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('budget_id', budget.id)
        .eq('alert_type', 'threshold')
        .eq('threshold_percentage', 80)
        .eq('is_read', false)
        .single();

      if (!existingAlert) {
        // Create new alert
        const { data: alert } = await supabase
          .from('budget_alerts')
          .insert({
            user_id: userId,
            budget_id: budget.id,
            alert_type: 'threshold',
            threshold_percentage: 80,
            message: `You've used ${percentageUsed.toFixed(1)}% of your monthly budget. Consider reducing spending to stay on track.`,
          })
          .select()
          .single();

        return alert;
      }
    }

    return null;
  }

  // Get unread budget alerts
  async getUnreadAlerts(userId) {
    const { data, error } = await supabase
      .from('budget_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
    
    return data || [];
  }

  // Mark alert as read
  async markAlertAsRead(alertId) {
    const { error } = await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  // Get budget summary for display
  async getBudgetSummary(userId) {
    const budget = await this.getCurrentMonthBudget(userId);
    const spending = await this.getMonthlySpending(userId);
    
    if (!budget) {
      return {
        hasBudget: false,
        budget: null,
        spending: null,
        status: 'no_budget'
      };
    }

    if (!spending) {
      return {
        hasBudget: true,
        budget: budget,
        spending: { total_spent: 0, budget_remaining: budget.monthly_budget, percentage_used: 0 },
        status: 'no_spending'
      };
    }

    let status = 'on_track';
    if (spending.percentage_used >= 100) status = 'over_budget';
    else if (spending.percentage_used >= 80) status = 'warning';

    return {
      hasBudget: true,
      budget: budget,
      spending: spending,
      status: status
    };
  }

  // Add mock transactions for testing (remove in production)
  async addMockTransactions(userId) {
    const mockTransactions = [
      { amount: 45.00, foodName: 'Grocery Shopping', category: 'grocery' },
      { amount: 12.50, foodName: 'Protein Powder', category: 'supplement' },
      { amount: 28.00, foodName: 'Chicken & Vegetables', category: 'grocery' },
      { amount: 15.00, foodName: 'Lunch Out', category: 'dining' },
      { amount: 32.00, foodName: 'Fruits & Dairy', category: 'grocery' },
    ];

    const results = [];
    for (const transaction of mockTransactions) {
      try {
        const result = await this.addTransaction(userId, transaction.amount, transaction.foodName, transaction.category);
        results.push(result);
      } catch (error) {
        console.error('Error adding mock transaction:', error);
      }
    }
    
    return results;
  }
}

export default new BudgetService(); 