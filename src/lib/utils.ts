import { nanoid } from 'nanoid'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generarLinkReferido(nombre: string): string {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 15)
  return `${slug}-${nanoid(5)}`
}

export function formatCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

export function whatsappLink(telefono: string, mensaje: string): string {
  const numero = telefono.replace(/\D/g, '')
  const tel = numero.startsWith('57') ? numero : `57${numero}`
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
}