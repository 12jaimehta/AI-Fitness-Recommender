import { User, Heart, Target, Clock, TrendingUp, Award, Camera, RefreshCw } from "lucide-react";

export const steps = [
  {
    number: 1,
    title: "Create your account",
    description: "Sign up with Google, or with a real email and password. We send a 6-digit code — temporary inboxes are blocked. Your profile is what every plan is built from.",
    icon: User,
    tips: ["Google is the fastest way in", "Or use a password of at least 8 characters", "Enter the email code, then fill your profile"],
  },
  {
    number: 2,
    title: "Tell us about you",
    description: "Age, weight, height, how you eat, how you train. Three short screens. Be honest; the numbers only work if you are.",
    icon: Heart,
    tips: ["Say your real training level", "List allergies and conditions", "Pick one goal, not three"],
  },
  {
    number: 3,
    title: "Get your plan",
    description: "A diet with calories and protein per meal, and a training week that matches it. Read it once. You don't have to memorise it.",
    icon: Target,
    tips: ["Make the diet first, then the workout", "Regenerate if a meal is wrong for you", "Save it so the coach can use it"],
  },
  {
    number: 4,
    title: "Check in with your coach",
    description: "Each day, tap what actually happened: ate it, ate something else, trained, skipped. The coach does the math and adjusts the next slot.",
    icon: TrendingUp,
    tips: ["Photo or a sentence is enough for a meal", "Answer two or three questions when asked", "Read the weekly review on Sunday"],
  },
];

export const features = [
  {
    icon: Clock,
    title: "Meals with numbers",
    description: "Every meal has calories and protein. No guessing what a portion means.",
  },
  {
    icon: Camera,
    title: "Photo or sentence logging",
    description: "“2 vada pav and a Coke” is a log. So is a photo. The coach asks the rest.",
  },
  {
    icon: RefreshCw,
    title: "Fixes one slot, not the plan",
    description: "Don't like Tuesday lunch? Get three swaps in budget. Everything else stays.",
  },
  {
    icon: Award,
    title: "Honest weekly review",
    description: "Sessions done, meals kept, weight trend, and what changes next week.",
  },
];
