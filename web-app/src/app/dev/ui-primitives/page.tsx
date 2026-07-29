import { notFound } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function UIPrimitivesPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>UI Primitives Preview</h1>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Form controls</h2>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
          <Input label="Full name" placeholder="e.g. Priya Perera" />
          <Input label="Email address" placeholder="hello@example.com" />
          <Input label="Phone" placeholder="+94 7xxxxxxx" />
          <Input label="With error" placeholder="fix this" error="Invalid phone number" />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Dark surface preview</h2>
        <div className="surface-dark" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <Input label="Guest name" placeholder="Guest" />
        </div>
      </section>
    </main>
  )
}
