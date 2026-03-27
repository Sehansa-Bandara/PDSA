import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/',          label: 'Dashboard'     },
  { to: '/products',  label: 'Products'      },
  { to: '/alerts',    label: 'Expiry Alerts' },
  { to: '/discounts', label: 'Discounts'     },
];

export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 99,
      width: '260px',
      height: '100vh',
      background: 'rgba(6,10,20,0.85)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderRight: '1px solid rgba(99,102,241,0.18)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
    }}>
      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0.5rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
        }}>🛒</div>
        <span style={{
          fontWeight: 900, fontSize: '1.25rem',
          background: 'linear-gradient(135deg,#818cf8,#c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>SmartDis</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            id={`nav-${link.to.replace('/', '') || 'dashboard'}`}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* ── Footer / Status ── */}
      <div style={{ 
        padding: '1rem', 
        borderRadius: 14, 
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.12)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pulse-dot" style={{ background: '#22c55e', width: 6, height: 6 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600 }}>System Live</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>v1.0.4 Online</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
