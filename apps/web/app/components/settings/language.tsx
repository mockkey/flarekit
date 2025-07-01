import { RiGlobalLine } from "@remixicon/react";
import { useEffect, useState } from "react";

const languageOptions = [
  { value: "system", label: "System (Auto)" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

export default function LanguageSelect() {
  const getInitialLanguage = () => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("language") || "system";
    }
    return "system";
  };
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (language !== "system") {
        window.localStorage.setItem("language", language);
        document.documentElement.lang = language;
      } else {
        window.localStorage.removeItem("language");
        const systemLanguage = navigator.language.split("-")[0];
        document.documentElement.lang = systemLanguage;
      }
    }
  }, [language]);

  return (
    <div className="relative w-full max-w-[180px]">
      <label
        htmlFor="language-select"
        className="text-xs font-medium text-muted-foreground mb-1 pl-1 flex items-center gap-1"
      >
        <RiGlobalLine className="size-4" /> Language
      </label>
      <div className="relative">
        <select
          id="language-select"
          className="w-full appearance-none border-2 border-muted rounded-lg px-3 py-2 pr-8 text-sm bg-popover hover:bg-accent focus:border-primary focus:outline-none transition-colors shadow-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
        >
          {languageOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-background text-foreground"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          ▼
        </span>
      </div>
    </div>
  );
}
