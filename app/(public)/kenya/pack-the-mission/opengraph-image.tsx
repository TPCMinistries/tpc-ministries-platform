import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Pack the Mission — Kenya 2026 Supply Drive'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #080C1C 0%, #0F172A 40%, #1E293B 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-50px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 80px',
            position: 'relative',
          }}
        >
          {/* Top badges */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <div
              style={{
                background: '#D4AF37',
                color: '#080C1C',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                padding: '8px 20px',
                borderRadius: '50px',
              }}
            >
              Kenya 2026
            </div>
            <div
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#FCA5A5',
                fontSize: '14px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              Items due by April 15
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              textAlign: 'center' as const,
              marginBottom: '8px',
              display: 'flex',
              gap: '18px',
            }}
          >
            <span>Pack</span>
            <span style={{ color: '#EBD278', fontStyle: 'italic' }}>the</span>
            <span>Mission</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center' as const,
              marginBottom: '40px',
              maxWidth: '700px',
            }}
          >
            Help us fill the suitcases with supplies for communities across 3 cities in Kenya
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '48px', marginBottom: '40px' }}>
            {[
              { num: '33', label: 'Items' },
              { num: '5', label: 'Categories' },
              { num: '3', label: 'Cities' },
              { num: '14', label: 'Days' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#D4AF37' }}>{stat.num}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA bar */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                background: '#D4AF37',
                color: '#080C1C',
                padding: '12px 28px',
                borderRadius: '50px',
              }}
            >
              Pledge Items
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '50px',
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}
            >
              Give Funds
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '50px',
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}
            >
              Sponsor a Life
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 80px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
              TPC Ministries
            </div>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>
            tpcmin.org/kenya/pack-the-mission
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
