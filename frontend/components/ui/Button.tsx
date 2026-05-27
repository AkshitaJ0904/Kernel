import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost'
  size?: 'default' | 'lg'
}

export default function Button({ variant = 'default', size, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-ghost',
        size === 'lg' && 'text-[14px] px-[18px] py-[12px]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
