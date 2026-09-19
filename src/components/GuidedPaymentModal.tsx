import React, { useState } from "react";
import { CheckCircle2, X, ArrowRight, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import { playChime, speakText, stopSpeaking } from "../utils/speech";

interface GuidedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: {
    provider: string;
    amount: string;
    consumerNo: string;
    dueDate: string;
  };
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
  onPaymentSuccess: () => void;
}

export const GuidedPaymentModal: React.FC<GuidedPaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  highContrast,
  voiceSpeed,
  language,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [consumerInput, setConsumerInput] = useState(bill.consumerNo || "DH-8492041-9");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    playChime("tap");
    if (step === 1) {
      setStep(2);
      speakText("Step 2 of 3: Please check your consumer number. It is already filled for you.", {
        rate: voiceSpeed,
        lang: language,
      });
    } else if (step === 2) {
      setStep(3);
      speakText(`Step 3 of 3: The amount to pay is ${bill.amount}. Would you like to review and confirm payment?`, {
        rate: voiceSpeed,
        lang: language,
      });
    }
  };

  const handleConfirmPay = () => {
    playChime("tap");
    setIsProcessing(true);
    speakText("Processing your payment safely...", { rate: voiceSpeed, lang: language });

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      playChime("success");
      speakText(`Payment of ${bill.amount} to ${bill.provider} successful! A confirmation receipt has been saved.`, {
        rate: voiceSpeed,
        lang: language,
      });
      onPaymentSuccess();
    }, 1500);
  };

  return (
    <div
      id="guided-payment-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 transition-all ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-700 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Help Me Do This • Guided Assistant
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif">
                Pay Electricity Bill
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step indicator */}
        {!isPaid && (
          <div className="flex items-center justify-between gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-3 rounded-full transition-all ${
                  s <= step
                    ? "bg-amber-500"
                    : highContrast
                    ? "bg-stone-800"
                    : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step Content */}
        {isPaid ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h4 className="text-2xl font-bold font-serif text-emerald-800 dark:text-emerald-400">
              Payment Confirmed!
            </h4>
            <p className="text-base text-stone-700 dark:text-stone-200 font-medium">
              {bill.amount} paid successfully to {bill.provider}. Transaction ID:{" "}
              <span className="font-mono font-bold">DHBVN-9481203</span>.
            </p>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Step 1 of 3
                </span>
                <h4 className="text-xl font-bold font-serif">
                  Your electricity provider
                </h4>
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <p className="text-lg font-bold">{bill.provider}</p>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Official State Electricity Board
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Step 2 of 3
                </span>
                <h4 className="text-xl font-bold font-serif">
                  Enter or verify Consumer Number:
                </h4>
                <input
                  type="text"
                  value={consumerInput}
                  onChange={(e) => setConsumerInput(e.target.value)}
                  className="w-full p-4 rounded-2xl border text-xl font-mono font-bold tracking-wider text-center bg-stone-50 dark:bg-stone-800 border-amber-300 dark:border-stone-600 focus:outline-none"
                />
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 text-center">
                  This matches the number on your electricity meter and last bill.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 font-bold text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-2 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base flex items-center justify-center gap-2"
                  >
                    <span>Confirm Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Step 3 of 3 • Review & Pay
                </span>
                <h4 className="text-xl font-bold font-serif">
                  Review Payment Details
                </h4>

                <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-700 dark:text-stone-300">
                    <span>Payable to:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {bill.provider}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-700 dark:text-stone-300">
                    <span>Consumer No:</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {consumerInput}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-700 dark:text-stone-300">
                    <span>Due Date:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {bill.dueDate}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 dark:border-stone-700 flex justify-between items-center">
                    <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Amount:
                    </span>
                    <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                      {bill.amount}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-2xl border border-stone-300 dark:border-stone-700 font-bold text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPay}
                    disabled={isProcessing}
                    className="flex-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {isProcessing ? "Processing..." : `Pay ${bill.amount} Safely`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
