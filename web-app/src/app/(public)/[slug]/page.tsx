import { db, getAgendaEventsByWedding } from '@/lib/store'
import InvitationClient from './InvitationClient'
import './invitation.css'

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wedding = db.weddings.findUnique(w => w.slug === slug)
  
  if (!wedding) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Wedding not found</div>
  }

  const guests = db.guests.findMany(g => g.weddingId === wedding.id)
  const agenda = getAgendaEventsByWedding(wedding.id)
  const rsvps = db.rsvps.findMany(r => r.weddingId === wedding.id)

  return (
    <InvitationClient 
      wedding={wedding} 
      guests={guests} 
      agenda={agenda} 
      rsvps={rsvps}
    />
  )
}
