import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-odyssey-accent text-odyssey-bg hover:bg-odyssey-accent-dim active:scale-[0.97]',
  ghost:
    'bg-transparent text-odyssey-text hover:bg-odyssey-elevated active:scale-[0.97]',
  danger:
    'bg-odyssey-danger/10 text-odyssey-danger hover:bg-odyssey-danger/20 active:scale-[0.97]',
  outline:
    'border border-odyssey-border text-odyssey-text hover:border-odyssey-accent/50 hover:text-odyssey-accent active:scale-[0.97]',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
        text-sm font-medium transition-colors duration-200
        disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
