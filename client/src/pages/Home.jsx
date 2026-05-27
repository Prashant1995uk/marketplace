import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-10 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-300">
          Study smarter
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Share notes. Discover quality. Rank up.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Upload PDFs, search by subject and semester, rate notes, and unlock AI
          summaries. Free users get daily download limits; premium members get
          unlimited access.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/browse"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500"
          >
            Browse notes
          </Link>
          <Link
            to="/signup"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            Create account
          </Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Search & filters',
            body: 'Keyword search with subject, semester, and minimum rating. Pagination built in.',
          },
          {
            title: 'Monetization',
            body: 'Sell paid notes with a 20% platform commission. Premium at ₹99/mo (placeholder).',
          },
          {
            title: 'AI summaries',
            body: 'One-click OpenAI summaries of PDF text — key points in seconds.',
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-white/10 bg-slate-900/50 p-6"
          >
            <h3 className="font-semibold text-white">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
