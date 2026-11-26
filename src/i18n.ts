import en from '../locales/en/common.json'
import ar from '../locales/ar/common.json'

export type Lang = 'en' | 'ar'
export const dicts: Record<Lang, Record<string, string>> = {
  en: en as Record<string, string>,
  ar: ar as Record<string, string>,
}
const KEY = 'studio-lang'
export function loadLang(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}
export function saveLang(l: Lang) {
  try { localStorage.setItem(KEY, l) } catch { /* storage unavailable */ }
}
export function t(lang: Lang, key: string): string {
  return dicts[lang][key] ?? dicts.en[key] ?? key
}
