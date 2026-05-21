import { useState, useEffect, useRef } from 'react';
import logoBlack from './assets/logo-black.png';
import logoWhite from './assets/logo-white.png';
import { FlickeringGridDemo } from './components/ui/demo.jsx';

const INDICADOR = "Luz Solar MT";
const WEBHOOK_URL = 'https://webhook.gabrielporceli.com.br/webhook/iNDICACAO';

const EVO_URL      = 'https://api.gabrielporceli.com.br';
const EVO_KEY      = '2C2B8ACDE0FB-44EA-BD01-59E39E4A9E76';
const EVO_INSTANCE = 'agencia02';
const EVO_GROUP    = '120363162167738258@g.us';

const sendWhatsApp = async (payload) => {
  const lines = [
    `🔔 *Nova indicação — ${payload.indicador}*`,
    '',
    `👤 *Nome:* ${payload.nome}`,
    `📱 *WhatsApp:* ${payload.whatsapp}`,
    payload.instagram ? `📸 *Instagram:* ${payload.instagram}` : null,
    payload.site      ? `🌐 *Site:* ${payload.site}`           : null,
    '',
    `💬 *O que precisa:*\n${payload.necessidade}`,
  ].filter(l => l !== null).join('\n');

  await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVO_KEY },
    body: JSON.stringify({ number: EVO_GROUP, text: lines }),
  });
};

const App = () => {
  const [form, setForm] = useState({ name: '', phone: '', instagram: '', site: '', need: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const dropdownRef = useRef(null);

  const STATS = [
    { prefix: '', value: 94, suffix: '%', label: 'clientes satisfeitos' },
    { prefix: '', value: 3, suffix: 'x', label: 'crescimento médio' },
    { prefix: '+', value: 200, suffix: '', label: 'projetos entregues' },
    { prefix: '', value: 4.9, suffix: '★', label: 'avaliação média' },
  ];
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const proofRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const el = proofRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || animated.current) return;
      animated.current = true;
      STATS.forEach((stat, i) => {
        const duration = 1200;
        const steps = 60;
        const interval = duration / steps;
        const isDecimal = !Number.isInteger(stat.value);
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = isDecimal
            ? parseFloat((eased * stat.value).toFixed(1))
            : Math.round(eased * stat.value);
          setCounts(prev => { const next = [...prev]; next[i] = current; return next; });
          if (step >= steps) clearInterval(timer);
        }, interval);
      });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSendError(false);

    const payload = {
      indicador: INDICADOR,
      nome: form.name,
      whatsapp: form.phone,
      instagram: form.instagram,
      site: form.site,
      necessidade: form.need,
      data: new Date().toISOString(),
    };

    try {
      const backlog = JSON.parse(localStorage.getItem('vpi_backlog') || '[]');
      backlog.push(payload);
      localStorage.setItem('vpi_backlog', JSON.stringify(backlog));
    } catch (_) { }

    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) { success = true; break; }
      } catch (_) { }
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
    }

    setLoading(false);
    if (success) {
      sendWhatsApp(payload).catch(() => {});
      setSubmitted(true);
    } else {
      setSendError(true);
    }
  };

  const logo = dark ? logoWhite : logoBlack;
  const c = {
    text:      dark ? '#EFEFEF' : '#161616',
    textSub:   dark ? '#7A7A70' : '#6A6A60',
    border:    dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    borderMed: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    emphasis:  dark ? '#FFFFFF' : '#161616',
    formCard:  dark ? '#1A1A1A' : '#FFFFFF',
  };
  const fc = {
    text:        c.text,
    textSub:     c.textSub,
    dividerLine: c.border,
    dividerText: c.textSub,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav className="nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} alt="Logo" className="nav-logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setDark(d => !d)}
            aria-label={dark ? 'Modo claro' : 'Modo escuro'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: c.textSub, display: 'flex', alignItems: 'center', borderRadius: '8px', transition: 'color 0.2s' }}
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px', fontSize: '13px', margin: 0, color: '#6829c0' }}
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Entre em Contato
          </button>
        </div>
      </nav>

      {/* HERO WITH FLICKERING GRID LOGO MASK */}
      <section style={{ position: 'relative', minHeight: '95vh', width: '100%', marginTop: '-76px', paddingTop: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <FlickeringGridDemo />

        {/* Hero Content Overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '76px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="hero-tag" style={{ justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{ width: '28px', height: '0.5px', backgroundColor: '#6829c0' }} />
              <span style={{ fontSize: '11px', color: c.textSub, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Você foi indicado por alguém de confiança
              </span>
            </div>

            <h1 className="hero-h1" style={{ maxWidth: '1000px', margin: '0 auto 32px' }}>
              Você chegou até aqui<br />
              porque <span style={{ fontStyle: 'italic', color: '#6829c0' }}>alguém acredita</span><br />
              no seu potencial.
            </h1>

            <p className="hero-sub" style={{ margin: '0 auto', maxWidth: '650px' }}>
              <span style={{ color: c.textSub }}>Essa não é uma oferta aberta. </span>
              <span style={{ color: c.emphasis, fontWeight: 500 }}>É um convite exclusivo</span>
              {' '}
              <span style={{ color: c.textSub }}>feito por um cliente nosso que viu resultado e quis estender esse benefício para você.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <section ref={proofRef} style={{
        borderTop: `0.5px solid ${c.border}`,
        borderBottom: `0.5px solid ${c.border}`,
        marginBottom: '80px'
      }}>
        <div className="container proof-bar" style={{ padding: '0' }}>
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="proof-item reveal"
              data-delay={String(i + 1)}
              style={{
                flex: 1,
                padding: '32px 48px',
                borderRight: i < 3 ? `0.5px solid ${c.border}` : 'none',
                textAlign: 'center',
              }}
            >
              <div className="proof-number">
                {stat.prefix}{counts[i]}{stat.suffix}
              </div>
              <div className="proof-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <main className="container" style={{ marginBottom: '120px' }}>
        <div
          className="main-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '80px' }}
        >

          {/* LEFT COLUMN */}
          <div className="left-col">
            <span className="section-label reveal reveal--left">Como funciona</span>
            <h2 className="reveal" data-delay="1" style={{ fontSize: '28px', marginBottom: '24px' }}>
              Do convite ao resultado em 3 passos simples.
            </h2>

            <p className="reveal" data-delay="2" style={{ fontSize: '16px', color: c.textSub, marginBottom: '48px', maxWidth: '540px' }}>
              O convite de indicação garante que cada pessoa que entra aqui receba uma análise diagnóstica{' '}
              <span style={{ color: c.emphasis, fontWeight: 500 }}>do que podemos automatizar</span>.
              {' '}Sem fila. Sem formulário frio. Você foi apresentado por alguém que já conhece o trabalho.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '80px' }}>
              {[
                {
                  n: '01',
                  t: 'Preencha o formulário ao lado',
                  d: 'Nos conte sobre você e o que precisa. Leva menos de 2 minutos. Quanto mais específico, melhor a conversa inicial.',
                },
                {
                  n: '02',
                  t: 'Receba o contato em até 24h',
                  d: 'Por ser indicação, você tem prioridade. Entraremos em contato direto para entender seu contexto e propor solução personalizada.',
                },
                {
                  n: '03',
                  t: 'Condição exclusiva de indicado',
                  d: 'Indicações têm acesso a condições especiais que não são disponibilizadas publicamente. Você merece esse tratamento.',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="step-item reveal"
                  data-delay={String(i + 1)}
                  style={{ borderBottom: i < 2 ? `0.5px solid ${c.borderMed}` : 'none' }}
                >
                  <div className="step-badge">{step.n}</div>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{step.t}</h3>
                    <p style={{ fontSize: '15px', color: c.textSub }}>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CASES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <span className="section-label reveal reveal--left">Cases reais</span>

              {[
                {
                  name: "Julio's Burguer",
                  instagram: 'https://www.instagram.com/juliosburguer_/',
                  handle: '@juliosburguer_',
                  text: 'Campanhas de delivery com ROAS 30, cada R$1 investido retornou R$30 em pedidos.',
                },
                {
                  name: 'CBD Consultas',
                  instagram: 'https://www.instagram.com/cbdconsultas/',
                  handle: '@cbdconsultas',
                  text: 'Com a agência anterior pagavam R$32 por lead. Hoje pagam R$4,60 — redução de 86% no custo com aumento significativo no faturamento.',
                },
                {
                  name: 'El Hage Imóveis',
                  instagram: 'https://www.instagram.com/el_hage_imoveis/',
                  handle: '@el_hage_imoveis',
                  text: 'Antes pagavam mais de R$50 por lead qualificado para imóveis de alto padrão. Hoje a média é R$12,75.',
                },
              ].map((case_, i) => (
                <div key={i} className="reveal" data-delay={String(i + 1)}>
                  <p style={{ fontSize: '15px', color: c.text, lineHeight: 1.7, marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{case_.name}: </span>
                    {case_.text}
                  </p>
                  <a
                    href={case_.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#6829c0', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {case_.handle}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — FORM */}
          <div id="contact-form" className="sticky-col reveal reveal--scale" data-delay="3" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
            <div className="form-card" style={{ background: c.formCard, borderRadius: '16px', padding: '40px 36px', color: fc.text, transition: 'background 0.3s ease, color 0.3s ease' }}>

              {submitted ? (
                <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="check-pop" style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(104, 41, 192, 0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', color: '#6829c0', fontSize: '24px',
                  }}>✓</div>
                  <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Recebido!</h3>
                  <p style={{ fontSize: '15px', color: '#6A6A60', lineHeight: 1.6 }}>
                    Entraremos em contato em até 24h pelo WhatsApp informado. Você tem prioridade por ser indicado.
                  </p>
                </div>
              ) : (
                <>
                  <span className="section-label" style={{ color: '#6829c0' }}>Formulário de Indicação</span>
                  <h3 style={{ fontSize: '22px', marginBottom: '8px', fontWeight: 500, color: fc.text }}>
                    Vamos conversar sobre o seu projeto
                  </h3>
                  <p style={{ fontSize: '14px', color: fc.textSub, marginBottom: '32px' }}>
                    Preencha abaixo e entraremos em contato em até 2 horas.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Seu nome completo</label>
                      <input type="text" name="name" placeholder="Como prefere ser chamado?" required value={form.name} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>WhatsApp / Telefone</label>
                      <input type="tel" name="phone" placeholder="(00) 00000-0000" required value={form.phone} onChange={handleChange} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: fc.dividerLine }} />
                      <span style={{ fontSize: '10px', color: fc.dividerText, textTransform: 'uppercase', letterSpacing: '0.1em' }}>sobre a empresa</span>
                      <div style={{ flex: 1, height: '1px', background: fc.dividerLine }} />
                    </div>

                    <div className="form-group">
                      <label>Qual o Instagram da sua empresa?</label>
                      <input type="text" name="instagram" placeholder="@suaempresa" value={form.instagram} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>Qual o site da sua empresa?</label>
                      <input type="url" name="site" placeholder="https://suaempresa.com.br" value={form.site} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>O que você mais precisa agora?</label>
                      <textarea
                        name="need" rows="4"
                        placeholder="Ex: preciso aumentar minhas vendas, organizar meu marketing..."
                        required value={form.need} onChange={handleChange} style={{ resize: 'none' }}
                      />
                    </div>

                    {sendError && (
                      <div style={{ background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                        <div>
                          <p style={{ fontSize: '13px', color: '#F4A0A0', fontWeight: 500, marginBottom: '2px' }}>Falha no envio</p>
                          <p style={{ fontSize: '12px', color: '#A08080', lineHeight: 1.5 }}>Seus dados foram salvos localmente. Tente novamente ou entre em contato diretamente pelo WhatsApp.</p>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn-primary btn-cta" disabled={loading}>
                      {loading ? (
                        <span className="btn-cta__loading">
                          <span className="btn-cta__dot" /><span className="btn-cta__dot" /><span className="btn-cta__dot" />
                        </span>
                      ) : (
                        <span className="btn-cta__label">
                          Quero ser atendido
                          <span className="btn-cta__arrow">→</span>
                        </span>
                      )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                      <span style={{ fontSize: '12px', color: '#A0A090' }}>
                        🔒 Seus dados são protegidos e não serão compartilhados.
                      </span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `0.5px solid ${c.border}`, padding: '32px 48px', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontSize: '12px', color: c.textSub }}>Acesso exclusivo via indicação</span>
          </div>
          <span style={{ fontSize: '12px', color: c.textSub }}>© 2025 — Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
