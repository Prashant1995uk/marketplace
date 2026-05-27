import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const initialFilters = {
  keyword: '',
  subject: '',
  semester: '',
  minRating: '',
}

export default function Browse() {
  const [form, setForm] = useState(initialFilters)
  const [applied, setApplied] = useState(initialFilters)
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = {
          page,
          limit: 10,
        }
        if (applied.keyword) params.keyword = applied.keyword
        if (applied.subject) params.subject = applied.subject
        if (applied.semester) params.semester = applied.semester
        if (applied.minRating !== '') params.minRating = applied.minRating
        const res = await api.get('/notes', { params })
        if (cancelled) return
        setData(res.data.data)
        setTotal(res.data.total)
        setPages(res.data.pages)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, applied])

  function onFilterSubmit(e) {
    e.preventDefault()
    setApplied({ ...form })
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Browse notes</h1>
        <p className="mt-1 text-slate-400">Search and filter approved notes.</p>
      </div>

      <form
        onSubmit={onFilterSubmit}
        className="grid gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 md:grid-cols-4"
      >
        <input
          placeholder="Keyword"
          value={form.keyword}
          onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white md:col-span-2"
        />
        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <input
          placeholder="Semester"
          value={form.semester}
          onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="Min rating"
          value={form.minRating}
          onChange={(e) => setForm((f) => ({ ...f, minRating: e.target.value }))}
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white md:col-span-4"
        >
          Apply filters
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.map((n) => (
                <tr key={n._id} className="bg-slate-900/40 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link to={`/notes/${n._id}`} className="text-indigo-300 hover:text-indigo-200">
                      {n.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{n.subject}</td>
                  <td className="px-4 py-3 text-slate-300">{n.semester}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {n.averageRating?.toFixed?.(1) ?? '—'} ({n.reviewCount})
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {n.isPaid && n.price > 0 ? `₹${n.price}` : 'Free'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Page {page} of {pages} · {total} notes
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
