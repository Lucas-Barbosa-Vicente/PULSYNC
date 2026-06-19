'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const result = await signInWithEmail(data.email, data.password)
    if (result.error) {
      setError('root', { message: result.error })
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tight">PULSYNC</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Sincronize sua saúde. Viva mais, juntos.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-12 bg-surface border border-border rounded-xl px-4 pr-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-error text-center">{errors.root.message}</p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <button
          onClick={() => setShowForgot(true)}
          className="mt-4 w-full text-center text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Esqueci minha senha
        </button>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-text-primary mb-1">Recuperar senha</h2>
            <p className="text-sm text-text-secondary mb-4">
              Enviaremos um link para o seu email.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-12 bg-bg border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors mb-4"
            />
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowForgot(false)}>
                Cancelar
              </Button>
              <Button fullWidth onClick={() => setShowForgot(false)}>
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
