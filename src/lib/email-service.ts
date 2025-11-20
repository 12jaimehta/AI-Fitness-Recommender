interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendDietPlanEmail(email: string, dietPlan: any, userData: any) {
  const emailContent = generateEmailContent(dietPlan, userData);
  
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `Your Personalized Diet Plan - ${new Date().toLocaleDateString()}`,
        html: emailContent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

function generateEmailContent(dietPlan: any, userData: any) {
  const currentDate = new Date().toLocaleDateString();
  
  let emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Personalized Diet Plan</title>
      <style>
        body {
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .header {
          background: linear-gradient(135deg, #162a41 0%, #2c3e50 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .section {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .section h2 {
          color: #162a41;
          margin-top: 0;
          font-size: 22px;
          font-weight: 600;
          border-bottom: 2px solid #162a41;
          padding-bottom: 10px;
        }
        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .nutrition-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #162a41;
        }
        .nutrition-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .nutrition-item .value {
          font-size: 20px;
          font-weight: 700;
          color: #162a41;
          margin-top: 5px;
        }
        .meal-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          border-left: 4px solid #162a41;
        }
        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .meal-title {
          font-size: 18px;
          font-weight: 600;
          color: #162a41;
          margin: 0;
        }
        .meal-calories {
          background: #162a41;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .meal-details {
          margin-bottom: 10px;
        }
        .meal-name {
          font-weight: 500;
          margin-bottom: 8px;
        }
        .ingredient-breakdown {
          background: white;
          padding: 15px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.5;
        }
        .macros {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          font-size: 14px;
        }
        .macro {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .macro-label {
          font-weight: 600;
        }
        .tips {
          background: #e8f4fd;
          border-left: 4px solid #2196f3;
        }
        .tips ul {
          margin: 0;
          padding-left: 20px;
        }
        .tips li {
          margin-bottom: 8px;
        }
        .day-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .day-tab {
          background: #162a41;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🥗 Your Personalized Diet Plan</h1>
        <p>Generated on ${currentDate} for ${userData.dietaryPreference} diet</p>
        <p>Goal: ${userData.goal} | Activity Level: ${userData.activityLevel}</p>
      </div>

      <div class="section">
        <h2>📊 Nutrition Targets</h2>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <div class="label">Daily Calories</div>
            <div class="value">${dietPlan.calorieTarget}</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Protein</div>
            <div class="value">${dietPlan.proteinTarget}g</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Carbs</div>
            <div class="value">${dietPlan.carbTarget}g</div>
          </div>
          <div class="nutrition-item">
            <div class="label">Fat</div>
            <div class="value">${dietPlan.fatTarget}g</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🍽️ Daily Meal Plan</h2>
        ${generateMealsHTML(dietPlan.meals, 'Daily')}
      </div>

      ${dietPlan.weeklyPlan ? `
        <div class="section">
          <h2>📅 Weekly Meal Plan</h2>
          ${Object.entries(dietPlan.weeklyPlan).map(([day, meals]: [string, any]) => `
            <div class="day-selector">
              <div class="day-tab">${day.charAt(0).toUpperCase() + day.slice(1)}</div>
            </div>
            ${generateMealsHTML(meals, day)}
          `).join('')}
        </div>
      ` : ''}

      <div class="section tips">
        <h2>💡 Nutrition Tips</h2>
        <ul>
          ${dietPlan.nutritionTips?.map((tip: string) => `<li>${tip}</li>`).join('') || '<li>Follow your meal plan consistently for best results</li>'}
        </ul>
      </div>

      <div class="footer">
        <p>This diet plan was generated specifically for you based on your personal goals and preferences.</p>
        <p>Consult with a healthcare professional before making significant changes to your diet.</p>
        <p>Generated by Diet Plan App on ${currentDate}</p>
      </div>
    </body>
    </html>
  `;

  return emailHTML;
}

function generateMealsHTML(meals: any, sectionName: string) {
  if (!meals) return '<p>No meals available for this section.</p>';
  
  return Object.entries(meals).map(([mealType, mealData]: [string, any]) => `
    <div class="meal-card">
      <div class="meal-header">
        <h3 class="meal-title">${mealType.charAt(0).toUpperCase() + mealType.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
        <div class="meal-calories">${mealData.calories} cal</div>
      </div>
      <div class="meal-details">
        <div class="meal-name">${mealData.name}</div>
        ${mealData.ingredientBreakdown ? `
          <div class="ingredient-breakdown">
            <strong>Ingredients:</strong><br>
            ${mealData.ingredientBreakdown.replace(/\n/g, '<br>')}
          </div>
        ` : ''}
        <div class="macros">
          <div class="macro">
            <span class="macro-label">Protein:</span>
            <span>${mealData.protein}g</span>
          </div>
          <div class="macro">
            <span class="macro-label">Carbs:</span>
            <span>${mealData.carbs}g</span>
          </div>
          <div class="macro">
            <span class="macro-label">Fat:</span>
            <span>${mealData.fat}g</span>
          </div>
        </div>
        ${mealData.alternatives ? `
          <div style="margin-top: 15px;">
            <strong>Alternatives:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${mealData.alternatives.map((alt: any) => `
                <li>${alt.name} (${alt.calories} cal) - ${alt.description}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}
