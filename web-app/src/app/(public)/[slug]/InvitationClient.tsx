'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar, MapPin, Music, VolumeX, CalendarHeart, Clock4,
  Send, Heart, HeartOff, Search, Mail, Navigation,
  CalendarDays, GlassWater, PartyPopper, Utensils, Camera, Gift,
  Mic2, Sparkles, Clock
} from 'lucide-react'
import { getInvitationThemeCssVars } from '@/lib/invitation-content'

const AGENDA_ICON_MAP: Record<string, React.ElementType> = {
  CalendarDays,
  Calendar,
  Clock,
  Clock4,
  GlassWater,
  PartyPopper,
  Music,
  MapPin,
  Utensils,
  Camera,
  Gift,
  Mic2,
  Sparkles,
}

function isEmojiIcon(value: string) {
  return /[^\u0000-\u007F]/.test(value)
}

export default function InvitationClient({ wedding, guests, agenda, rsvps }: any) {
  const [screen, setScreen] = useState<'loading' | 'envelope' | 'main'>('loading')
  const [isOpening, setIsOpening] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // RSVP State
  const [rsvpGuest, setRsvpGuest] = useState<any>(null)
  const [rsvpNameSearch, setRsvpNameSearch] = useState('')
  const [rsvpSearchError, setRsvpSearchError] = useState('')
  const [attendingVal, setAttendingVal] = useState<'yes' | 'no' | null>(null)
  const [rsvpForm, setRsvpForm] = useState({
    count: 1,
    meal: 'any',
    liquor: 'yes',
    notes: ''
  })
  const [rsvpSubmitted, setRsvpSubmitted] = useState<any>(null)

  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Initialize
  useEffect(() => {
    const s = wedding.siteSettings || wedding.sections || {}
    if (s.loadingScreen === false) {
      setScreen('envelope')
    } else {
      const timer = setTimeout(() => {
        setScreen('envelope')
      }, 2200)
      return () => clearTimeout(timer)
    }
  }, [wedding])

  useEffect(() => {
    if (wedding.date) {
      const timeStr = wedding.time || '17:00'
      const target = new Date(`${wedding.date}T${timeStr}:00`)
      const interval = setInterval(() => {
        const diff = target.getTime() - new Date().getTime()
        if (diff <= 0) {
          clearInterval(interval)
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        } else {
          setCountdown({
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000)
          })
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [wedding])

  const handleOpenInvitation = () => {
    setIsOpening(true)
    if (audioRef.current && (wedding.music?.muteDefault !== true)) {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
    setTimeout(() => {
      setScreen('main')
    }, 1000)
  }

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }

  const handleRsvpSearch = () => {
    if (!rsvpNameSearch.trim()) {
      setRsvpSearchError('Please enter your name to search.')
      return
    }
    const match = guests.find((g: any) => g.name.toLowerCase().includes(rsvpNameSearch.toLowerCase()))
    if (!match) {
      setRsvpSearchError(`We couldn't find a guest named "${rsvpNameSearch}". Please try a different spelling.`)
      return
    }
    setRsvpSearchError('')
    setRsvpGuest(match)
    
    // Check if they already RSVP'd
    const existing = rsvps.find((r: any) => r.guestId === match.id)
    if (existing) {
      setRsvpSubmitted(existing)
    }
  }

  const submitRsvp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attendingVal) {
      setRsvpSearchError('Please select your attendance')
      return
    }
    const rsvp = {
      guestId: rsvpGuest.id,
      weddingId: wedding.id,
      status: attendingVal === 'yes' ? 'confirmed' : 'declined',
      attendingCount: attendingVal === 'yes' ? rsvpForm.count : 0,
      mealPreference: rsvpForm.meal,
      liquorPreference: rsvpForm.liquor,
      notes: rsvpForm.notes
    }
    
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvp)
      });
      if (res.ok) {
        setRsvpSubmitted(rsvp)
      } else {
        setRsvpSearchError('Failed to submit RSVP. Please try again.')
      }
    } catch (e) {
      console.error(e);
      setRsvpSearchError('An error occurred. Please try again.')
    }
  }

  // Format Dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
  }
  const formatAgendaTimeRange = (item: any) => {
    const start = item.startTime || item.time || ''
    const end = item.endTime || ''
    if (start && end && start !== end) return `${formatTime(start)} - ${formatTime(end)}`
    return formatTime(start)
  }
  const formatAgendaDuration = (item: any) => {
    const duration = Number(item.duration || item.durationMinutes || 0)
    if (!duration) return ''
    if (duration < 60) return `${duration} min`
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`
  }
  const renderAgendaIcon = (item: any) => {
    const iconValue = String(item.icon || item.iconKey || '').trim()
    if (iconValue && isEmojiIcon(iconValue)) {
      return <span className="timeline-icon-emoji" aria-hidden="true">{iconValue}</span>
    }
    const Icon = AGENDA_ICON_MAP[iconValue] || CalendarDays
    return <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
  }
  const getAgendaIconMode = (item: any) => {
    const iconValue = String(item.icon || item.iconKey || '').trim()
    if (iconValue && isEmojiIcon(iconValue)) return 'emoji'
    return AGENDA_ICON_MAP[iconValue] ? 'mapped' : 'fallback'
  }

  return (
    <div className="invitation-theme-root" style={getInvitationThemeCssVars(wedding.theme)}>
      {wedding.music?.enabled !== false && (
        <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      )}
      
      {/* LOADING SCREEN */}
      {screen === 'loading' && (
        <div className="loading-screen" aria-live="polite">
          <div className="loading-content">
            <h1 className="loading-initials">{wedding.brideName?.[0]} <span className="loading-amp">&</span> {wedding.groomName?.[0]}</h1>
            <p className="loading-text">Loading your invitation<span className="loading-dots">...</span></p>
          </div>
        </div>
      )}

      {/* ENVELOPE SCREEN */}
      {screen === 'envelope' && (
        <div className="envelope-screen">
          <div className="envelope-bg"><div className="env-pattern"></div><div className="env-overlay"></div></div>
          <div className="env-petals">🌸</div>
          
          <div className={`envelope-container ${isOpening ? 'flap-open opening' : ''}`}>
            <svg className="envelope-svg" viewBox="0 0 400 280">
              <rect x="10" y="70" width="380" height="200" rx="6" fill="#FDF5EC" />
              <polygon className="env-flap-poly" points="10,70 390,70 200,190" fill="#E8D5B7" style={{ transformOrigin: '200px 70px' }} />
            </svg>
          </div>

          <div className="envelope-content" style={{ opacity: isOpening ? 0 : 1, transition: 'opacity 0.8s' }}>
            <p className="cover-tagline">You Are Invited</p>
            <h1 className="cover-names">{wedding.brideName} & {wedding.groomName}</h1>
            <p className="cover-date">{formatDate(wedding.date)}</p>
            <p className="cover-venue">{wedding.venueName}</p>
            <button className="cover-btn" onClick={handleOpenInvitation}>
              <Mail className="cover-btn-icon" size={18} />
              <span>Open Invitation</span>
            </button>
            {wedding.music?.enabled !== false && (
               <button className="music-toggle" onClick={toggleMusic}>
                 {musicPlaying ? <Music size={20} /> : <VolumeX size={20} />}
               </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
        <main className="main-content" hidden={screen !== 'main'} aria-hidden={screen !== 'main'}>
          <section className="hero-section">
            <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80')" }}></div>
            <div className="hero-overlay"></div>
            <div className="hero-content" style={{ opacity: 1, transform: 'none' }}>
              <p className="hero-pretitle">The Wedding of</p>
              <h1 className="hero-names">{wedding.brideName} <span className="hero-amp">&</span> {wedding.groomName}</h1>
              <div className="hero-info">
                <span className="hero-info-item"><Calendar size={16} /> {formatDate(wedding.date)}</span>
                <span className="hero-info-sep">◆</span>
                <span className="hero-info-item"><MapPin size={16} /> {wedding.venueName}</span>
              </div>
            </div>
          </section>

          <section className="message-section reveal-section revealed">
            <div className="message-inner">
              <p className="message-label">With Joyful Hearts</p>
              <p className="message-body">Together with our families, we joyfully invite you to celebrate our wedding.</p>
              {wedding.story && <p className="story-text" style={{ marginTop: '2rem' }}>{wedding.story}</p>}
            </div>
          </section>

          <section className="details-section reveal-section revealed">
            <div className="section-container">
              <div className="section-header">
                <p className="section-label">The Details</p>
                <h2 className="section-title">Wedding Information</h2>
              </div>
              <div className="details-cards">
                <article className="detail-card reveal-card revealed">
                  <div className="detail-card-icon"><CalendarHeart size={24} /></div>
                  <h3 className="detail-card-title">Date & Time</h3>
                  <p className="detail-card-main">{formatDate(wedding.date)}</p>
                  <p className="detail-card-sub">{formatTime(wedding.time)} onwards</p>
                </article>
                <article className="detail-card reveal-card revealed">
                  <div className="detail-card-icon"><MapPin size={24} /></div>
                  <h3 className="detail-card-title">Venue</h3>
                  <p className="detail-card-main">{wedding.venueName}</p>
                  <p className="detail-card-sub">{wedding.venueAddress}</p>
                  {wedding.venueMapLink && (
                    <a href={wedding.venueMapLink} target="_blank" rel="noreferrer" className="detail-map-btn">
                      <Navigation size={14} /> Get Directions
                    </a>
                  )}
                </article>
              </div>
            </div>
          </section>

          {wedding.sections?.countdown !== false && (
            <section className="countdown-section reveal-section revealed">
              <div className="countdown-bg-pattern"></div>
              <div className="countdown-overlay"></div>
              <div className="section-container countdown-container">
                <p className="countdown-label">The Big Day Is</p>
                <h2 className="countdown-title">Coming Soon</h2>
                <div className="countdown-boxes">
                  <div className="countdown-box"><div className="cd-number-wrap"><span className="cd-number">{String(countdown.days).padStart(2,'0')}</span></div><span className="cd-unit">Days</span></div>
                  <div className="countdown-sep">:</div>
                  <div className="countdown-box"><div className="cd-number-wrap"><span className="cd-number">{String(countdown.hours).padStart(2,'0')}</span></div><span className="cd-unit">Hours</span></div>
                  <div className="countdown-sep">:</div>
                  <div className="countdown-box"><div className="cd-number-wrap"><span className="cd-number">{String(countdown.minutes).padStart(2,'0')}</span></div><span className="cd-unit">Minutes</span></div>
                  <div className="countdown-sep">:</div>
                  <div className="countdown-box"><div className="cd-number-wrap"><span className="cd-number">{String(countdown.seconds).padStart(2,'0')}</span></div><span className="cd-unit">Seconds</span></div>
                </div>
              </div>
            </section>
          )}

          {wedding.sections?.agenda !== false && agenda?.length > 0 && (
            <section className="agenda-section reveal-section revealed" data-testid="public-agenda">
              <div className="section-container">
                <div className="section-header">
                  <p className="section-label">The Day</p>
                  <h2 className="section-title">Day&apos;s Schedule</h2>
                </div>
                <div className="timeline" data-testid="public-agenda-list" role="list">
                  {agenda.map((item: any, i: number) => {
                    const timeLabel = formatAgendaTimeRange(item)
                    const durationLabel = formatAgendaDuration(item)
                    const locationLabel = item.location || ''
                    return (
                    <div
                      key={item.id || `${item.title}-${i}`}
                      className="timeline-item revealed"
                      data-testid="public-agenda-item"
                      data-agenda-id={item.id}
                      role="listitem"
                    >
                      <time className="timeline-time" data-testid="public-agenda-time" dateTime={item.startTime || item.time || ''}>
                        {timeLabel}
                      </time>
                      <div
                        className="timeline-dot"
                        data-testid="public-agenda-icon"
                        data-icon-key={String(item.icon || item.iconKey || '')}
                        data-icon-mode={getAgendaIconMode(item)}
                      >
                        <div className="timeline-dot-inner">{renderAgendaIcon(item)}</div>
                      </div>
                      <div className="timeline-content">
                        <h3 className="timeline-event-title clamp-one" data-testid="public-agenda-title" title={item.title}>{item.title}</h3>
                        {item.description && (
                          <p className="timeline-event-desc clamp-two" data-testid="public-agenda-description" title={item.description}>
                            {item.description}
                          </p>
                        )}
                        {(durationLabel || locationLabel) && (
                          <div className="timeline-event-meta">
                            {durationLabel && <span data-testid="public-agenda-duration"><Clock4 size={14} /> {durationLabel}</span>}
                            {locationLabel && <span data-testid="public-agenda-location" title={locationLabel}><MapPin size={14} /> {locationLabel}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </section>
          )}

          {wedding.sections?.rsvp !== false && (
            <section className="rsvp-section reveal-section revealed" id="rsvp">
              <div className="rsvp-bg-pattern"></div>
              <div className="section-container rsvp-container">
                <div className="section-header rsvp-header">
                  <p className="section-label">Kindly Reply</p>
                  <h2 className="section-title">Will You Join Us?</h2>
                </div>
                
                <div className="rsvp-card">
                  {!rsvpGuest ? (
                    <div className="rsvp-lookup">
                      <div className="rsvp-lookup-icon">✉</div>
                      <p className="rsvp-lookup-text">Please enter your name to find your invitation</p>
                      <div className="rsvp-name-search">
                        <input 
                          type="text" 
                          className="rsvp-input" 
                          placeholder="Your full name" 
                          value={rsvpNameSearch}
                          onChange={(e) => setRsvpNameSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRsvpSearch()}
                        />
                        <button className="rsvp-search-btn" onClick={handleRsvpSearch}>
                          <Search size={16} /> Find My Invitation
                        </button>
                      </div>
                      {rsvpSearchError && <p className="rsvp-lookup-error">{rsvpSearchError}</p>}
                    </div>
                  ) : rsvpSubmitted ? (
                    <div className="rsvp-confirmation">
                      <div className="rsvp-confirm-icon">{rsvpSubmitted.status === 'confirmed' ? '💌' : '🌸'}</div>
                      <h3 className="rsvp-confirm-title">{rsvpSubmitted.status === 'confirmed' ? "We Can't Wait to See You!" : "We'll Miss You!"}</h3>
                      <button className="rsvp-update-btn" onClick={() => setRsvpSubmitted(null)}>Update Response</button>
                    </div>
                  ) : (
                    <form className="rsvp-form" onSubmit={submitRsvp}>
                      <div className="rsvp-form-header">
                        <h3 className="rsvp-form-name">{rsvpGuest.name}</h3>
                        <p className="rsvp-form-subtext">Please let us know if you can make it</p>
                      </div>
                      <div className="rsvp-field-group">
                        <label className="rsvp-field-label">Will you be attending?</label>
                        <div className="rsvp-attending-btns">
                          <button type="button" className={`rsvp-attend-btn attend-yes ${attendingVal === 'yes' ? 'selected' : ''}`} onClick={() => setAttendingVal('yes')}>
                            <Heart size={24} /> Joyfully Accept
                          </button>
                          <button type="button" className={`rsvp-attend-btn attend-no ${attendingVal === 'no' ? 'selected' : ''}`} onClick={() => setAttendingVal('no')}>
                            <HeartOff size={24} /> Regretfully Decline
                          </button>
                        </div>
                      </div>
                      {attendingVal === 'yes' && (
                        <div className="rsvp-conditional">
                           <div className="rsvp-field-group">
                             <label className="rsvp-field-label">Number of guests attending</label>
                             <select className="rsvp-select" value={rsvpForm.count} onChange={e => setRsvpForm({...rsvpForm, count: parseInt(e.target.value)})}>
                               {Array.from({ length: rsvpGuest.maxMembers || 1 }, (_, i) => i + 1).map(n => (
                                 <option key={n} value={n}>{n} guest{n>1?'s':''}</option>
                               ))}
                             </select>
                           </div>
                           <div className="rsvp-field-group">
                             <label className="rsvp-field-label">Meal Preference</label>
                             <div className="rsvp-radio-group">
                               {['veg', 'non-veg', 'any'].map(v => (
                                 <label key={v} className="rsvp-radio-label">
                                   <input type="radio" className="rsvp-radio" name="meal" checked={rsvpForm.meal === v} onChange={() => setRsvpForm({...rsvpForm, meal: v})} />
                                   <span className="rsvp-radio-custom"></span> <span>{v}</span>
                                 </label>
                               ))}
                             </div>
                           </div>
                        </div>
                      )}
                      <div className="rsvp-field-group">
                        <label className="rsvp-field-label">Any notes? <span className="rsvp-optional">(optional)</span></label>
                        <textarea className="rsvp-textarea" rows={3} value={rsvpForm.notes} onChange={e => setRsvpForm({...rsvpForm, notes: e.target.value})} />
                      </div>
                      {rsvpSearchError && <p className="rsvp-field-error">{rsvpSearchError}</p>}
                      <button type="submit" className="rsvp-submit-btn"><Send size={18} /> Send RSVP</button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          )}

          <footer className="site-footer">
            <div className="footer-top">
              <div className="footer-ornament">◆</div>
              <h2 className="footer-couple">{wedding.brideName} & {wedding.groomName}</h2>
              <p className="footer-date">{formatDate(wedding.date)}</p>
            </div>
            <p className="footer-powered">Powered by <strong>WedPlan</strong></p>
          </footer>
          
          {wedding.music?.enabled !== false && (
            <button className="music-toggle" onClick={toggleMusic} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--theme-secondary) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-secondary) 34%, transparent)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-secondary)', cursor: 'pointer' }}>
              {musicPlaying ? <Music size={20} /> : <VolumeX size={20} />}
            </button>
          )}
        </main>
    </div>
  )
}
