import React, { useState } from "react";
import { Newspaper, Volume2, Sparkles, HelpCircle, Check, BookOpen } from "lucide-react";
import { INITIAL_NEWS } from "../data/initialData";
import { NewsArticle } from "../types";
import { playChime, speakText } from "../utils/speech";

interface NewsSectionProps {
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  highContrast,
  voiceSpeed,
  language,
}) => {
  const [newsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [activeExplainId, setActiveExplainId] = useState<string | null>(null);
  const [activeWhyId, setActiveWhyId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [customExplanation, setCustomExplanation] = useState<any | null>(null);
  const [isExplainingCustom, setIsExplainingCustom] = useState(false);

  const handleExplainSimply = (item: NewsArticle) => {
    playChime("tap");
    setActiveExplainId(activeExplainId === item.id ? null : item.id);
    speakText(item.plainExplanation, { rate: voiceSpeed, lang: language });
  };

  const handleWhyImportant = (item: NewsArticle) => {
    playChime("tap");
    setActiveWhyId(activeWhyId === item.id ? null : item.id);
    speakText(item.whyItMatters, { rate: voiceSpeed, lang: language });
  };

  const handleCustomExplain = async () => {
    if (!customTopic.trim()) return;
    playChime("tap");
    setIsExplainingCustom(true);

    try {
      const res = await fetch("/api/sahara/explain-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customTopic }),
      });
      const data = await res.json();
      setIsExplainingCustom(false);
      setCustomExplanation(data);

      if (data.spokenVersion) {
        speakText(data.spokenVersion, { rate: voiceSpeed, lang: language });
      }
    } catch (e) {
      console.error(e);
      setIsExplainingCustom(false);
    }
  };

  return (
    <div id="section-explain-news" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📰</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Explain Today's News
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-0.5">
            Calm, positive updates in plain language. No sensationalism or noise.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const headlines = newsList.map((n) => n.headline).join(". Next: ");
            speakText(`Here are today's top updates: ${headlines}`, {
              rate: voiceSpeed,
              lang: language,
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 text-sm font-bold transition-colors w-fit"
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>Read All Headlines</span>
        </button>
      </div>

      {/* Ask to explain any news topic */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border-2 ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
          Heard something on TV or newspaper? Ask Sahara to explain simply:
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g., What is the new railway concession rule for senior citizens?"
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-base font-medium focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCustomExplain}
            disabled={isExplainingCustom || !customTopic.trim()}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isExplainingCustom ? "Simplifying..." : "Explain Simply"}</span>
          </button>
        </div>

        {customExplanation && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 space-y-2">
            <h4 className="font-bold font-serif text-lg text-amber-950 dark:text-amber-300">
              {customExplanation.headline}
            </h4>
            <p className="text-base font-medium text-stone-800 dark:text-stone-200">
              {customExplanation.plainExplanation}
            </p>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              💡 Why it matters to you: {customExplanation.whyItMatters}
            </p>
          </div>
        )}
      </div>

      {/* Curated News Cards */}
      <div className="space-y-4">
        {newsList.map((item) => (
          <div
            key={item.id}
            id={`news-card-${item.id}`}
            className={`rounded-3xl p-6 border-2 transition-all shadow-xs ${
              highContrast
                ? "bg-stone-900 border-stone-700 text-stone-100"
                : "bg-white border-amber-200 text-stone-900"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-stone-800 px-3 py-1 rounded-full w-fit">
                {item.category} • {item.readTime}
              </span>

              <button
                type="button"
                onClick={() =>
                  speakText(`${item.headline}. In simple words: ${item.plainExplanation}`, {
                    rate: voiceSpeed,
                    lang: language,
                  })
                }
                className="text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 w-fit"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>Listen</span>
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-serif mb-4 leading-snug">
              {item.headline}
            </h3>

            {/* Simplification & Why it matters toggles */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleExplainSimply(item)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 ${
                    activeExplainId === item.id
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-amber-100"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explain Simply</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhyImportant(item)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 ${
                    activeWhyId === item.id
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-emerald-100"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Why is this important?</span>
                </button>
              </div>

              {/* Simple explanation panel */}
              {activeExplainId === item.id && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 animate-in fade-in">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
                    In simple everyday words:
                  </span>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-900 dark:text-stone-100">
                    {item.plainExplanation}
                  </p>
                </div>
              )}

              {/* Why it matters panel */}
              {activeWhyId === item.id && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-stone-800/80 border border-emerald-200 dark:border-stone-700 animate-in fade-in">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                    Why this matters to you:
                  </span>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-900 dark:text-stone-100">
                    {item.whyItMatters}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
