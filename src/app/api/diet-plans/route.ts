import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWrapper } from '@/lib/supabase-server'


export async function POST(request: NextRequest) {
  try {
    const supabase =await createServerClientWrapper()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formData, dietPlan, title, description } = body

    const { data, error } = await supabase
      .from('diet_plans')
      .insert({
        user_id: user.id,
        form_data: formData,
        diet_plan: dietPlan,
        title: title || generatePlanTitle(formData),
        description: description || generatePlanDescription(formData)
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientWrapper()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generatePlanTitle(formData: any): string {
  const goalMap: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    weight_maintenance: 'Maintenance',
    endurance: 'Endurance',
    general_health: 'General Health'
  }
  
  const preferenceMap: Record<string, string> = {
    vegetarian: 'Vegetarian',
    'non-vegetarian': 'Non-Vegetarian',
    eggetarian: 'Eggetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian'
  }

  const goal = goalMap[formData.goal] || 'Custom'
  const preference = preferenceMap[formData.dietaryPreference] || 'Custom'
  
  return `${goal} ${preference} Plan`
}

function generatePlanDescription(formData: any): string {
  const weight = formData.weightUnit === 'kg' 
    ? `${formData.weight} kg` 
    : `${formData.weight} lbs`
  
  const height = formData.heightUnit === 'cm'
    ? `${formData.height} cm`
    : `${formData.feet}'${formData.inches}"`

  return `${weight}, ${height}, ${formData.age} years old - ${formData.dietaryPreference} diet for ${formData.goal.replace('_', ' ')}`
}
