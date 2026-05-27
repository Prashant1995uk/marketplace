import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function NoteDetail() {
  const { id } = useParams()
  const { user, refreshUser } = useAuth()
  const [note, setNote] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [summary, setSummary] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [n, r] = await Promise.all([
        api.get(`/notes/${id}`),
        api.get(`/notes/${id}/reviews`),
      ])
      setNote(n.data.data)
      setReviews(r.data.data)
    } catch (e) {
      setNote(null)
      setMsg(e.response?.data?.message || 'Failed to load note')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function download() {
    if (!user) {
      setMsg('Log in to download')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      const { data } = await api.post(`/downloads/${id}`)
      window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
      setMsg('Download started.')
      await refreshUser()
    } catch (e) {
      const code = e.response?.status
      if (code === 402) {
        setMsg('This note is paid — purchase before downloading.')
      } else {
        setMsg(e.response?.data?.message || 'Download failed')
      }
    } finally {
      setBusy(false)
    }
  }

  async function purchase() {
    setBusy(true)
    setMsg('')
    try {
      await api.post(`/purchases/${id}`)
      setMsg('Purchase recorded. You can download now.')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Purchase failed')
    } finally {
      setBusy(false)
    }
  }

  async function summarize() {
    if (!user) {
      setMsg('Log in to summarize')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      const { data } = await api.post(`/ai/summarize/${id}`)
      setSummary(data.data.summary)
    } catch (e) {
      setMsg(e.response?.data?.message || 'Summarization failed')
    } finally {
      setBusy(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!user) {
      setMsg('Log in to review')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      await api.post(`/notes/${id}/reviews`, { rating: Number(rating), comment })
      setComment('')
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not save review')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>
  if (!note) {
    return <p className="text-red-300">{msg || 'Note not found'}</p>
  }

  const ownerId = note.uploadedBy?._id || note.uploadedBy
  const isOwner = user && ownerId && String(ownerId) === String(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{note.title}</h1>
        <p className="mt-2 text-slate-400">
          {note.subject} · Semester {note.semester} ·{' '}
          <span className="text-indigo-300">
            ★ {note.averageRating?.toFixed?.(1) ?? '—'} ({note.reviewCount})
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          By {note.uploadedBy?.name || 'User'} · {note.downloads} downloads
        </p>
        {note.isPaid && note.price > 0 && (
          <p className="mt-2 text-sm text-amber-200">Paid note · ₹{note.price}</p>
        )}
      </div>

      {msg && (
        <div className="rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={download}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Download
        </button>
        {note.isPaid && note.price > 0 && !isOwner && (
          <button
            type="button"
            disabled={busy}
            onClick={purchase}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/20"
          >
            Purchase (demo)
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={summarize}
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          Summarize
        </button>
      </div>

      {summary && (
        <section className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
            AI summary
          </h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
            {summary}
          </pre>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-white">Reviews</h2>
        <ul className="mt-4 space-y-3">
          {reviews.length === 0 && (
            <li className="text-sm text-slate-500">No reviews yet.</li>
          )}
          {reviews.map((rev) => (
            <li
              key={rev._id}
              className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-sm"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-white">
                  {rev.userId?.name || 'User'}
                </span>
                <span className="text-amber-300">★ {rev.rating}</span>
              </div>
              {rev.comment && <p className="mt-1 text-slate-400">{rev.comment}</p>}
            </li>
          ))}
        </ul>

        {user && !isOwner && (
          <form onSubmit={submitReview} className="mt-6 space-y-3 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-white">Your review</h3>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs text-slate-500">
                Rating
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="ml-2 rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment (optional)"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Submit review
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
