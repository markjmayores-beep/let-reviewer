import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              LET Reviewer PH
            </Link>
            <p className="text-sm leading-relaxed">
              The smartest way to prepare for the Philippine Licensure Examination for Teachers.
            </p>
          </div>

          {/* Review */}
          <div>
            <h4 className="text-white font-semibold mb-4">Review Modes</h4>
            <ul className="space-y-2 text-sm">
              {['Quick Review', 'Timed Exam', 'Mock Board Exam', 'Daily Challenge', 'Survival Mode', 'Topic Mastery'].map((item) => (
                <li key={item}>
                  <Link href="/register" className="hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-white font-semibold mb-4">Subjects</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Professional Education',
                'General Education',
                'English',
                'Mathematics',
                'Science',
                'Filipino',
              ].map((item) => (
                <li key={item}>
                  <Link href="/register" className="hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Pricing', 'Privacy Policy', 'Terms of Service', 'Contact'].map(
                (item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} LET Reviewer PH. All rights reserved.
          </p>
          <p className="text-sm">
            Built for Filipino teachers 🇵🇭
          </p>
        </div>
      </div>
    </footer>
  )
}
