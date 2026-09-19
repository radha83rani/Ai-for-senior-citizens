export type TextSize = "normal" | "large" | "xlarge";

export type Language =
  | "English"
  | "Hindi"
  | "Hinglish"
  | "Bengali"
  | "Tamil"
  | "Telugu"
  | "Marathi"
  | "Gujarati";

export interface ReminderItem {
  id: string;
  time: string;
  title: string;
  category: "medication" | "appointment" | "bill" | "family";
  description: string;
  taken?: boolean;
  takenAt?: string;
  dosage?: string;
  doctorInstructions?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  status: "available" | "busy" | "offline";
  avatarBg: string;
  avatarEmoji: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface PendingAction {
  id: string;
  type: "APPOINTMENT" | "REMINDER" | "FAMILY_MESSAGE" | "BILL_PAYMENT";
  title: string;
  subtitle: string;
  details: { label: string; value: string }[];
  confirmText: string;
  cancelText: string;
  payload: any;
}

export interface ScamAnalysis {
  verdict: "SCAM" | "SUSPICIOUS" | "SAFE";
  severity: "HIGH" | "MEDIUM" | "LOW";
  headline: string;
  spokenAdvice: string;
  plainSummary: string;
  redFlags: string[];
  actionSteps: string[];
  safeToIgnore: boolean;
}

export interface BillAnalysis {
  title: string;
  provider: string;
  amountToPay: string;
  dueDate: string;
  previousBillAmount?: string;
  difference?: string;
  whyHigher?: string;
  breakdown: { label: string; value: string }[];
  consumerNumber?: string;
  safeToPay: boolean;
  spokenSummary: string;
  nextSteps: string[];
}

export interface NewsArticle {
  id: string;
  category: string;
  headline: string;
  plainExplanation: string;
  whyItMatters: string;
  spokenVersion: string;
  readTime: string;
}
