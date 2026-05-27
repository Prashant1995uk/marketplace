import { useState } from 'react'
import { api } from '../api/client'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState('')
  const [file, setFile] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [price, setPrice] = useState('0')
  const [msg, setMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) {
      setMsg('Choose a PDF file')
      return
    }
    setSubmitting(true)
    setMsg('')
    const fd = new FormData()
    fd.append('title', title)
    fd.append('subject', subject)
    fd.append('semester', semester)
    fd.append('file', file)
    fd.append('isPaid', String(isPaid))
    fd.append('price', isPaid ? price : '0')
    try {
      await api.post('/notes', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMsg('Uploaded — pending admin approval.')
      setTitle('')
      setSubject('')
      setSemester('')
      setFile(null)
      setIsPaid(false)
      setPrice('0')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload notes</h1>
        <p className="mt-1 text-slate-400">PDF only. Duplicates (same file) are blocked.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 bg-slate-900/50 p-6">
        {msg && (
          <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            {msg}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-400">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Subject</label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Semester</label>
          <input
            required
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="paid"
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="rounded border-white/20"
          />
          <label htmlFor="paid" className="text-sm text-slate-300">
            Sell as paid note
          </label>
        </div>
        {isPaid && (
          <div>
            <label className="text-xs font-medium text-slate-400">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-xs text-slate-500">20% platform commission on sale.</p>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </div>
  )
}
