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

const schema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter pelo menos um número'),
    confirmPassword: z.string(),
    terms: z.literal(true).refine((v) => v === true, { message: 'Aceite os termos para continuar' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const result = await signUp(data.email, data.password, data.name)
    if (result.error) {
      setError('root', { message: result.error })
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-tight">PULSYNC</h1>
          <p className="mt-2 text-text-secondary text-sm">Crie sua conta gratuita</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Nome completo</label>
            <input
              {...register('name')}
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
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

          <div>
            <label className="block text-sm text-text-secondary mb-1">Confirmar senha</label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita a senha"
                className="w-full h-12 bg-surface border border-border rounded-xl px-4 pr-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              {...register('terms')}
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[var(--primary)] shrink-0"
            />
            <span className="text-sm text-text-secondary leading-relaxed">
              Aceito os{' '}
              <a href="#" className="text-primary hover:underline">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </span>
          </label>
          {errors.terms && <p className="text-sm text-error">{errors.terms.message}</p>}

          {errors.root && (
            <p className="text-sm text-error text-center">{errors.root.message}</p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Criar Conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
