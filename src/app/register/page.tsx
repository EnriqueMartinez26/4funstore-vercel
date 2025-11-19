"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    setIsSubmitting(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) { router.push('/'); router.refresh(); }
      else { setError(result.message || 'Error al registrar'); }
    } catch (err: any) { setError(err.message || 'Error al registrar'); }
    finally { setIsSubmitting(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <input id="name" name="name" type="text" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nombre completo" value={formData.name} onChange={handleChange} />
            <input id="email" name="email" type="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input id="password" name="password" type="password" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
            <input id="confirmPassword" name="confirmPassword" type="password" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={handleChange} />
          </div>
          <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">{isSubmitting ? "Creando..." : "Registrarse"}</button>
        </form>
      </div>
    </div>
  );
}
