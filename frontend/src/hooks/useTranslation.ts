import { useTranslation as useI18nTranslation } from "react-i18next";

type TranslationOptions = {
    [key: string]: string | number | boolean;
};

export const useTranslation = () => {
    const { t, i18n } = useI18nTranslation();

    const translate = (key: string, options?: TranslationOptions) => {
        return t(key, options);
    };

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    return {
        t: translate,
        changeLanguage,
        currentLanguage: i18n.language,
    };
};
