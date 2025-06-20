
interface CheersIconProps {
  className?: string;
  filled?: boolean;
}

export const CheersIcon = ({ className, filled = false }: CheersIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Copa izquierda */}
    <path 
      d="M4 12c0-2 1-4 3-4h2c2 0 3 2 3 4v3c0 1.5-1 2.5-2.5 2.5h-1c-1.5 0-2.5-1-2.5-2.5v-3z" 
      fill={filled ? "currentColor" : "none"}
    />
    {/* Tallo copa izquierda */}
    <path d="M7.5 17.5v2" />
    {/* Base copa izquierda */}
    <path d="M6 21.5h3" />
    
    {/* Copa derecha */}
    <path 
      d="M14 10c0-2 1-4 3-4h2c2 0 3 2 3 4v3c0 1.5-1 2.5-2.5 2.5h-1c-1.5 0-2.5-1-2.5-2.5v-3z" 
      fill={filled ? "currentColor" : "none"}
    />
    {/* Tallo copa derecha */}
    <path d="M17.5 15.5v2" />
    {/* Base copa derecha */}
    <path d="M16 19.5h3" />
    
    {/* Burbujas/chispas del brindis */}
    <circle cx="10" cy="6" r="0.5" fill="currentColor" />
    <circle cx="12" cy="4" r="0.5" fill="currentColor" />
    <circle cx="14" cy="5" r="0.5" fill="currentColor" />
    <circle cx="11" cy="2" r="0.5" fill="currentColor" />
    <circle cx="13" cy="2.5" r="0.5" fill="currentColor" />
  </svg>
);
