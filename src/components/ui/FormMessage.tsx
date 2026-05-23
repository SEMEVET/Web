type FormMessageProps = {
  type: 'success' | 'error'
  children: string
}

export function FormMessage({ type, children }: FormMessageProps) {
  return (
    <p className={`form-message ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
