import { supabase } from './supabase'
import { DietPlanFormData } from './validation'
import { DietPlanData } from './types'

export interface SavedDietPlan {
  id: string
  user_id: string
  form_data: DietPlanFormData
  diet_plan: DietPlanData
  created_at: string
  updated_at: string
  title: string
  description?: string
}

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

// Diet plan operations
export async function saveDietPlan(
  userId: string,
  formData: DietPlanFormData,
  dietPlan: DietPlanData,
  title?: string,
  description?: string
): Promise<SavedDietPlan> {
  const { data, error } = await supabase
    .from('diet_plans')
    .insert({
      user_id: userId,
      form_data: formData,
      diet_plan: dietPlan,
      title: title || generatePlanTitle(formData),
      description: description || generatePlanDescription(formData)
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserDietPlans(userId: string): Promise<SavedDietPlan[]> {
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDietPlan(planId: string, userId: string): Promise<SavedDietPlan | null> {
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Record not found
    throw error
  }
  return data
}

export async function updateDietPlan(
  planId: string,
  userId: string,
  updates: Partial<{
    title: string
    description: string
    form_data: DietPlanFormData
    diet_plan: DietPlanData
  }>
): Promise<SavedDietPlan> {
  const { data, error } = await supabase
    .from('diet_plans')
    .update(updates)
    .eq('id', planId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDietPlan(planId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('diet_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', userId)

  if (error) throw error
}

// User profile operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Record not found
    throw error
  }
  return data
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    first_name: string
    last_name: string
  }>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...updates
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper functions
function generatePlanTitle(formData: DietPlanFormData): string {
  const goalMap = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    weight_maintenance: 'Maintenance',
    endurance: 'Endurance',
    general_health: 'General Health'
  }
  
  const preferenceMap = {
    vegetarian: 'Vegetarian',
    'non-vegetarian': 'Non-Vegetarian',
    eggetarian: 'Eggetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian'
  }

  const goal = goalMap[formData.goal as keyof typeof goalMap]
  const preference = preferenceMap[formData.dietaryPreference as keyof typeof preferenceMap]
  
  return `${goal} ${preference} Plan`
}

function generatePlanDescription(formData: DietPlanFormData): string {
  const weight = formData.weightUnit === 'kg' 
    ? `${formData.weight} kg` 
    : `${formData.weight} lbs`
  
  const height = formData.heightUnit === 'cm'
    ? `${formData.height} cm`
    : `${formData.feet}'${formData.inches}"`

  return `${weight}, ${height}, ${formData.age} years old - ${formData.dietaryPreference} diet for ${formData.goal.replace('_', ' ')}`
}
