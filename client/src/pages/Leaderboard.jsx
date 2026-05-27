import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/leaderboard', { params: { limit: 50 } })
        if (!cancelled) setRows(res.data.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-slate-400">Loading leaderboard…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-1 text-slate-400">
          Ranked by composite score (uploads, downloads, ratings on your notes).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Uploads</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Ratings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((r) => (
              <tr key={r.rank} className="bg-slate-900/40">
                <td className="px-4 py-3 font-medium text-white">{r.rank}</td>
                <td className="px-4 py-3 text-slate-200">{r.user?.name}</td>
                <td className="px-4 py-3 text-indigo-300">{r.score}</td>
                <td className="px-4 py-3 text-slate-400">{r.uploads}</td>
                <td className="px-4 py-3 text-slate-400">{r.downloads}</td>
                <td className="px-4 py-3 text-slate-400">{r.ratings?.toFixed?.(1) ?? r.ratings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
