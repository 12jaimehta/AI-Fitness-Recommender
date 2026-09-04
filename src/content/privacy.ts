import { Shield, Lock, Eye, Database, UserCheck, Cookie } from "lucide-react";

export const privacySections = [
  {
    icon: Shield,
    title: "Information We Collect",
    content: [
      {
        heading: "Personal Information",
        text: "When you create an account, we collect your name, email address, and basic demographic information including age, gender, height, and weight. This information is essential for creating personalized diet and workout plans."
      },
      {
        heading: "Health and Fitness Data",
        text: "We collect information about your dietary preferences, fitness goals, activity levels, allergies, and medical conditions. This data helps our AI generate safe and effective nutrition plans tailored to your needs."
      },
      {
        heading: "Usage Data",
        text: "We automatically collect information about how you use our service, including pages visited, features used, and time spent on our platform. This helps us improve our services and user experience."
      },
      {
        heading: "Device Information",
        text: "We collect information about the device you use to access our service, including IP address, browser type, and operating system. This helps us ensure compatibility and security."
      }
    ]
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    content: [
      {
        heading: "Encryption",
        text: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols. Your personal information is stored encrypted in our secure databases."
      },
      {
        heading: "Access Controls",
        text: "Only authorized personnel have access to your personal information, and only for specific business purposes. We regularly review and update our access controls to ensure maximum security."
      },
      {
        heading: "Regular Security Audits",
        text: "We conduct regular security audits and penetration testing to identify and address potential vulnerabilities. Our security measures are continuously updated to protect against emerging threats."
      },
      {
        heading: "Data Backup",
        text: "Your data is regularly backed up to secure, redundant storage systems to prevent data loss and ensure service continuity."
      }
    ]
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      {
        heading: "Service Provision",
        text: "We use your information to create and deliver personalized diet and workout plans, track your progress, and provide recommendations based on your goals and preferences."
      },
      {
        heading: "Service Improvement",
        text: "We analyze usage patterns and feedback to improve our AI algorithms, user interface, and overall service quality."
      },
      {
        heading: "Communication",
        text: "We use your email address to send important service updates, security alerts, and relevant health information. You can opt out of marketing communications at any time."
      },
      {
        heading: "Research and Development",
        text: "We may use anonymized and aggregated data for research purposes to improve our understanding of nutrition and fitness trends."
      }
    ]
  },
  {
    icon: Database,
    title: "Data Sharing and Third Parties",
    content: [
      {
        heading: "No Selling of Personal Data",
        text: "We never sell your personal information to third parties. Your data is only used to provide and improve our services."
      },
      {
        heading: "Service Providers",
        text: "We work with trusted third-party service providers for hosting, analytics, and customer support. These providers are contractually obligated to protect your data and only use it for specified purposes."
      },
      {
        heading: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or government request. We will notify you of such requests unless legally prohibited."
      },
      {
        heading: "Business Transfers",
        text: "If we sell or transfer our business, your personal information may be transferred to the new owner, who will continue to protect it according to this privacy policy."
      }
    ]
  },
  {
    icon: UserCheck,
    title: "Your Rights and Choices",
    content: [
      {
        heading: "Access and Correction",
        text: "You have the right to access, update, or correct your personal information at any time through your account settings or by contacting our support team."
      },
      {
        heading: "Data Deletion",
        text: "You can request deletion of your personal information. We will delete your data within 30 days, except where we're legally required to retain it."
      },
      {
        heading: "Data Portability",
        text: "You can request a copy of your personal information in a machine-readable format. We provide this free of charge."
      },
      {
        heading: "Marketing Preferences",
        text: "You can opt out of marketing communications at any time by updating your preferences or using the unsubscribe link in our emails."
      }
    ]
  },
  {
    icon: Cookie,
    title: "Cookies and Tracking",
    content: [
      {
        heading: "Essential Cookies",
        text: "We use essential cookies to provide basic functionality and security features of our website. These cookies cannot be disabled."
      },
      {
        heading: "Performance Cookies",
        text: "We use performance cookies to understand how our website is used and to improve user experience. These cookies help us analyze traffic and user behavior."
      },
      {
        heading: "Functional Cookies",
        text: "We use functional cookies to remember your preferences and settings, such as language and theme choices, to provide a personalized experience."
      },
      {
        heading: "Cookie Management",
        text: "You can control and manage cookies through your browser settings. However, disabling certain cookies may affect website functionality."
      }
    ]
  }
];
