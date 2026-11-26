import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, EnvelopeSimple, FloppyDisk, Plus, Trash, X } from '@phosphor-icons/react'
import { loadLang, saveLang, t, type Lang } from './i18n'

type Tone = 'formal' | 'friendly' | 'confident'
type Length = 'short' | 'medium' | 'long'
type Saved = { id: string; name: string; role: string; company: string; text: string; date: string }
type Errors = Partial<Record<'name' | 'role' | 'company' | 'job', string>>

const HISTORY_KEY = 'lettercraft-history-v1'

function loadHistory(): Saved[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as Saved[]) : []
  } catch {
    return []
  }
}

const EN_OPEN = [
  (name: string, role: string, company: string) =>
    `Dear hiring team at ${company},\n\nI am writing to apply for the ${role} role. My name is ${name}, and I would like to bring my experience to your team.`,
  (name: string, role: string, company: string) =>
    `Dear ${company} hiring team,\n\nMy name is ${name}. I am applying for the ${role} position because the work you describe matches the experience I have built and the results I enjoy delivering.`,
  (name: string, role: string, company: string) =>
    `Dear hiring manager,\n\nThank you for considering my application for the ${role} role at ${company}. I am ${name}, and I am ready to contribute from day one.`,
]
const AR_OPEN = [
  (name: string, role: string, company: string) =>
    `فريق التوظيف في ${company}،\n\nأكتب إليكم للتقدم لوظيفة ${role}. اسمي ${name}، وأود أن أضع خبرتي في خدمة فريقكم.`,
  (name: string, role: string, company: string) =>
    `فريق التوظيف في ${company}،\n\nاسمي ${name}. أتقدم لوظيفة ${role} لأن العمل الذي تصفونه يطابق الخبرة التي بنيتها والنتائج التي أحب تحقيقها.`,
  (name: string, role: string, company: string) =>
    `إلى مدير التوظيف،\n\nشكرا لكم على النظر في طلبي لوظيفة ${role} في ${company}. أنا ${name}، ومستعد للمساهمة من اليوم الأول.`,
]

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang)
  const tr = (k: string) => t(lang, k)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [job, setJob] = useState('')
  const [experience, setExperience] = useState('')
  const [tone, setTone] = useState<Tone>('formal')
  const [length, setLength] = useState<Length>('medium')
  const [errors, setErrors] = useState<Errors>({})
  const [versions, setVersions] = useState<string[]>([])
  const [selected, setSelected] = useState(0)
  const [letter, setLetter] = useState('')
  const [history, setHistory] = useState<Saved[]>(loadHistory)
  const [notice, setNotice] = useState('')
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    saveLang(lang)
  }, [lang])

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch { /* ignore */ }
  }, [history])

  const wordCount = useMemo(() => (letter.trim() ? letter.trim().split(/\s+/).length : 0), [letter])

  function buildLetter(variant: number): string {
    const opens = lang === 'ar' ? AR_OPEN : EN_OPEN
    const open = opens[variant % 3](name.trim(), role.trim(), company.trim())
    const toneLine =
      lang === 'ar'
        ? tone === 'formal'
          ? 'ألتزم بأعلى معايير الجودة والدقة في عملي.'
          : tone === 'friendly'
            ? 'أستمتع بالعمل مع فرق متنوعة وبناء علاقات عمل جيدة.'
            : 'أثق بقدرتي على تحقيق نتائج واضحة وقابلة للقياس.'
        : tone === 'formal'
          ? 'I hold myself to high standards of quality and accuracy in my work.'
          : tone === 'friendly'
            ? 'I enjoy working with varied teams and building good working relationships.'
            : 'I am confident I can deliver clear, measurable results.'
    const middle =
      lang === 'ar'
        ? `في ما يخص خبرتي: ${experience.trim() || '—'}\n\nقرأت وصف الوظيفة بعناية، وأرى أن متطلبات الدور تتوافق مع مهاراتي. ${toneLine}`
        : `About my experience: ${experience.trim() || '—'}\n\nI read the job description carefully, and the requirements of this role match my skills. ${toneLine}`
    const close =
      lang === 'ar'
        ? length === 'short'
          ? 'يسعدني الحديث معكم عن كيفية مساهمتي في فريقكم.\n\nمع خالص التقدير،\n' + name.trim()
          : 'أتطلع إلى فرصة لمناقشة كيف يمكنني دعم أهداف ' + company.trim() + '، وأنا متاح لمقابلة في الوقت الذي يناسبكم.\n\nمع خالص التقدير،\n' + name.trim()
        : length === 'short'
          ? 'I would welcome the chance to talk about how I can support your team.\n\nKind regards,\n' + name.trim()
          : 'I look forward to the chance to discuss how I can support the goals of ' + company.trim() + ', and I am available for an interview at a time that suits you.\n\nKind regards,\n' + name.trim()
    const extra =
      length === 'long'
        ? lang === 'ar'
          ? '\n\nأحرص على التعلم المستمر ومتابعة أفضل الممارسات في مجالي، وأسعى دائما إلى تحسين طريقة عملي ونتائجه.'
          : '\n\nI keep learning and following good practice in my field, and I always look for ways to improve how I work and what I deliver.'
        : ''
    return `${open}\n\n${middle}${extra}\n\n${close}`
  }

  function generate() {
    const e: Errors = {}
    if (!name.trim()) e.name = tr('errorName')
    if (!role.trim()) e.role = tr('errorRole')
    if (!company.trim()) e.company = tr('errorCompany')
    if (job.trim().length < 20) e.job = tr('errorJob')
    setErrors(e)
    if (Object.keys(e).length > 0) return
    const v = [0, 1, 2].map((i) => buildLetter(i))
    setVersions(v)
    setSelected(0)
    setLetter(v[0])
    setNotice('')
  }

  function pickVersion(i: number) {
    setSelected(i)
    setLetter(versions[i])
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter)
      setNotice(tr('copied'))
    } catch {
      const ta = document.createElement('textarea')
      ta.value = letter
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setNotice(tr('copied'))
    }
  }

  function downloadLetter() {
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${role.trim().replace(/\s+/g, '-').toLowerCase() || 'draft'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function saveLetter() {
    if (!letter.trim()) return
    const item: Saved = {
      id: `${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      text: letter,
      date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB'),
    }
    setHistory((h) => [item, ...h])
    setNotice(tr('saved'))
  }

  function loadSaved(item: Saved) {
    setName(item.name)
    setRole(item.role)
    setCompany(item.company)
    setLetter(item.text)
    setVersions([item.text])
    setSelected(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm">
        {tr('skipToContent')}
      </a>
      <header className="bg-[#181818] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5]"><EnvelopeSimple size={20} weight="bold" /></span>
            <div>
              <p className="text-base font-semibold leading-6">{tr('appName')}</p>
              <p className="text-xs font-medium leading-4 text-neutral-400">{tr('appTagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label={tr('language')}>
            <button type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'} className={`rounded-lg px-3 py-2 text-sm font-semibold duration-300 ${lang === 'en' ? 'bg-white text-[#181818]' : 'bg-[#272727] text-white'}`}>English</button>
            <button type="button" onClick={() => setLang('ar')} aria-pressed={lang === 'ar'} className={`rounded-lg px-3 py-2 text-sm font-semibold duration-300 ${lang === 'ar' ? 'bg-white text-[#181818]' : 'bg-[#272727] text-white'}`}>العربية</button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="max-w-2xl">
          <span className="inline-block rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4F46E5]">{tr('demoLabel')}</span>
          <h1 className="mt-4 text-4xl font-semibold leading-10 sm:text-5xl sm:leading-none">{tr('coverLetter')}</h1>
          <p className="mt-4 max-w-[680px] text-base font-medium leading-6 text-neutral-600">{tr('demoNote')}</p>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section aria-label={tr('createLetter')} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <h2 className="text-xl font-semibold leading-7">{tr('createLetter')}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="f-name" className="text-sm font-medium leading-5">{tr('name')}</label>
                <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('namePlaceholder')} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base" />
                {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-role" className="text-sm font-medium leading-5">{tr('role')}</label>
                  <input id="f-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder={tr('rolePlaceholder')} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base" />
                  {errors.role && <p className="mt-1 text-sm text-red-700">{errors.role}</p>}
                </div>
                <div>
                  <label htmlFor="f-company" className="text-sm font-medium leading-5">{tr('company')}</label>
                  <input id="f-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tr('companyPlaceholder')} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base" />
                  {errors.company && <p className="mt-1 text-sm text-red-700">{errors.company}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="f-job" className="text-sm font-medium leading-5">{tr('jobDescription')}</label>
                <textarea id="f-job" value={job} onChange={(e) => setJob(e.target.value)} rows={4} placeholder={tr('jobPlaceholder')} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base" />
                {errors.job && <p className="mt-1 text-sm text-red-700">{errors.job}</p>}
              </div>
              <div>
                <label htmlFor="f-exp" className="text-sm font-medium leading-5">{tr('experience')}</label>
                <textarea id="f-exp" value={experience} onChange={(e) => setExperience(e.target.value)} rows={4} placeholder={tr('experiencePlaceholder')} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-tone" className="text-sm font-medium leading-5">{tr('tone')}</label>
                  <select id="f-tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base">
                    <option value="formal">{tr('toneFormal')}</option>
                    <option value="friendly">{tr('toneFriendly')}</option>
                    <option value="confident">{tr('toneConfident')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-length" className="text-sm font-medium leading-5">{tr('length')}</label>
                  <select id="f-length" value={length} onChange={(e) => setLength(e.target.value as Length)} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base">
                    <option value="short">{tr('lengthShort')}</option>
                    <option value="medium">{tr('lengthMedium')}</option>
                    <option value="long">{tr('lengthLong')}</option>
                  </select>
                </div>
              </div>
              <button type="button" onClick={generate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-3 py-2 text-base font-semibold text-white duration-300 hover:bg-[#4338CA]">
                <Plus size={18} weight="bold" /> {tr('generate')}
              </button>
            </div>
          </section>

          <section aria-label={tr('yourLetter')} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold leading-7">{tr('yourLetter')}</h2>
              {letter && <span className="text-xs font-medium text-neutral-500">{wordCount} {tr('wordCount')}</span>}
            </div>
            {versions.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={tr('versions')}>
                {versions.map((_, i) => (
                  <button key={i} type="button" role="tab" aria-selected={selected === i} onClick={() => pickVersion(i)} className={`rounded-lg px-3 py-2 text-sm font-semibold duration-300 ${selected === i ? 'bg-[#4F46E5] text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                    {tr('version')} {i + 1}
                  </button>
                ))}
              </div>
            )}
            {letter ? (
              <>
                <textarea value={letter} onChange={(e) => setLetter(e.target.value)} rows={14} aria-label={tr('coverLetter')} className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base leading-6" />
                {notice && <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-700"><Check size={16} /> {notice}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={copyLetter} className="flex items-center gap-2 rounded-xl bg-[#181818] px-3 py-2 text-sm font-semibold text-white duration-300"><Copy size={16} /> {tr('copy')}</button>
                  <button type="button" onClick={downloadLetter} className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold duration-300"><Download size={16} /> {tr('download')}</button>
                  <button type="button" onClick={saveLetter} className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold duration-300"><FloppyDisk size={16} /> {tr('save')}</button>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl bg-neutral-50 p-8 text-center">
                <EnvelopeSimple size={32} className="mx-auto text-neutral-400" />
                <p className="mt-4 text-base font-medium text-neutral-600">{tr('historyEmpty')}</p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6" aria-label={tr('history')}>
          <h2 className="text-xl font-semibold leading-7">{tr('history')}</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">{tr('noHistory')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{item.role} · {item.company}</p>
                    <p className="text-xs text-neutral-500">{item.name} · {tr('savedAt')} {item.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {confirmDelete === item.id ? (
                      <>
                        <button type="button" onClick={() => { setHistory((h) => h.filter((x) => x.id !== item.id)); setConfirmDelete(null) }} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white">{tr('deleteConfirm')}</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold">{tr('cancel')}</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => loadSaved(item)} className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold">{tr('use')}</button>
                        <button type="button" onClick={() => setConfirmDelete(item.id)} aria-label={tr('delete')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-red-700"><Trash size={16} /></button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-xs text-neutral-500">{tr('footerNote')}</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => setLegal('privacy')} className="text-sm font-medium text-neutral-600 underline">{tr('privacy')}</button>
            <button type="button" onClick={() => setLegal('terms')} className="text-sm font-medium text-neutral-600 underline">{tr('terms')}</button>
          </div>
        </div>
      </footer>

      {legal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{tr(legal)}</h2>
              <button type="button" onClick={() => setLegal(null)} aria-label={tr('close')} className="rounded-lg p-2 hover:bg-neutral-100"><X size={18} /></button>
            </div>
            <p className="mt-4 text-base leading-6 text-neutral-600">{tr(legal === 'privacy' ? 'privacyText' : 'termsText')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
