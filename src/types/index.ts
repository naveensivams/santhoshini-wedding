export type Role = 'admin' | 'member' | 'volunteer'

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting' | 'Blocked' | 'Completed' | 'Cancelled'

export type BookingStatus = 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed' | 'Cancelled'
export type BookingUrgency = 'Critical' | 'Urgent' | 'Upcoming' | 'On Track' | 'Overdue'

export type RSVPStatus = 'Pending' | 'Confirmed' | 'Declined'
export type GuestSide = 'Bride' | 'Groom' | 'Both'

export type BudgetType = 'Budget' | 'Expense' | 'Advance' | 'Payment'
export type ShoppingStatus = 'Pending' | 'Purchased'

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface WeddingEvent {
  id: string
  name: string
  slug: string
  date: string
  time?: string
  venue?: string
  color: string
  gradient: string
  icon: string
  budget?: number
  created_at: string
}

export interface Task {
  id: string
  event_id: string
  title: string
  description?: string
  category?: string
  assigned_to?: string
  assignee?: Profile
  priority: TaskPriority
  due_date?: string
  status: TaskStatus
  completion_percent: number
  created_at: string
}

export interface Booking {
  id: string
  event_id?: string
  event_name?: string
  vendor_name?: string
  category: string
  status: BookingStatus
  booking_date?: string
  contract_signed: boolean
  advance_paid: number
  balance_due: number
  final_payment_due?: string
  contact_name?: string
  contact_phone?: string
  trial_scheduled: boolean
  trial_date?: string
  notes?: string
  created_at: string
}

export interface BudgetEntry {
  id: string
  event_id?: string
  event_name?: string
  description: string
  category?: string
  amount: number
  type: BudgetType
  date: string
  vendor_name?: string
  created_at: string
}

export interface ShoppingItem {
  id: string
  event_id?: string
  event_name?: string
  name: string
  category?: string
  quantity: number
  budget_amount?: number
  actual_price?: number
  store?: string
  status: ShoppingStatus
  assigned_to?: string
  assignee?: Profile
  created_at: string
}

export interface Guest {
  id: string
  name: string
  phone?: string
  email?: string
  side: GuestSide
  group?: string
  rsvp_status: RSVPStatus
  invitation_sent: boolean
  food_preference?: string
  created_at: string
}

export interface Vendor {
  id: string
  name: string
  phone?: string
  email?: string
  category: string
  rating?: number
  notes?: string
  created_at: string
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  totalBookings: number
  confirmedBookings: number
  totalShopping: number
  purchasedShopping: number
  totalBudget: number
  spentBudget: number
  overdueBookings: Booking[]
  urgentTasks: Task[]
  events: WeddingEvent[]
  eventStats: {
    eventId: string
    completedTasks: number
    totalTasks: number
    completionPercent: number
  }[]
}
