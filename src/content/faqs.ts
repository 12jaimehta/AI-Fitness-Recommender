import { HelpCircle, User, Heart, Activity, CreditCard, Settings } from "lucide-react";

export const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: HelpCircle,
    color: '#282828'
  },
  {
    id: 'account',
    name: 'Account',
    icon: User,
    color: '#282828'
  },
  {
    id: 'diet',
    name: 'Diet Plans',
    icon: Heart,
    color: '#ef4444'
  },
  {
    id: 'workout',
    name: 'Workout Plans',
    icon: Activity,
    color: '#f59e0b'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: CreditCard,
    color: '#ef4444'
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: Settings,
    color: '#282828'
  }
];

export const faqData = {
  general: [
    {
      question: "What is fyteAI?",
      answer: "fyteAI is an AI-powered platform that creates personalized diet and workout plans based on your individual needs, preferences, and goals. Our advanced algorithms analyze your data to generate customized meal plans and exercise routines."
    },
    {
      question: "How does the AI generate my plans?",
      answer: "Our AI uses advanced machine learning algorithms to analyze your personal information, dietary preferences, fitness goals, and health conditions. It then creates customized plans that match your specific requirements while ensuring nutritional balance and effectiveness."
    },
    {
      question: "Is fyteAI suitable for beginners?",
      answer: "Absolutely! fyteAI is designed for users of all fitness levels. Whether you're just starting your health journey or you're an experienced athlete, our platform adapts to your specific needs and provides appropriate recommendations."
    },
    {
      question: "Can I use fyteAI if I have dietary restrictions?",
      answer: "Yes, fyteAI accommodates various dietary preferences including vegetarian, vegan, non-vegetarian, eggetarian, and pescatarian diets. You can also specify allergies and medical conditions, and our AI will create plans that work for you."
    }
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Click Sign Up, then continue with Google or create an account with your email and a password. Once you are in, complete your profile and you can start using the app."
    },
    {
      question: "How do I reset my password?",
      answer: "On the sign-in page, tap Forgot password, enter your email, and we will send a reset link. Open that email, then choose a new password."
    },
    {
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in your account settings. Go to your profile page, click on 'Edit Profile', and enter your new email address. You'll need to verify the new email address."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account from the account settings page. Please note that this action is permanent and will remove all your data, including saved diet plans and progress tracking."
    }
  ],
  diet: [
    {
      question: "How accurate are the calorie calculations?",
      answer: "Our calorie calculations are based on scientifically proven formulas that take into account your age, gender, height, weight, activity level, and goals. While highly accurate, individual metabolism may vary, so results should be used as guidelines."
    },
    {
      question: "Can I customize my meal plans?",
      answer: "Yes! You can regenerate your plan at any time if you're not satisfied with the current one. In the weekly view, you'll also find alternative meal options that you can switch between while maintaining similar nutritional values."
    },
    {
      question: "What if I don't like a recommended meal?",
      answer: "You can either regenerate the entire plan or use the alternative meals provided in the weekly view. Each meal comes with 2-3 alternatives that offer similar nutritional benefits."
    },
    {
      question: "How often should I update my diet plan?",
      answer: "We recommend updating your diet plan every 4-6 weeks or whenever you experience significant changes in your weight, activity level, or goals. This ensures your plan continues to meet your evolving needs."
    }
  ],
  workout: [
    {
      question: "Do I need equipment for the workout plans?",
      answer: "Our workout plans can be customized based on available equipment. Whether you have a full gym, basic home equipment, or no equipment at all, our AI will create appropriate routines for your situation."
    },
    {
      question: "How do I know if I'm doing exercises correctly?",
      answer: "Each exercise in our plans includes detailed instructions, proper form guidelines, and common mistakes to avoid. We recommend starting with lighter weights and focusing on form before increasing intensity."
    },
    {
      question: "Can I modify the workout plans?",
      answer: "Yes, you can regenerate your workout plan at any time. You can also specify your preferred workout frequency, available equipment, and fitness level to get more personalized routines."
    },
    {
      question: "How long until I see results?",
      answer: "Results vary depending on your consistency, starting point, and goals. Most users begin to feel stronger and more energetic within 2-3 weeks, with visible changes typically appearing after 6-8 weeks of consistent effort."
    }
  ],
  billing: [
    {
      question: "What am I paying for?",
      answer: "A 30-day coach pass. We watch the week and change the meal or session that slipped. Your first diet and first workout are free — once each. Logging as planned (ate it / trained / skipped / weight / sleep) stays free. Another plan, swaps, and the weekly review need the pass."
    },
    {
      question: "What payment methods do you accept?",
      answer: "UPI and cards only, through Razorpay. No netbanking, wallets, EMI, PayPal, or Apple/Google in-app purchases."
    },
    {
      question: "Is this a monthly subscription?",
      answer: "Phase 1 is a 30-day pass: one payment, 30 days of coach access. Pay again when it lapses. Autopay (cards, then UPI) comes later. There is no token meter to recharge."
    },
    {
      question: "Do you offer refunds?",
      answer: "First purchase: email us within 7 days for a refund. After that, 30-day passes are not prorated. Contact us from Help if something went wrong with checkout."
    },
    {
      question: "How do I manage membership?",
      answer: "Open Membership from your profile menu or the footer. When the pass is active, that page shows the end date. When it lapses, pay again with UPI or card."
    }
  ],
  technical: [
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption to protect your data. All personal information is stored securely and we never share your data with third parties without your explicit consent."
    },
    {
      question: "What browsers are supported?",
      answer: "fyteAI works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our mobile app is currently in development. In the meantime, our website is fully responsive and works great on mobile devices."
    },
    {
      question: "I'm experiencing technical issues. What should I do?",
      answer: "First, try clearing your browser cache and cookies. If the issue persists, contact our technical support team with details about the problem, including your browser type and any error messages you're seeing."
    }
  ]
};
