import React from 'react'

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-2 rounded-lg font-semibold transition-all duration-200'
  const variants = {
    primary: 'bg-gradient-to-r from-gradient-1 to-gradient-2 text-white hover:opacity-90',
    secondary: 'border-2 border-gradient-2 text-gradient-2 hover:bg-gradient-2 hover:text-white',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
