export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    gold: 'btn-gold',
    danger: 'btn-danger',
  };
  return (
    <button className={`${base[variant] || base.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
