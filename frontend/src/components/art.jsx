import { useEffect } from 'react'

// Hình minh họa vẽ bằng SVG: linh vật "Tiêu" (bia mục tiêu có khuôn mặt), cảnh leo núi OKR, quà tặng, huy hiệu.

const C = {
  teal: '#0f5c57', tealMid: '#2a8f87', tealSoft: '#bfe3de', mint: '#e3f4f1',
  sun: '#f7b538', sunSoft: '#fde9b8', coral: '#f2705a', coralSoft: '#fbd5cd',
  sky: '#4ea8de', skySoft: '#d4eafa', lilac: '#8e7dbe', lilacSoft: '#e4def2', ink: '#12201e',
}
export const palette = C

/** Linh vật Tiêu. mood: happy | cheer | think | sleep */
export function Mascot({ size = 120, mood = 'happy' }) {
  const eyes = mood === 'sleep'
    ? <>
        <path d="M44 62q6 5 12 0" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M64 62q6 5 12 0" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </>
    : mood === 'cheer'
      ? <>
          <path d="M43 64q6-9 12 0" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M65 64q6-9 12 0" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </>
      : <>
          <circle cx="50" cy="61" r="4.5" fill={C.ink} />
          <circle cx="70" cy="61" r="4.5" fill={C.ink} />
          <circle cx="51.6" cy="59.4" r="1.4" fill="#fff" />
          <circle cx="71.6" cy="59.4" r="1.4" fill="#fff" />
        </>
  const mouth = mood === 'think'
    ? <path d="M54 78h12" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
    : mood === 'cheer'
      ? <path d="M50 74q10 14 20 0z" fill={C.ink} />
      : <path d="M52 75q8 9 16 0" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Linh vật Tiêu" style={{ flex: 'none' }}>
      <ellipse cx="60" cy="110" rx="30" ry="5" fill="rgba(18,32,30,.10)" />
      <circle cx="60" cy="64" r="46" fill={C.teal} />
      <circle cx="60" cy="64" r="36" fill="#fff" />
      <circle cx="60" cy="64" r="26" fill={C.coral} />
      <circle cx="60" cy="64" r="16" fill="#fff" />
      <circle cx="60" cy="64" r="22" fill={C.sunSoft} opacity="0" />
      {/* mặt nằm trên vòng trắng giữa */}
      <circle cx="60" cy="68" r="19" fill={C.sunSoft} />
      {eyes}
      {mouth}
      <circle cx="42" cy="73" r="4" fill={C.coral} opacity=".35" />
      <circle cx="78" cy="73" r="4" fill={C.coral} opacity=".35" />
      {/* mũi tên cắm trên đầu */}
      <path d="M86 14L66 36" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M86 14l-9 1m9-1l-1 9" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M72 30l7 7" stroke={C.sun} strokeWidth="3.4" strokeLinecap="round" />
      {mood === 'sleep' && <text x="88" y="42" fontSize="14" fontWeight="700" fill={C.tealMid} fontFamily="Bricolage Grotesque, sans-serif">z z</text>}
    </svg>
  )
}

/** Cảnh leo núi: năm cột mốc của vòng OKR tuần dẫn tới lá cờ mục tiêu. */
export function ClimbScene({ step = 1, style }) {
  const pts = [[52, 176], [128, 150], [205, 126], [280, 98], [352, 66]]
  return (
    <svg viewBox="0 0 420 220" style={{ width: '100%', height: 'auto', display: 'block', ...style }} role="img" aria-label="Hành trình leo núi qua năm bước của một tuần OKR">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdeec6" />
          <stop offset="1" stopColor="#e3f4f1" />
        </linearGradient>
      </defs>
      <rect width="420" height="220" rx="18" fill="url(#sky)" />
      <circle cx="338" cy="44" r="22" fill={C.sun} />
      <circle cx="338" cy="44" r="32" fill={C.sun} opacity=".22" />
      <g fill="#fff" opacity=".9">
        <ellipse cx="70" cy="44" rx="26" ry="9" /><ellipse cx="90" cy="38" rx="18" ry="9" />
        <ellipse cx="210" cy="30" rx="22" ry="7" /><ellipse cx="226" cy="25" rx="14" ry="7" />
      </g>
      <path d="M0 190L90 110L150 160L240 70L330 150L380 112L420 140V220H0z" fill={C.tealSoft} />
      <path d="M0 205L110 132L180 182L270 104L360 176L420 150V220H0z" fill={C.tealMid} opacity=".55" />
      <path d="M0 220V196Q80 170 150 190T300 184T420 176V220z" fill={C.teal} />
      {/* đường mòn */}
      <path d={`M${pts.map((p) => p.join(' ')).join(' L')}`} stroke="#fff" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="13" fill={i < step ? C.teal : '#fff'} stroke={i === step ? C.sun : i < step ? C.teal : C.tealSoft} strokeWidth="4" />
          <text x={x} y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={i < step ? '#fff' : C.teal} fontFamily="Be Vietnam Pro, sans-serif">{i < step ? '✓' : i + 1}</text>
        </g>
      ))}
      {/* cờ đích */}
      <path d="M352 52V12" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M352 12l32 9-32 9z" fill={C.coral} />
      <g transform={`translate(${pts[Math.min(step, 4)][0] - 26}, ${pts[Math.min(step, 4)][1] - 74})`}>
        <Mascot size={52} mood="cheer" />
      </g>
    </svg>
  )
}

/** Hình quà tặng theo tên. */
export function GiftArt({ name, tone = 0 }) {
  const bg = [C.mint, C.skySoft, C.lilacSoft, C.sunSoft, C.coralSoft, C.mint][tone % 6]
  const n = name.toLowerCase()
  let body
  if (n.includes('cà phê')) {
    body = <>
      <path d="M38 40h44v30a18 18 0 0 1-18 18h-8a18 18 0 0 1-18-18z" fill="#fff" stroke={C.ink} strokeWidth="3" />
      <path d="M82 48h8a9 9 0 0 1 0 18h-8" fill="none" stroke={C.ink} strokeWidth="3" />
      <path d="M38 52h44" stroke={C.coral} strokeWidth="6" />
      <path d="M50 30q-5-7 0-13M62 30q-5-7 0-13M74 30q-5-7 0-13" stroke={C.tealMid} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  } else if (n.includes('bình')) {
    body = <>
      <rect x="44" y="22" width="32" height="12" rx="4" fill={C.ink} />
      <rect x="38" y="34" width="44" height="58" rx="12" fill={C.teal} stroke={C.ink} strokeWidth="3" />
      <rect x="38" y="52" width="44" height="12" fill="#fff" opacity=".85" />
      <circle cx="60" cy="58" r="4" fill={C.coral} />
    </>
  } else if (n.includes('nghỉ')) {
    body = <>
      <circle cx="60" cy="58" r="30" fill="#fff" stroke={C.ink} strokeWidth="3" />
      <path d="M60 58V38M60 58l14 8" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M30 58a30 30 0 0 1 30-30v30z" fill={C.sun} opacity=".6" />
      <path d="M88 26l6-6M32 24l-6-6" stroke={C.coral} strokeWidth="3" strokeLinecap="round" />
    </>
  } else if (n.includes('sách')) {
    body = <>
      <path d="M26 34q18-8 34 2v50q-16-10-34-2z" fill="#fff" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M94 34q-18-8-34 2v50q16-10 34-2z" fill={C.sunSoft} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 46q10-3 18 1M34 58q10-3 18 1M68 47q8-4 18-1M68 59q8-4 18-1" stroke={C.tealMid} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </>
  } else if (n.includes('tai nghe')) {
    body = <>
      <path d="M30 66V56a30 30 0 0 1 60 0v10" fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <rect x="24" y="60" width="16" height="28" rx="8" fill={C.coral} stroke={C.ink} strokeWidth="3" />
      <rect x="80" y="60" width="16" height="28" rx="8" fill={C.coral} stroke={C.ink} strokeWidth="3" />
    </>
  } else {
    body = <>
      <circle cx="60" cy="58" r="32" fill="#fff" stroke={C.ink} strokeWidth="3" />
      <circle cx="60" cy="58" r="20" fill="none" stroke={C.tealSoft} strokeWidth="3" />
      <path d="M46 28v18M46 28q-4 8 0 18M74 28v38q-6-6-6-20 0-12 6-18" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  }
  return (
    <svg viewBox="0 0 120 112" className="gift-svg" style={{ background: bg }} role="img" aria-label={name}>
      <circle cx="18" cy="20" r="3" fill="#fff" opacity=".8" /><circle cx="104" cy="30" r="4" fill="#fff" opacity=".8" /><circle cx="98" cy="96" r="3" fill="#fff" opacity=".8" />
      {body}
    </svg>
  )
}

/** Huy hiệu ghi nhận: ngôi sao trong vòng nguyệt quế. */
export function Medal({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M20 4h10l4 20-12 4z" fill={C.coral} />
      <path d="M44 4H34l-4 20 12 4z" fill={C.sky} />
      <circle cx="32" cy="40" r="19" fill={C.sun} stroke={C.ink} strokeWidth="2.6" />
      <circle cx="32" cy="40" r="13" fill={C.sunSoft} />
      <path d="M32 31l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L32 45.4l-5.7 3.1 1.1-6.3-4.6-4.5 6.4-.9z" fill={C.coral} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/** Hình minh họa cho trạng thái trống: linh vật + vật dụng theo ngữ cảnh. */
export function EmptyArt({ kind = 'default' }) {
  const mood = kind === 'done' ? 'cheer' : kind === 'search' ? 'think' : 'happy'
  return (
    <svg viewBox="0 0 200 130" style={{ width: 200, height: 130 }} aria-hidden="true">
      <ellipse cx="100" cy="120" rx="80" ry="7" fill={C.mint} />
      <rect x="22" y="58" width="44" height="52" rx="6" fill="#fff" stroke={C.ink} strokeWidth="2.6" transform="rotate(-8 44 84)" />
      <path d="M30 76h28M30 86h22M30 96h26" stroke={C.tealSoft} strokeWidth="3.4" strokeLinecap="round" transform="rotate(-8 44 84)" />
      <g transform="translate(64 6)"><Mascot size={104} mood={mood} /></g>
      <path d="M160 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill={C.sun} />
      <circle cx="172" cy="96" r="5" fill={C.coral} opacity=".7" />
      <circle cx="30" cy="30" r="4" fill={C.sky} opacity=".8" />
    </svg>
  )
}

/** Hình minh họa nhỏ cho bìa trang. */
export function PageArt({ kind }) {
  const common = { width: 140, height: 96, viewBox: '0 0 140 96', 'aria-hidden': true }
  if (kind === 'store') return (
    <svg {...common}>
      <rect x="16" y="44" width="60" height="42" rx="6" fill={C.coral} stroke={C.ink} strokeWidth="2.6" />
      <rect x="10" y="32" width="72" height="16" rx="5" fill={C.coralSoft} stroke={C.ink} strokeWidth="2.6" />
      <path d="M46 32v54" stroke="#fff" strokeWidth="6" />
      <path d="M46 32q-16-18-24-8t24 8q16-18 24-8t-24 8z" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="104" cy="44" r="22" fill={C.sun} stroke={C.ink} strokeWidth="2.6" />
      <text x="104" y="52" textAnchor="middle" fontSize="22" fontWeight="700" fill={C.ink} fontFamily="Bricolage Grotesque, sans-serif">★</text>
    </svg>
  )
  if (kind === 'cfr') return (
    <svg {...common}>
      <path d="M12 14h66a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H40l-14 12V56H12a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z" fill={C.skySoft} stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M62 52h50a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H100v10L88 86H62a8 8 0 0 1-8-8V60a8 8 0 0 1 8-8z" fill={C.coralSoft} stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" transform="translate(8 -6)" />
      <circle cx="24" cy="35" r="3" fill={C.ink} /><circle cx="40" cy="35" r="3" fill={C.ink} /><circle cx="56" cy="35" r="3" fill={C.ink} />
      <path d="M118 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={C.sun} />
    </svg>
  )
  if (kind === 'chart') return (
    <svg {...common}>
      <rect x="14" y="52" width="20" height="36" rx="4" fill={C.tealMid} stroke={C.ink} strokeWidth="2.6" />
      <rect x="44" y="32" width="20" height="56" rx="4" fill={C.sun} stroke={C.ink} strokeWidth="2.6" />
      <rect x="74" y="44" width="20" height="44" rx="4" fill={C.coral} stroke={C.ink} strokeWidth="2.6" />
      <rect x="104" y="14" width="20" height="74" rx="4" fill={C.lilac} stroke={C.ink} strokeWidth="2.6" />
    </svg>
  )
  return null
}

/** Pháo giấy khi đổi quà hoặc nhận điểm. */
export function Confetti({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  const colors = [C.coral, C.sun, C.sky, C.lilac, C.tealMid]
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <i key={i} style={{
          left: `${8 + ((i * 53) % 84)}%`, background: colors[i % colors.length], width: 7 + (i % 3) * 3, height: (7 + (i % 3) * 3) * 1.6,
          animationDelay: `${(i % 9) * 0.05}s`, animationDuration: `${1.4 + ((i * 7) % 10) / 10}s`, rotate: `${(i * 47) % 360}deg`,
        }} />
      ))}
    </div>
  )
}

/** Phông nền toàn khung cho trang đăng nhập: bình minh trên dãy núi, con đường dẫn tới lá cờ. */
export function LoginBackdrop() {
  const stars = [[90, 70], [210, 130], [330, 50], [470, 110], [610, 60], [760, 140], [880, 80], [140, 210], [520, 190], [700, 230]]
  return (
    <svg className="login-backdrop" viewBox="0 0 900 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="lb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a2a28" />
          <stop offset=".45" stopColor="#0f5c57" />
          <stop offset=".78" stopColor="#4aa398" />
          <stop offset="1" stopColor="#f7d99a" />
        </linearGradient>
        <radialGradient id="lb-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff4c9" stopOpacity="1" />
          <stop offset=".35" stopColor="#f7b538" stopOpacity=".9" />
          <stop offset="1" stopColor="#f7b538" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="900" fill="url(#lb-sky)" />
      {stars.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.5} fill="#fff" opacity={0.55 - (i % 4) * 0.08} />)}
      <g fill="#fff" opacity=".22">
        <ellipse cx="190" cy="520" rx="110" ry="20" /><ellipse cx="250" cy="500" rx="70" ry="18" />
        <ellipse cx="760" cy="430" rx="100" ry="16" /><ellipse cx="820" cy="414" rx="56" ry="14" />
      </g>
      <path d="M0 700L140 560L240 650L400 470L520 620L650 520L780 640L900 560V900H0z" fill="#2a8f87" opacity=".55" />
      <path d="M0 760L120 650L260 740L430 580L580 730L720 640L900 740V900H0z" fill="#1d7a72" opacity=".85" />
      <circle cx="660" cy="610" r="230" fill="url(#lb-sun)" />
      <circle cx="660" cy="610" r="62" fill="#fde9b8" />
      <path d="M0 830Q150 770 300 810T620 800T900 780V900H0z" fill="#0f5c57" />
      <path d="M0 880Q200 830 420 860T900 840V900H0z" fill="#0a403c" />
      {/* đường mòn và cột mốc */}
      <path d="M120 880Q260 820 340 800T560 740T700 668" stroke="#fde9b8" strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" fill="none" />
      {[[210, 846], [340, 800], [470, 762], [590, 725]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="15" fill="#fff" stroke="#f7b538" strokeWidth="4" /><text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f5c57" fontFamily="Be Vietnam Pro, sans-serif">{i + 1}</text></g>
      ))}
      <path d="M700 668V588" stroke="#12201e" strokeWidth="4" strokeLinecap="round" />
      <path d="M700 588l44 13-44 13z" fill="#f2705a" />
      <g transform="translate(112 770)"><Mascot size={92} mood="cheer" /></g>
    </svg>
  )
}
