import { createClient } from '../supabase-client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  initial_weight: number | null;
  fitness_level: string | null;
  goals: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface WorkoutEntry {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon_name: string;
  achieved_at: string;
}

class DatabaseService {
  private supabase = createClient();

  // User Profile Methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  // Weight Entries Methods
  async getWeightEntries(userId: string, limit = 30): Promise<WeightEntry[]> {
    const { data, error } = await this.supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching weight entries:', error);
      return [];
    }

    return data;
  }

  async addWeightEntry(entry: Omit<WeightEntry, 'id' | 'created_at'>): Promise<WeightEntry | null> {
    const { data, error } = await this.supabase
      .from('weight_entries')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error adding weight entry:', error);
      return null;
    }

    return data;
  }

  // Workout Entries Methods
  async getWorkoutEntries(userId: string, limit = 30): Promise<WorkoutEntry[]> {
    const { data, error } = await this.supabase
      .from('workout_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching workout entries:', error);
      return [];
    }

    return data;
  }

  async addWorkoutEntry(entry: Omit<WorkoutEntry, 'id' | 'created_at'>): Promise<WorkoutEntry | null> {
    const { data, error } = await this.supabase
      .from('workout_entries')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error adding workout entry:', error);
      return null;
    }

    return data;
  }

  // Goals Methods
  async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data;
  }

  async addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    const { data, error } = await this.supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      return null;
    }

    return data;
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const { data, error } = await this.supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    return data;
  }

  // Achievements Methods
  async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data;
  }

  async addAchievement(achievement: Omit<Achievement, 'id'>): Promise<Achievement | null> {
    const { data, error } = await this.supabase
      .from('achievements')
      .insert([achievement])
      .select()
      .single();

    if (error) {
      console.error('Error adding achievement:', error);
      return null;
    }

    return data;
  }

  // Analytics Methods
  async getUserStats(userId: string) {
    // Get weight stats
    const weightEntries = await this.getWeightEntries(userId, 100);
    const latestWeight = weightEntries[0]?.weight || 0;
    const initialWeight = weightEntries[weightEntries.length - 1]?.weight || latestWeight;
    const weightLost = initialWeight - latestWeight;

    // Get workout stats
    const workoutEntries = await this.getWorkoutEntries(userId, 100);
    const totalWorkouts = workoutEntries.length;
    const totalCalories = workoutEntries.reduce((sum, entry) => sum + entry.calories_burned, 0);
    const totalMinutes = workoutEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);

    // Get active days (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentWorkouts = workoutEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const activeDays = new Set(recentWorkouts.map(entry => entry.date)).size;

    return {
      totalWorkouts,
      totalCalories,
      weightLost: parseFloat(weightLost.toFixed(1)),
      activeDays,
      totalMinutes
    };
  }
}

export const databaseService = new DatabaseService();