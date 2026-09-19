import { FamilyMember, NewsArticle, ReminderItem } from "../types";

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: "rem-1",
    time: "9:00 AM",
    title: "Blood Pressure Medicine",
    dosage: "Amlodipine 5mg (1 Tablet)",
    category: "medication",
    description: "Take 1 tablet after breakfast with warm water.",
    taken: true,
    takenAt: "9:08 AM",
    doctorInstructions: "Take one tablet once daily in the morning after food. Do not skip.",
  },
  {
    id: "rem-2",
    time: "1:00 PM",
    title: "Diabetes Medicine",
    dosage: "Metformin 500mg (1 Tablet)",
    category: "medication",
    description: "Take 1 tablet immediately after lunch.",
    taken: false,
    doctorInstructions: "Take with or immediately after the main meal to avoid stomach upset.",
  },
  {
    id: "rem-3",
    time: "4:30 PM",
    title: "Doctor Appointment: Dr. Mehta",
    dosage: "Family Physician Checkup",
    category: "appointment",
    description: "Clinic at Max Healthcare, Sector 14. Keep previous blood test report ready.",
    taken: false,
    doctorInstructions: "Routine monthly blood pressure & blood sugar review.",
  },
  {
    id: "rem-4",
    time: "8:30 PM",
    title: "Calcium & Vitamin D3 Tablet",
    dosage: "Shelcal 500mg (1 Tablet)",
    category: "medication",
    description: "Take 1 tablet after dinner with milk or water.",
    taken: false,
    doctorInstructions: "Take once daily after dinner.",
  },
];

export const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: "fam-1",
    name: "Ananya",
    relationship: "Daughter",
    phone: "+91 98101 23456",
    status: "available",
    avatarBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    avatarEmoji: "👩‍💼",
    lastMessage: "Mom, call me whenever you finish lunch! ❤️",
    lastMessageTime: "11:45 AM",
  },
  {
    id: "fam-2",
    name: "Rohan",
    relationship: "Grandson",
    phone: "+91 98712 34567",
    status: "busy",
    avatarBg: "bg-blue-100 text-blue-800 border-blue-300",
    avatarEmoji: "👦",
    lastMessage: "Call me when you're free Dadi ❤️",
    lastMessageTime: "Yesterday",
  },
  {
    id: "fam-3",
    name: "Dr. Rajiv Mehta",
    relationship: "Family Doctor",
    phone: "+91 98111 88990",
    status: "available",
    avatarBg: "bg-teal-100 text-teal-800 border-teal-300",
    avatarEmoji: "👨‍⚕️",
    lastMessage: "See you today at 4:30 PM for the routine checkup.",
    lastMessageTime: "9:15 AM",
  },
];

export const SAMPLE_SCAMS = [
  {
    id: "scam-1",
    title: "Bank Account Blocked Threat (SMS)",
    source: "SMS from +91 78291 00213",
    text: "URGENT! Dear SBI Customer, your bank account will be blocked today due to pending KYC. Click this link immediately to verify PAN: http://sbi-kyc-verify-portal.xyz",
  },
  {
    id: "scam-2",
    title: "Electricity Cutoff Notice (WhatsApp)",
    source: "WhatsApp from +91 91234 56780",
    text: "Dear Consumer, your DHBVN electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill of ₹1,842. Call electricity officer immediately at 9123456780 or pay on UPI link.",
  },
  {
    id: "scam-3",
    title: "Lottery Prize Award (Fake Notice)",
    source: "Email / Forwarded message",
    text: "CONGRATULATIONS! Your mobile number has won ₹25,00,000 cash in KBC WhatsApp Lucky Draw. Send photo of Aadhaar card and transfer ₹4,500 file charges to release funds.",
  },
];

export const SAMPLE_BILLS = [
  {
    id: "bill-1",
    title: "DHBVN Electricity Bill",
    provider: "Dakshin Haryana Bijli Vitran Nigam",
    amount: "₹1,842",
    dueDate: "25 September 2026",
    previousAmount: "₹1,590",
    difference: "₹252 higher than last month",
    whyHigher: "Your electricity usage was 42 units higher this month because the ceiling fans and air conditioner ran for longer hours during humid weather.",
    consumerNo: "DH-8492041-9",
    billingPeriod: "15 Aug 2026 – 14 Sep 2026",
    units: "340 Units",
    safeToPay: true,
  },
  {
    id: "bill-2",
    title: "Municipal Water Supply",
    provider: "Municipal Corporation Water Board",
    amount: "₹320",
    dueDate: "30 September 2026",
    previousAmount: "₹320",
    difference: "Exact same as usual",
    whyHigher: "Fixed monthly domestic rate for senior concession category.",
    consumerNo: "MCG-W-01928",
    billingPeriod: "Bi-monthly cycle",
    units: "Domestic Flat Rate",
    safeToPay: true,
  },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    category: "Senior Welfare",
    headline: "Senior citizens can now submit Life Certificates from home via smartphone",
    plainExplanation:
      "The government has simplified the annual Jeevan Pramaan life certificate. You no longer need to travel to the bank or stand in line. A simple face photo on the phone app confirms your status to keep your monthly pension flowing.",
    whyItMatters:
      "You do not need to walk to bank branches in harsh weather or ask anyone for rides just for annual paperwork.",
    spokenVersion:
      "Good news: You can now verify your annual pension certificate right from home using your phone camera, without visiting the bank.",
    readTime: "1 min read",
  },
  {
    id: "news-2",
    category: "Health Care",
    headline: "Free eye checkup and cataract screening camp in Sector 14 Community Center",
    plainExplanation:
      "Senior doctors from Civil Hospital are visiting Sector 14 this Saturday from 10:00 AM to 2:00 PM. They provide free eye examinations, prescription reading glasses, and advice for seniors.",
    whyItMatters:
      "A convenient opportunity close to home to get reading glasses tested with no fees or hospital waiting queues.",
    spokenVersion:
      "A free eye checkup camp for seniors is happening this Saturday at the nearby Sector 14 community center from 10 AM to 2 PM.",
    readTime: "1 min read",
  },
  {
    id: "news-3",
    category: "Banking Safety",
    headline: "Banks will never call you asking for OTP or PIN numbers",
    plainExplanation:
      "Reserve Bank of India has issued an advisory reminding everyone that genuine bank officers will never ask for your 4-digit ATM PIN or SMS security OTP over the phone or WhatsApp.",
    whyItMatters:
      "If anyone ever asks you for an OTP, you can confidently hang up without any fear of your account being blocked.",
    spokenVersion:
      "Reminder from the bank: genuine bank staff will never ask you for an OTP or PIN. If anyone calls asking for it, simply hang up.",
    readTime: "1 min read",
  },
];
