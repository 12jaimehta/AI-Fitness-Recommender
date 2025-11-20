export function generateAIInsights(userProfile: any, nutrition: any, workouts: any[]) {
  const insights = [];

  // 1. Macro Analysis
  if (nutrition) {
    const proteinGoal = 150; // Example: Replace with userProfile.goals.protein if available
    if (nutrition.protein < proteinGoal * 0.8) {
      insights.push({
        title: "Protein Deficit Detected",
        message: `You've only hit ${nutrition.protein}g of protein today. Try adding a protein shake to reach your goal of ${proteinGoal}g for optimal muscle recovery.`,
        type: "warning"
      });
    } else {
       insights.push({
        title: "Macro Master",
        message: "Your protein intake is perfect today! This will significantly aid your recovery.",
        type: "success"
      });
    }
  }

  // 2. Workout Consistency
  const lastWorkout = workouts[0];
  if (lastWorkout) {
    const daysSince = Math.floor((new Date().getTime() - new Date(lastWorkout.date).getTime()) / (1000 * 3600 * 24));
    if (daysSince > 3) {
      insights.push({
        title: "Momentum Risk",
        message: `It's been ${daysSince} days since your last workout. A light 15-minute session today can help you get back on track.`,
        type: "warning"
      });
    }
  }

  // Default Insight
  if (insights.length === 0) {
    insights.push({
      title: "Ready to Go",
      message: "Your stats are looking stable. Log today's meals to get personalized advice.",
      type: "info"
    });
  }

  return insights;
}