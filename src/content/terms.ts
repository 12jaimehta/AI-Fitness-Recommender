import { FileText, Shield, Users, CreditCard, AlertTriangle, CheckCircle, Gavel } from "lucide-react";

export const termsSections = [
  {
    icon: CheckCircle,
    title: "Acceptance of Terms",
    content: [
      {
        heading: "Agreement",
        text: "By accessing and using fyteAI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
      },
      {
        heading: "Modifications",
        text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of any modifications."
      },
      {
        heading: "Age Requirement",
        text: "You must be at least 18 years old to use this service. By using our service, you represent and warrant that you meet this age requirement."
      },
      {
        heading: "Legal Compliance",
        text: "You agree to comply with all applicable laws and regulations in connection with your use of the service. You are responsible for ensuring compliance with local laws."
      }
    ]
  },
  {
    icon: Users,
    title: "User Accounts",
    content: [
      {
        heading: "Account Creation",
        text: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
      },
      {
        heading: "Account Information",
        text: "You agree to provide accurate, current, and complete information during registration. You are responsible for updating your information to keep it accurate and current."
      },
      {
        heading: "Account Termination",
        text: "We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion."
      },
      {
        heading: "Single Account",
        text: "Each user is permitted to maintain one account only. Creating multiple accounts without authorization may result in termination of all associated accounts."
      }
    ]
  },
  {
    icon: FileText,
    title: "Service Terms",
    content: [
      {
        heading: "Service Description",
        text: "fyteAI provides AI-generated personalized diet and workout plans based on user-provided information. Our service is for informational purposes only and should not replace professional medical advice."
      },
      {
        heading: "User Responsibilities",
        text: "You are responsible for providing accurate information about your health, dietary preferences, and fitness goals. The quality of generated plans depends on the accuracy of your input."
      },
      {
        heading: "Service Availability",
        text: "We strive to maintain high service availability but cannot guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service availability."
      },
      {
        heading: "Third-Party Services",
        text: "Our service may integrate with third-party services or APIs. We are not responsible for the availability, accuracy, or security of such third-party services."
      }
    ]
  },
  {
    icon: CreditCard,
    title: "Payment and Subscription",
    content: [
      {
        heading: "Coach pass",
        text: "Paid access is a 30-day coach pass (currently ₹299 unless a different amount is shown at checkout). You pay once for that period. It is not a token wallet and is not billed by AI model usage. First diet, first workout, and logging as planned remain free."
      },
      {
        heading: "Payment",
        text: "Checkout is processed by Razorpay. We accept UPI and cards only. Prices are in Indian rupees. Access starts after Razorpay confirms the payment."
      },
      {
        heading: "Renewal and expiry",
        text: "The pass does not auto-renew in this phase. When the 30 days end, paid coach actions lock until you buy another pass. There is no prorated refund if you stop using the coach mid-period."
      },
      {
        heading: "Refunds",
        text: "First purchase: email us within 7 days and we will refund that payment. Later purchases and remaining days on a pass are not refunded. Price changes apply to the next purchase, not a period already paid."
      }
    ]
  },
  {
    icon: AlertTriangle,
    title: "Prohibited Activities",
    content: [
      {
        heading: "Misuse of Service",
        text: "You may not use our service for illegal activities, harassment, spam, or any purpose that violates applicable laws or regulations."
      },
      {
        heading: "Reverse Engineering",
        text: "You may not attempt to reverse engineer, decompile, or otherwise attempt to discover the source code or underlying algorithms of our service."
      },
      {
        heading: "Sharing Accounts",
        text: "Account sharing is prohibited. Each account is for individual use only. Violation may result in immediate termination."
      },
      {
        heading: "Commercial Use",
        text: "You may not use our service for commercial purposes without explicit written consent. This includes reselling our service or using it to provide services to third parties."
      }
    ]
  },
  {
    icon: Shield,
    title: "Intellectual Property",
    content: [
      {
        heading: "Service Ownership",
        text: "All content, features, and functionality of the fyteAI service are and will remain the exclusive property of fyteAI Inc. and its licensors."
      },
      {
        heading: "User Content",
        text: "You retain ownership of any content you provide to our service. By using our service, you grant us a license to use, modify, and process your content to provide the service."
      },
      {
        heading: "Generated Plans",
        text: "Diet and workout plans generated by our service are provided for your personal use only. You may not redistribute, sell, or commercially exploit these plans without permission."
      },
      {
        heading: "Trademarks",
        text: "All trademarks, service marks, and trade names used on our service are the property of their respective owners."
      }
    ]
  },
  {
    icon: Gavel,
    title: "Limitation of Liability",
    content: [
      {
        heading: "Service Disclaimer",
        text: "Our service is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any diet or workout plans generated."
      },
      {
        heading: "Health Advice",
        text: "fyteAI is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before making health decisions."
      },
      {
        heading: "Limitation of Damages",
        text: "In no event shall fyteAI Inc. be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or other intangible losses."
      },
      {
        heading: "Indemnification",
        text: "You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your violation of these terms or use of the service."
      }
    ]
  }
];
