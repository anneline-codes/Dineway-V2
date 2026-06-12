export default function DinewayLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="#0f0e0a" stroke="#C9A84C" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="31" stroke="#C9A84C" strokeWidth="0.6" strokeDasharray="2.5 2" fill="none"/>
      <path d="M22 50 L22 44 L28 38 L34 46 L40 34 L46 46 L52 38 L58 44 L58 50 Z"
        fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="22" y="50" width="36" height="4" rx="1" fill="#C9A84C"/>
      <circle cx="31" cy="42" r="2" fill="#C9A84C"/>
      <circle cx="40" cy="37" r="2.2" fill="#C9A84C"/>
      <circle cx="49" cy="42" r="2" fill="#C9A84C"/>
      <path d="M28 58 L40 61 L52 58" stroke="#C9A84C" strokeWidth="0.8" fill="none"/>
    </svg>
  );
}
