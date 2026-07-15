export const WEDDING_DATE = new Date('2026-11-11T00:00:00')
export const PLANNING_START_DATE = new Date('2026-07-15T00:00:00')
export const WEDDING_NAME = "SANTHOSHINI'S WEDDING"
export const ADMIN_NAME = 'NaveenMS'
export const APP_NAME = "Santhoshini's Wedding Planner"

export const EVENTS = [
  {
    id: 'pandakkal',
    slug: 'pandakkal',
    name: 'Pandakkal',
    date: '2026-11-09',
    time: '',
    venue: 'Our Home',
    color: '#7c3aed',
    gradient: 'from-violet-600 to-purple-700',
    bgClass: 'bg-violet-500',
    bgLightClass: 'bg-violet-50',
    textClass: 'text-violet-600',
    borderClass: 'border-violet-200',
    icon: '🪔',
    budget: 0,
  },
  {
    id: 'haldi',
    slug: 'haldi',
    name: 'Haldi',
    date: '2026-11-10',
    time: 'Morning',
    venue: 'Our Home',
    color: '#d97706',
    gradient: 'from-amber-500 to-orange-500',
    bgClass: 'bg-amber-500',
    bgLightClass: 'bg-amber-50',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-200',
    icon: '🌼',
    budget: 0,
  },
  {
    id: 'mehandi',
    slug: 'mehandi',
    name: 'Mehandi',
    date: '2026-11-10',
    time: 'Evening',
    venue: 'Our Home',
    color: '#65a30d',
    gradient: 'from-lime-600 to-green-600',
    bgClass: 'bg-lime-500',
    bgLightClass: 'bg-lime-50',
    textClass: 'text-lime-700',
    borderClass: 'border-lime-200',
    icon: '🌿',
    budget: 0,
  },
  {
    id: 'muhurtham',
    slug: 'muhurtham',
    name: 'Muhurtham',
    date: '2026-11-11',
    time: '',
    venue: 'TBD',
    color: '#059669',
    gradient: 'from-emerald-600 to-emerald-800',
    bgClass: 'bg-emerald-600',
    bgLightClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: '💍',
    budget: 0,
  },
  {
    id: 'nikkah',
    slug: 'nikkah',
    name: 'Nikkah',
    date: '2026-11-13',
    time: '',
    venue: 'TBD',
    color: '#0f766e',
    gradient: 'from-teal-600 to-emerald-700',
    bgClass: 'bg-teal-600',
    bgLightClass: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
    icon: '☪️',
    budget: 0,
  },
  {
    id: 'reception',
    slug: 'reception',
    name: 'Reception',
    date: '2026-11-15',
    time: '',
    venue: 'TBD',
    color: '#b45309',
    gradient: 'from-amber-600 to-yellow-600',
    bgClass: 'bg-amber-600',
    bgLightClass: 'bg-yellow-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: '🎊',
    budget: 0,
  },
]

export const BOOKING_CATEGORIES = [
  { name: 'Makeup Artist', leadTime: 90, icon: '💄' },
  { name: 'Wedding Clothes', leadTime: 90, icon: '👗' },
  { name: 'Decorator', leadTime: 120, icon: '🎨' },
  { name: 'Food Catering', leadTime: 270, icon: '🍽️' },
  { name: 'Photographer', leadTime: 180, icon: '📷' },
  { name: 'Videographer', leadTime: 180, icon: '🎥' },
  { name: 'Mehendi Artist', leadTime: 60, icon: '🌿' },
  { name: 'DJ / Sound', leadTime: 60, icon: '🎵' },
  { name: 'Lighting', leadTime: 60, icon: '💡' },
  { name: 'Transportation', leadTime: 45, icon: '🚗' },
  { name: 'Venue', leadTime: 270, icon: '🏛️' },
  { name: 'Flowers', leadTime: 30, icon: '🌸' },
  { name: 'Jeweler', leadTime: 90, icon: '💎' },
  { name: 'Invitation Cards', leadTime: 45, icon: '📩' },
  { name: 'Accommodation', leadTime: 90, icon: '🏨' },
  { name: 'Others', leadTime: 30, icon: '📋' },
]

export const TASK_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const
export const TASK_STATUSES = ['Not Started', 'In Progress', 'Waiting', 'Blocked', 'Completed', 'Cancelled'] as const
export const BOOKING_STATUSES = ['Not Booked', 'Enquired', 'Negotiating', 'Booked', 'Confirmed', 'Cancelled'] as const

export const TASK_CATEGORIES = [
  'Clothing', 'Jewelry', 'Decoration', 'Food', 'Music', 'Photography',
  'Transportation', 'Venue', 'Guest Management', 'Shopping', 'Bookings', 'General'
]

export const SHOPPING_CATEGORIES = [
  'Clothes', 'Jewelry', 'Decorations', 'Flowers', 'Food', 'Return Gifts',
  'Wedding Cards', 'Stage', 'Lighting', 'Accessories', 'Beauty', 'Other'
]

export const GUEST_GROUPS = ['Family', 'Friends', 'VIP', 'Colleagues', 'Other']
export const VENDOR_CATEGORIES = [
  'Photographer', 'Decorator', 'Catering', 'Makeup', 'Mehendi Artist',
  'DJ', 'Venue', 'Flowers', 'Jeweler', 'Tailor', 'Transportation', 'Other'
]
