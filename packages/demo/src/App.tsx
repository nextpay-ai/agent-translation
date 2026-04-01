import { useMemo, useState } from 'react'
import {
  Translate,
  TranslateProvider,
  Var,
  Plural,
  useLocale,
  useT,
} from '@nextpay-ai/agent-translation/react'
import { LocaleToggle } from '@nextpay-ai/agent-translation-ui'
import { formatCurrency, formatDateTime, getLocaleNativeName } from '@nextpay-ai/agent-translation'

type DemoLocale = 'en' | 'ph' | 'es'

const localeLabels: DemoLocale[] = ['en', 'ph', 'es']

const codeSample = `const config = defineConfig({
  locales: ['en', 'ph', 'es'] as const,
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'] as const,
})

<Translate
  _v="a3f9c28e"
  en={<span>Good day, <Var>{user.name}</Var></span>}
  ph={<span>Magandang araw, <Var>{user.name}</Var></span>}
  es={<span>Buen dia, <Var>{user.name}</Var></span>}
/>`

function LocaleRail(): React.JSX.Element {
  const { locale, setLocale } = useLocale()

  return (
    <div className="locale-rail" aria-label="Locale selector">
      {localeLabels.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          className={nextLocale === locale ? 'is-active' : ''}
          onClick={() => setLocale(nextLocale)}
        >
          <span>{nextLocale.toUpperCase()}</span>
          <small>{getLocaleNativeName(nextLocale)}</small>
        </button>
      ))}
      <div className="locale-toggle-wrap">
        <LocaleToggle />
      </div>
    </div>
  )
}

function DemoPanel(): React.JSX.Element {
  const { locale } = useLocale()
  const t = useT()
  const user = { name: 'Mika' }
  const notifications = 3

  const formattedAmount = useMemo(
    () => formatCurrency(1999.99, 'PHP', { locale }),
    [locale],
  )
  const formattedTime = useMemo(
    () => formatDateTime(new Date('2026-04-01T16:30:00+08:00'), { locale }),
    [locale],
  )

  return (
    <section className="demo-shell" id="live-demo">
      <div className="demo-copy">
        <p className="eyebrow">Live demo</p>
        <h2>The same component, three locales, one typed contract.</h2>
        <p className="lede">
          Switch the locale and the UI updates instantly. The code stays inline with the component, and
          TypeScript keeps every locale prop honest.
        </p>
        <div className="demo-metrics">
          <div>
            <span>Current locale</span>
            <strong>{locale.toUpperCase()}</strong>
          </div>
          <div>
            <span>Formatted total</span>
            <strong>{formattedAmount}</strong>
          </div>
          <div>
            <span>Formatted time</span>
            <strong>{formattedTime}</strong>
          </div>
        </div>
      </div>

      <div className="demo-card">
        <LocaleRail />

        <div className="conversation">
          <Translate
            _v="a3f9c28e"
            en={<h3>Good day, <Var>{user.name}</Var>.</h3>}
            ph={<h3>Magandang araw, <Var>{user.name}</Var>.</h3>}
            es={<h3>Buen dia, <Var>{user.name}</Var>.</h3>}
          />

          <Translate
            _v="b7319e02"
            en={<p>Every locale lives beside the source copy, so agents edit the exact code they need.</p>}
            ph={<p>Nakatabi sa source copy ang bawat locale kaya eksaktong code ang ina-update ng mga agent.</p>}
            es={<p>Cada idioma vive junto al texto fuente, asi que los agentes editan justo el codigo necesario.</p>}
          />

          <div className="notification-line">
            <Translate
              _v="c4a1f28e"
              en={<Plural n={notifications} singular={<>You have <Var>{notifications}</Var> notification.</>}>You have <Var>{notifications}</Var> notifications.</Plural>}
              ph={<Plural n={notifications} singular={<>Mayroon kang <Var>{notifications}</Var> abiso.</>}>Mayroon kang <Var>{notifications}</Var> na mga abiso.</Plural>}
              es={<Plural n={notifications} singular={<>Tienes <Var>{notifications}</Var> notificacion.</>}>Tienes <Var>{notifications}</Var> notificaciones.</Plural>}
            />
          </div>

          <div className="status-grid">
            <article>
              <span>{t({ en: 'Build status', ph: 'Katayuan ng build', es: 'Estado del build', _v: '95b54c11' })}</span>
              <strong>{t({ en: 'Type-safe', ph: 'Type-safe', es: 'Type-safe', _v: 'ba3121c0' })}</strong>
            </article>
            <article>
              <span>{t({ en: 'Review flow', ph: 'Daloy ng review', es: 'Flujo de revision', _v: '89e92733' })}</span>
              <strong>{t({ en: 'Agent-assisted', ph: 'May tulong ng agent', es: 'Asistido por agentes', _v: '1ce4fa92' })}</strong>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App(): React.JSX.Element {
  const [locale, setLocale] = useState<DemoLocale>('en')

  return (
    <TranslateProvider locale={locale} onLocaleChange={(nextLocale) => setLocale(nextLocale as DemoLocale)}>
      <div className="page-shell">
        <header className="hero">
          <nav>
            <a className="brand" href="https://github.com/nextpay-ai/agent-translation">
              agent-translation
            </a>
            <a className="ghost-link" href="#live-demo">Open demo</a>
          </nav>

          <div className="hero-grid">
            <section className="hero-copy">
              <p className="eyebrow">Type-enforced i18n for agents</p>
              <h1>Inline translations that stay in code, not in a spreadsheet graveyard.</h1>
              <p className="lede">
                Add a locale. Watch TypeScript fail everywhere it is missing. Let your coding agent fill in the
                rest.
              </p>

              <div className="hero-actions">
                <a className="primary-link" href="#live-demo">See the locale demo</a>
                <a className="secondary-link" href="https://github.com/nextpay-ai/agent-translation">View repository</a>
              </div>
            </section>

            <aside className="hero-panel" aria-label="Workflow snapshot">
              <div className="panel-glow" />
              <div className="panel-content">
                <p>Workflow</p>
                <ol>
                  <li>Add <code>'es'</code> to your config.</li>
                  <li>TypeScript marks every missing locale.</li>
                  <li>Run the translation skill and ship.</li>
                </ol>
                <pre>
                  <code>{codeSample}</code>
                </pre>
              </div>
            </aside>
          </div>
        </header>

        <main>
          <section className="proof-strip">
            <article>
              <span>Source of truth</span>
              <strong>Translations live beside the UI.</strong>
            </article>
            <article>
              <span>Guardrail</span>
              <strong>Missing locales fail the type check immediately.</strong>
            </article>
            <article>
              <span>Workflow</span>
              <strong>Agents patch the code you already own.</strong>
            </article>
          </section>

          <DemoPanel />

          <section className="detail-grid">
            <div>
              <p className="eyebrow">Why this is different</p>
              <h2>No JSON round-trip. No cloud translation dependency.</h2>
            </div>
            <div className="detail-list">
              <article>
                <h3>Inline JSX stays readable</h3>
                <p>
                  <code>{`<Translate>`}</code>, <code>{`<Var>`}</code>, and <code>{`<Plural>`}</code> keep your
                  translation context close to the component where it matters.
                </p>
              </article>
              <article>
                <h3>Stale hashes are detectable</h3>
                <p>
                  Change the source language, run <code>agent-translation sync</code>, and the lint rule flags any
                  translations that now need review.
                </p>
              </article>
              <article>
                <h3>Public demo, real package</h3>
                <p>
                  This site is built from the repo itself so GitHub Pages can act as the quick visual intro for the
                  library.
                </p>
              </article>
            </div>
          </section>

          <section className="workflow-band">
            <div>
              <p className="eyebrow">Command line</p>
              <h2>Small API surface, explicit workflow.</h2>
            </div>
            <div className="command-list">
              <code>npx agent-translation init</code>
              <code>npx agent-translation sync</code>
              <code>npx agent-translation check --json</code>
              <code>npx jsr run @nextpay-ai/agent-translation install-skills</code>
            </div>
          </section>
        </main>
      </div>
    </TranslateProvider>
  )
}
