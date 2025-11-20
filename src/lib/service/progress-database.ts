import { createClient } from "../supabase-client";


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

export interface DailyNutrition {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

class DatabaseService {
  private supabase = createClient();

  async getUserProfile(userId: string) {
    const { data } = await this.supabase.from('user_profiles').select('*').eq('id', userId).single();
    return data;
  }

  async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>) {
    const { data } = await this.supabase.from('user_profiles').insert([profile]).select().single();
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data } = await this.supabase.from('user_profiles').update(updates).eq('id', userId).select().single();
    return data;
  }

  async getWeightEntries(userId: string, limit = 30) {
    const { data } = await this.supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    return data || [];
  }

  async addWeightEntry(entry: Omit<WeightEntry, 'id' | 'created_at'>) {
    const { data } = await this.supabase.from('weight_entries').insert([entry]).select().single();
    return data;
  }

  async getWorkoutEntries(userId: string, limit = 30) {
    const { data } = await this.supabase
      .from('workout_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    return data || [];
  }

  async addWorkoutEntry(entry: Omit<WorkoutEntry, 'id' | 'created_at'>) {
    const { data } = await this.supabase.from('workout_entries').insert([entry]).select().single();
    return data;
  }

  async getGoals(userId: string) {
    const { data } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    const { data } = await this.supabase.from('goals').insert([goal]).select().single();
    return data;
  }

  async updateGoal(goalId: string, updates: Partial<Goal>) {
    const { data } = await this.supabase.from('goals').update(updates).eq('id', goalId).select().single();
    return data;
  }

  async getAchievements(userId: string) {
    const { data } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });
    return data || [];
  }

  async addAchievement(achievement: Omit<Achievement, 'id'>) {
    const { data } = await this.supabase.from('achievements').insert([achievement]).select().single();
    return data;
  }

  async getDailyNutrition(userId: string, date: string) {
    const { data } = await this.supabase
      .from('daily_nutrition')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    return data;
  }

  async updateDailyNutrition(userId: string, macros: Partial<DailyNutrition>) {
    const date = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase
      .from('daily_nutrition')
      .upsert({ user_id: userId, date, ...macros })
      .select()
      .single();
    return data;
  }

  async getProgressPhotos(userId: string) {
    const { data } = await this.supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return data || [];
  }

  async uploadProgressPhoto(userId: string, file: File) {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

    await this.supabase.storage.from('progress-photos').upload(fileName, file);

    const { data: urlData } = this.supabase.storage.from('progress-photos').getPublicUrl(fileName);

    const { data } = await this.supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        photo_url: urlData.publicUrl,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    return data;
  }

  async getUserStats(userId: string) {
    const weightEntries = await this.getWeightEntries(userId, 100);
    const latestWeight = weightEntries[0]?.weight || 0;
    const initialWeight = weightEntries.at(-1)?.weight || latestWeight;
    const weightLost = initialWeight - latestWeight;

    const workouts = await this.getWorkoutEntries(userId, 100);
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((s, x) => s + x.calories_burned, 0);
    const totalMinutes = workouts.reduce((s, x) => s + x.duration_minutes, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeDays = new Set(
      workouts.filter(w => new Date(w.date) >= thirtyDaysAgo).map(w => w.date)
    ).size;

    return {
      totalWorkouts,
      totalCalories,
      totalMinutes,
      weightLost: parseFloat(weightLost.toFixed(1)),
      activeDays,
    };
  }
}

export const databaseService = new DatabaseService();
