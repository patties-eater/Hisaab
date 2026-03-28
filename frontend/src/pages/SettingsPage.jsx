import React from "react";
import { useAccountMode } from "../accountMode";
import { useI18n } from "../i18n";
import { getAuthHeaders, setStoredAccountMode, setStoredLanguage } from "../components/api";

export default function SettingsPage() {
  const { language, setLanguage, t } = useI18n();
  const { accountMode, setAccountMode } = useAccountMode();

  const updateLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);

    try {
      await fetch("http://localhost:5000/api/auth/preferences", {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ language: nextLanguage }),
      });
    } catch (err) {
      console.error("Failed to save language preference:", err);
    }
  };

  const updateAccountMode = async (nextMode) => {
    setAccountMode(nextMode);
    setStoredAccountMode(nextMode);

    try {
      await fetch("http://localhost:5000/api/auth/preferences", {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ accountMode: nextMode }),
      });
    } catch (err) {
      console.error("Failed to save account mode preference:", err);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
          {t("settings.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            {t("settings.languageTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {t("settings.languageHint")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateLanguage("en")}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                language === "en"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">{t("settings.english")}</p>
              <p className={`mt-2 text-sm ${language === "en" ? "text-white/75" : "text-slate-500"}`}>
                {t("settings.englishHint")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateLanguage("ne")}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                language === "ne"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">{t("settings.nepali")}</p>
              <p className={`mt-2 text-sm ${language === "ne" ? "text-white/75" : "text-slate-500"}`}>
                {t("settings.nepaliHint")}
              </p>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            Account Mode
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateAccountMode("personal")}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                accountMode === "personal"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">Niji</p>
              <p className={`mt-2 text-sm ${accountMode === "personal" ? "text-white/75" : "text-slate-500"}`}>
                Personal finance book with interest-based debt and credit.
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateAccountMode("shop")}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                accountMode === "shop"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">Dokan</p>
              <p className={`mt-2 text-sm ${accountMode === "shop" ? "text-white/75" : "text-slate-500"}`}>
                Shop ledger for short-term customer and supplier credit without interest.
              </p>
            </button>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {t("settings.currentLanguage")}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {language === "ne" ? t("settings.nepali") : t("settings.english")}
          </p>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            Active book
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {accountMode === "shop" ? "Dokan" : "Niji"}
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">
              {t("settings.comingSoonTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("settings.comingSoonHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
