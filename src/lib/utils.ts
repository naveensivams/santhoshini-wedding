import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format, isAfter, isBefore, parseISO } from 'date-fns'
import type { BookingUrgency, TaskPriority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export function getCountdown(targetDate: Date) {
  const now = new Date()
  const days = Math.max(0, differenceInDays(targetDate, now))
  const hours = Math.max(0, differenceInHours(targetDate, now) % 24)
  const minutes = Math.max(0, differenceInMinutes(targetDate, now) % 60)
  const seconds = Math.max(0, differenceInSeconds(targetDate, now) % 60)
  return { days, hours, minutes, seconds }
}

export function getPlanningProgress(weddingDate: Date, planningStartDate: Date): number {
  const now = new Date()
  const totalDays = differenceInDays(weddingDate, planningStartDate)
  const elapsed = differenceInDays(now, planningStartDate)
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)))
}

export function getDaysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date())
}

export function getBookingUrgency(category: string, daysUntilWedding: number): BookingUrgency {
  const leadTimes: Record<string, number> = {
    'Venue': 270,
    'Food Catering': 270,
    'Catering': 270,
    'Photographer': 180,
    'Videographer': 180,
    'Decorator': 120,
    'Decoration': 120,
    'Makeup Artist': 90,
    'Wedding Clothes': 90,
    'Tailor': 90,
    'Jeweler': 90,
    'Mehendi Artist': 60,
    'DJ / Sound': 60,
    'DJ': 60,
    'Lighting': 60,
    'Transportation': 45,
    'Flowers': 30,
    'Invitation Cards': 45,
    'Accommodation': 90,
    'Others': 30,
  }

  const leadTime = leadTimes[category] || 60
  const ratio = daysUntilWedding / leadTime

  if (daysUntilWedding < 0) return 'Overdue'
  if (daysUntilWedding > leadTime) return 'On Track'
  if (ratio <= 0.3) return 'Critical'
  if (ratio <= 0.6) return 'Urgent'
  return 'Upcoming'
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
    case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'Low': return 'bg-green-100 text-green-700 border-green-200'
  }
}

export function getUrgencyColor(urgency: BookingUrgency): string {
  switch (urgency) {
    case 'Critical': return 'bg-red-50 border-red-300 text-red-700'
    case 'Overdue': return 'bg-red-50 border-red-400 text-red-800'
    case 'Urgent': return 'bg-orange-50 border-orange-300 text-orange-700'
    case 'Upcoming': return 'bg-yellow-50 border-yellow-300 text-yellow-700'
    case 'On Track': return 'bg-green-50 border-green-300 text-green-700'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-700'
    case 'In Progress': return 'bg-blue-100 text-blue-700'
    case 'Waiting': return 'bg-yellow-100 text-yellow-700'
    case 'Blocked': return 'bg-red-100 text-red-700'
    case 'Cancelled': return 'bg-gray-100 text-gray-500'
    case 'Confirmed': return 'bg-green-100 text-green-700'
    case 'Booked': return 'bg-blue-100 text-blue-700'
    case 'Negotiating': return 'bg-yellow-100 text-yellow-700'
    case 'Enquired': return 'bg-purple-100 text-purple-700'
    case 'Not Booked': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isOverdue(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date())
}

export function isDueSoon(dateStr: string, days: number = 7): boolean {
  const date = parseISO(dateStr)
  const now = new Date()
  const soon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return isAfter(date, now) && isBefore(date, soon)
}
