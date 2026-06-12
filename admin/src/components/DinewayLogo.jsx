export default function DinewayLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam lines */}
      <path d="M45 18 Q43 12 45 6" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60 15 Q58 9 60 3" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M75 18 Q73 12 75 6" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
      {/* Dome */}
      <path d="M20 65 Q20 35 60 35 Q100 35 100 65" stroke="#C9A84C" strokeWidth="2.5" fill="none"/>
      {/* Plate base */}
      <line x1="14" y1="65" x2="106" y2="65" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M25 65 Q25 72 60 72 Q95 72 95 65" stroke="#C9A84C" strokeWidth="2" fill="none"/>
    </svg>
  );
}
