import React from "react";
import { useAccountMode } from "../accountMode";
import { useI18n } from "../i18n";
import {
  apiUrl,
  getAuthHeaders,
  getStoredAiEnabled,
  setStoredAccountMode,
  setStoredAiEnabled,
  setStoredLanguage,
} from "../components/api";

export default function SettingsPage() {
  const { language, setLanguage, t } = useI18n();
  const { accountMode, setAccountMode } = useAccountMode();
  const aiEnabled = getStoredAiEnabled();
  const supportEmail = "prajwalgautam7223@gmail.com";
  const supportPhone = "+977 9818313694";
  const supportPhoneDigits = "9779818313694";
  const supportMessage = encodeURIComponent("Hi, I need help with Hisaab.");

  const updateLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);

    try {
      await fetch(apiUrl("/api/auth/preferences"), {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ language: nextLanguage }),
      });
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  const updateAccountMode = async (nextMode) => {
    setAccountMode(nextMode);
    setStoredAccountMode(nextMode);

    try {
      await fetch(apiUrl("/api/auth/preferences"), {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ accountMode: nextMode }),
      });
    } catch (error) {
      console.error("Failed to save account mode preference:", error);
    }
  };

  const updateAiEnabled = (nextEnabled) => {
    setStoredAiEnabled(nextEnabled);
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.accountModeTitle")}</p>
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
              <p className={`mt-2 text-sm ${accountMode === "personal" ? "text-white/75" : "text-slate-500"}`}>{t("settings.personalHint")}</p>
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
              <p className={`mt-2 text-sm ${accountMode === "shop" ? "text-white/75" : "text-slate-500"}`}>{t("settings.shopHint")}</p>
            </button>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.currentLanguage")}</p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {language === "ne" ? t("settings.nepali") : t("settings.english")}
          </p>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.activeBook")}</p>
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

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                  {t("settings.aiTitle")}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {t("settings.aiHeading")}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {t("settings.aiHint")}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={aiEnabled}
                onClick={() => updateAiEnabled(!aiEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  aiEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                    aiEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/60 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {aiEnabled ? t("settings.aiOn") : t("settings.aiOff")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {aiEnabled ? t("settings.aiOnHint") : t("settings.aiOffHint")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.helpEyebrow")}</p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">{t("settings.helpTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("settings.helpSubtitle")}</p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.emailLabel")}</p>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-2 block text-base font-semibold text-slate-900 hover:text-blue-600"
              >
                {supportEmail}
              </a>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{t("settings.phoneLabel")}</p>
              <a
                href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                className="mt-2 block text-base font-semibold text-slate-900 hover:text-blue-600"
              >
                {supportPhone}
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                className="rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
              >
                {t("settings.callNow")}
              </a>
              <a
                href={`https://wa.me/${supportPhoneDigits}?text=${supportMessage}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-emerald-200 bg-emerald-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-600"
              >
                {t("settings.whatsappNow")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
