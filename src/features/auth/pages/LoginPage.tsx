import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import { useAuth } from '../context/useAuth'

type LoginPageProps = {
  mode: 'login' | 'missing-config'
}

export function LoginPage({ mode }: LoginPageProps) {
  const { signIn, signUp, error } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  })

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
    }

    if (!payload.email || !payload.password) {
      setMessage({ type: 'error', text: 'Ingresa correo y contraseña.' })
      return
    }

    if (isRegistering && !payload.name) {
      setMessage({ type: 'error', text: 'Ingresa el nombre del usuario.' })
      return
    }

    try {
      setIsSaving(true)

      if (isRegistering) {
        await signUp(payload)
        setMessage({
          type: 'success',
          text: 'Usuario creado. Si Supabase exige confirmación por correo, revisa el email antes de iniciar sesión.',
        })
      } else {
        await signIn(payload.email, payload.password)
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo completar el acceso. Revisa credenciales, confirmación de correo o políticas de Supabase.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <img src="/brand/semevet-logo.png" alt="Logo SEMEVET" />
          <strong>SEMEVET</strong>
        </div>
        <span>ACCESO CLÍNICO</span>

        {mode === 'missing-config' ? (
          <FormMessage type="error">
            Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
          </FormMessage>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <label>
                  <span className="field-label">Nombre <span className="required-mark">*</span></span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Nombre del usuario"
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+56 9..."
                  />
                </label>
              </>
            )}

            <label>
              <span className="field-label">Correo <span className="required-mark">*</span></span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="usuario@semevet.cl"
              />
            </label>
            <label>
              <span className="field-label">Contraseña <span className="required-mark">*</span></span>
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </label>

            {(message || error) && (
              <FormMessage type={message?.type ?? 'error'}>
                {message?.text ?? error ?? 'No se pudo completar el acceso.'}
              </FormMessage>
            )}

            <button type="submit" disabled={isSaving}>
              {isSaving
                ? 'Procesando...'
                : isRegistering
                  ? 'Crear usuario'
                  : 'Iniciar sesión'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setIsRegistering((current) => !current)
                setMessage(null)
              }}
            >
              {isRegistering ? 'Ya tengo usuario' : 'Crear nuevo usuario'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
