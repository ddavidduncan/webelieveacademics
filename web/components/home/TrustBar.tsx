import { MapPin, Users, Laptop, GraduationCap, Heart } from 'lucide-react'

const signals = [
  { Icon: MapPin,         text: 'Serving Families Nationwide' },
  { Icon: GraduationCap, text: 'K–12 All Grades & Subjects'  },
  { Icon: Laptop,         text: 'In-Home · Online · Hybrid'   },
  { Icon: Users,          text: 'Real Private Teachers'        },
  { Icon: Heart,          text: 'No-Obligation Consultation'   },
]

export default function TrustBar() {
  return (
    <div className="bg-white border-y border-gray-100 py-5 overflow-hidden">
      <div className="content-container">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {signals.map(({ Icon, text }, i) => (
            <li
              key={text}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500"
            >
              {/* Separator dot (not before first item) */}
              {i > 0 && (
                <span className="hidden sm:block w-1 h-1 rounded-full bg-teal-300 mr-6" />
              )}
              <Icon size={15} className="text-teal-600 flex-shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
