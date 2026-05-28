export default function Loading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, #fff8f4 0%, #f7e4db 100%)',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        style={{
          width: 'min(100%, 420px)',
          borderRadius: 28,
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(153, 90, 109, 0.16)',
          boxShadow: '0 22px 60px rgba(122, 71, 88, 0.12)',
          padding: 32,
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            width: 116,
            height: 82,
            margin: '0 auto',
            position: 'relative',
            borderRadius: 12,
            background: '#fff',
            border: '2px solid #d6a6b3',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, transparent 49%, #d6a6b3 50%, transparent 51%), linear-gradient(225deg, transparent 49%, #d6a6b3 50%, transparent 51%)',
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -18,
              width: 106,
              height: 32,
              transform: 'translateX(-50%)',
              borderRadius: '50%',
              background: 'rgba(198, 90, 116, 0.14)',
              filter: 'blur(4px)',
            }}
          />
        </div>
        <div style={{ marginTop: 22, fontSize: 30, color: '#6d2f42' }}>Loading invitation</div>
        <p style={{ margin: '10px 0 0', color: '#7b5c66', lineHeight: 1.6 }}>
          Preparing the envelope, hero image, and wedding details.
        </p>
        <div
          aria-hidden="true"
          style={{
            margin: '22px auto 0',
            width: 140,
            height: 5,
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(198,90,116,0.1), rgba(198,90,116,0.8), rgba(198,90,116,0.1))',
            animation: 'invitation-progress 1.5s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes invitation-progress {
          0% { transform: scaleX(0.55); opacity: 0.45; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0.55); opacity: 0.45; }
        }
      `}</style>
    </main>
  );
}