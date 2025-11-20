import { DietPlanFormData, WorkoutPlanFormData } from './validation'
import { DietPlanData } from './types'
import { WorkoutPlanData } from './ai-service'

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

export interface SavedWorkoutPlan {
  id: string
  user_id: string
  form_data: WorkoutPlanFormData
  workout_plan: WorkoutPlanData
  created_at: string
  updated_at: string
  title: string
  description?: string
}

// Diet plan operations using API routes
export async function saveDietPlan(
  userId: string,
  formData: DietPlanFormData,
  dietPlan: DietPlanData,
  title?: string,
  description?: string
): Promise<SavedDietPlan> {
  const response = await fetch('/api/diet-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      formData,
      dietPlan,
      title,
      description
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save diet plan')
  }

  const result = await response.json()
  return result.data
}

export async function getUserDietPlans(userId: string): Promise<SavedDietPlan[]> {
  const response = await fetch(`/api/diet-plans?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get diet plans')
  }

  const result = await response.json()
  return result.data
}

export async function deleteDietPlan(userId: string, planId: string): Promise<void> {
  const response = await fetch(`/api/diet-plans/${planId}?userId=${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete diet plan')
  }
}

// Workout plan operations using API routes
export async function saveWorkoutPlan(
  userId: string,
  formData: WorkoutPlanFormData,
  workoutPlan: WorkoutPlanData,
  title?: string,
  description?: string
): Promise<SavedWorkoutPlan> {
  const response = await fetch('/api/workout-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      formData,
      workoutPlan,
      title,
      description
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save workout plan')
  }

  const result = await response.json()
  return result.data
}

export async function getUserWorkoutPlans(userId: string): Promise<SavedWorkoutPlan[]> {
  const response = await fetch(`/api/workout-plans?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get workout plans')
  }

  const result = await response.json()
  return result.data
}

export async function deleteWorkoutPlan(userId: string, planId: string): Promise<void> {
  const response = await fetch(`/api/workout-plans/${planId}?userId=${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete workout plan')
  }
}
