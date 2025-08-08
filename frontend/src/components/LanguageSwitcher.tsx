import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 sm:gap-2 bg-primary/20 hover:bg-primary/30 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-white font-medium text-sm sm:text-base">
          {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 bg-card/95 backdrop-blur-sm border border-input rounded-md shadow-lg min-w-[130px] overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-input/50 transition-colors duration-200
                ${
                  i18n.language === lang.code
                    ? "bg-primary/20 text-primary"
                    : "text-white"
                }
              `}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{lang.name}</span>
                <span className="text-xs text-slate-400">
                  {lang.code.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
