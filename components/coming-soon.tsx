'use client'

import { useEffect, useState } from 'react'

const LAUNCH_DATE = new Date('2026-06-24T00:00:00+05:30')
const WA_NUMBER = '+919432436470'
const CONTACT_EMAIL = 'lunarz.info@gmail.com'

interface TimeLeft {
  days: number
  hours: number
  mins: number
  secs: number
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function ComingSoonPage() {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, mins: 0, secs: 0 })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    setTime(getTimeLeft())
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  function handleNotify() {
    if (!email || !email.includes('@')) {
      setEmailError(true)
      return
    }
    setEmailError(false)
    setSubmitted(true)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Notify me at launch&body=Please notify me at: ${email}`
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent("Hi Lunarz! I'm interested in placing a custom t-shirt order.")
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
    
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 1.5rem 4rem',
    }}>

      {/* ── Top bar ── */}
      <header style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 0 0',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '1.5rem',
        marginBottom: '0',
      }}>
        {/* Demo logo — replace <img src="/logo.png" ... /> when you have it */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
                            src="/logo.png" 
                            alt={"Lunarz Logo"} 
                            className="h-8 w-auto"
                          
                          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        // paddingTop: '5rem',
        gap: '0',
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: '#a07820',
          background: '#fdf6e3',
          border: '1px solid #f0d88a',
          borderRadius: '100px',
          padding: '5px 16px',
          marginBottom: '2rem',
        }}>
          We're working on a better experience.
        </div>

        {/* Headline */}
        <h1 style={{
         
          fontSize: 'clamp(2.4rem, 8vw, 4rem)',
          fontWeight: 700,
          color: '#0a0a0f',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '1.1rem',
        }}>
          Something fresh<br />
          <span style={{ color: '#e8c46a' }}>is on its way.</span>
        </h1>

        {/* ── Countdown ── */}
        <div style={{
          display: 'flex',
          gap: 'clamp(1rem, 4vw, 2rem)',
          alignItems: 'flex-start',
          marginBottom: '3.5rem',
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: '20px',
          padding: '1.8rem 2.4rem',
        }}>
          {[
            { val: time.days, label: 'Days' },
            { val: time.hours, label: 'Hours' },
            { val: time.mins, label: 'Mins' },
            { val: time.secs, label: 'Secs' },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(1rem, 4vw, 2rem)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  
                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                  fontWeight: 600,
                  color: '#0a0a0f',
                  lineHeight: 1,
                  minWidth: '2ch',
                }}>
                  {pad(item.val)}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase' as const,
                  color: '#bbb',
                }}>
                  {item.label}
                </span>
              </div>
              {i < 3 && (
                <span style={{
                 
                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                  color: '#ddd',
                  lineHeight: 1,
                  marginTop: '2px',
                  marginLeft: `clamp(-0.8rem, -2vw, -1.2rem)`,
                }}>
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          width: '100%', maxWidth: '420px', marginBottom: '1.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          <span style={{ fontSize: '11px', color: 'black', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            Custom Orders
          </span>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
        </div>

        {/* ── WhatsApp button ── */}
        <button
          onClick={handleWhatsApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f0faf4',
            border: '1.5px solid #b6e8c8',
            borderRadius: '100px',
            padding: '13px 28px',
            color: '#1a7a45',
            fontSize: '14px',
            fontWeight: 500,
          
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = '#dcf5e7'
            el.style.borderColor = '#7ecfa4'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = '#f0faf4'
            el.style.borderColor = '#b6e8c8'
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* WhatsApp SVG icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span style={{width: 'max-content'}}>Order Custom T-Shirts on WhatsApp</span>
        </button>
        <p style={{ fontSize: '12px', color: 'black', marginBottom: '3rem' }}>
          Chat with us to place your custom order
        </p>

        {/* ── Contact ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ fontSize: '12px', color: '#bbb', textDecoration: 'none', letterSpacing: '0.03em' }}
          >
            {CONTACT_EMAIL}
          </a>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ddd', display: 'inline-block' }} />
          <a href="/"><span style={{ fontSize: '12px', color: '#bbb', letterSpacing: '0.03em' }}>lunarz.in</span></a>
        </div>

      </main>
    </div>
  )
}
