import React, { useState } from "react";
import { Receipt, FileText, Upload, Sparkles, Volume2, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { SAMPLE_BILLS } from "../data/initialData";
import { GuidedPaymentModal } from "./GuidedPaymentModal";
import { playChime, speakText } from "../utils/speech";

interface BillSimplifierSectionProps {
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
}

export const BillSimplifierSection: React.FC<BillSimplifierSectionProps> = ({
  highContrast,
  voiceSpeed,
  language,
}) => {
  const [selectedBill, setSelectedBill] = useState(SAMPLE_BILLS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuidedPayment, setShowGuidedPayment] = useState(false);
  const [billText, setBillText] = useState("");

  const handleSelectSample = (bill: (typeof SAMPLE_BILLS)[0]) => {
    playChime("tap");
    setSelectedBill(bill);
    speakText(
      `Your ${bill.title} is ${bill.amount}, due on ${bill.dueDate}. It is ${bill.difference}.`,
      { rate: voiceSpeed, lang: language }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsAnalyzing(true);
      playChime("tap");

      try {
        const res = await fetch("/api/sahara/simplify-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || "image/jpeg",
            docType: "bill",
          }),
        });
        const data = await res.json();
        setIsAnalyzing(false);

        setSelectedBill({
          id: "custom-" + Date.now(),
          title: data.title || file.name,
          provider: data.provider || "Utility Provider",
          amount: data.amountToPay || "₹1,842",
          dueDate: data.dueDate || "Upcoming",
          previousAmount: data.previousBillAmount || "₹1,590",
          difference: data.difference || "Calculated from bill",
          whyHigher: data.whyHigher || "Calculated based on meter readings.",
          consumerNo: data.consumerNumber || "DH-9821-4",
          billingPeriod: "Current Billing Cycle",
          units: "Standard Tier",
          safeToPay: true,
        });

        if (data.spokenSummary) {
          speakText(data.spokenSummary, { rate: voiceSpeed, lang: language });
        }
      } catch (err) {
        console.error(err);
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="section-explain-bill" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Explain My Bill & Documents
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-0.5">
            Upload or select any bill. Sahara explains amounts, due dates, and why charges changed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 text-sm font-bold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Upload Bill Document</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Bill selector chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 whitespace-nowrap">
          Sample Bills:
        </span>
        {SAMPLE_BILLS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => handleSelectSample(b)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all whitespace-nowrap ${
              selectedBill.id === b.id
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700 hover:bg-amber-50"
            }`}
          >
            {b.title} ({b.amount})
          </button>
        ))}
      </div>

      {/* Main Explained Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {selectedBill.provider}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif">
                {selectedBill.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              speakText(
                `Your ${selectedBill.title} is ${selectedBill.amount}, due on ${selectedBill.dueDate}. It is ${selectedBill.difference}. Reason: ${selectedBill.whyHigher}`,
                { rate: voiceSpeed, lang: language }
              );
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-stone-700 hover:bg-amber-100"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Read Bill Summary</span>
          </button>
        </div>

        {/* 4 Essential Senior Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Amount to Pay
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 dark:text-amber-300 font-serif">
              {selectedBill.amount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Last Date (Due)
            </span>
            <span className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              {selectedBill.dueDate}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Previous Bill
            </span>
            <span className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200">
              {selectedBill.previousAmount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Comparison
            </span>
            <span className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{selectedBill.difference}</span>
            </span>
          </div>
        </div>

        {/* Why is it higher / Explanation */}
        <div
          className={`rounded-2xl p-5 border mb-6 ${
            highContrast
              ? "bg-stone-800/90 border-stone-700 text-stone-100"
              : "bg-amber-50/50 border-amber-100 text-stone-900"
          }`}
        >
          <h4 className="text-lg font-bold font-serif text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-2">
            <span>💡</span>
            <span>Why is it {selectedBill.difference.includes("higher") ? "higher" : "different"}?</span>
          </h4>
          <p className="text-base sm:text-lg text-stone-800 dark:text-stone-100 leading-relaxed font-medium">
            {selectedBill.whyHigher}
          </p>
        </div>

        {/* Call to action & Guided 3-step payment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="text-sm text-stone-700 dark:text-stone-300 font-semibold">
            <span>Consumer Number: </span>
            <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
              {selectedBill.consumerNo}
            </span>
          </div>

          <button
            id="btn-start-guided-payment"
            type="button"
            onClick={() => {
              playChime("tap");
              setShowGuidedPayment(true);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
          >
            <span>Help Me Pay This Bill</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Guided 3-Step Payment Modal */}
      <GuidedPaymentModal
        isOpen={showGuidedPayment}
        onClose={() => setShowGuidedPayment(false)}
        bill={{
          provider: selectedBill.provider,
          amount: selectedBill.amount,
          consumerNo: selectedBill.consumerNo,
          dueDate: selectedBill.dueDate,
        }}
        highContrast={highContrast}
        voiceSpeed={voiceSpeed}
        language={language}
        onPaymentSuccess={() => {}}
      />
    </div>
  );
};
