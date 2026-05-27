import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, isPremium, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [rank, setRank] = useState(null)
  const [uploads, setUploads] = useState([])
  const [downloads, setDownloads] = useState([])
  const [premiumMsg, setPremiumMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [dash, mine, dl] = await Promise.all([
          api.get('/dashboard'),
          api.get('/notes/mine'),
          api.get('/downloads/mine'),
        ])
        if (cancelled) return
        setProfile(dash.data.profile)
        setRank(dash.data.leaderboardRank)
        setUploads(mine.data.data)
        setDownloads(dl.data.data)
      } catch {
        /* handled globally or show toast */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function upgradePremium() {
    setPremiumMsg('')
    try {
      await api.post('/premium/subscribe', { paymentConfirmed: true })
      setPremiumMsg('Premium activated (placeholder payment).')
      await refreshUser()
    } catch (e) {
      setPremiumMsg(e.response?.data?.message || 'Could not upgrade')
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400">Loading dashboard…</div>
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Profile, your notes, downloads, and leaderboard rank.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Profile
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-right text-white">{profile?.name || user?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-right text-slate-300">{profile?.email || user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Role</dt>
              <dd className="text-right capitalize text-indigo-300">
                {profile?.role || user?.role}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Downloads left today</dt>
              <dd className="text-right text-white">
                {isPremium ? 'Unlimited' : profile?.downloadsRemaining ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Leaderboard rank</dt>
              <dd className="text-right text-white">{rank ?? '—'}</dd>
            </div>
          </dl>
          {!isPremium && (
            <div className="mt-6 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
              <p className="text-sm text-indigo-100">
                Premium — ₹99/month · unlimited downloads
              </p>
              <button
                type="button"
                onClick={upgradePremium}
                className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Activate (demo)
              </button>
              {premiumMsg && (
                <p className="mt-2 text-xs text-slate-300">{premiumMsg}</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/upload"
              className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm text-white hover:bg-white/5"
            >
              Upload a note
            </Link>
            <Link
              to="/browse"
              className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm text-white hover:bg-white/5"
            >
              Browse marketplace
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm text-white hover:bg-white/5"
            >
              View leaderboard
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Your uploads</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          {uploads.length === 0 ? (
            <p className="bg-slate-900/40 p-6 text-sm text-slate-500">No uploads yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {uploads.map((n) => (
                <li
                  key={n._id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/40 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-white">{n.title}</span>
                  <span className="text-xs uppercase text-slate-500">{n.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Downloaded notes</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          {downloads.length === 0 ? (
            <p className="bg-slate-900/40 p-6 text-sm text-slate-500">
              No downloads yet. Browse the marketplace to get started.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {downloads.map((d) => (
                <li key={d.note?._id + String(d.downloadedAt)} className="bg-slate-900/40 px-4 py-3 text-sm">
                  <Link
                    to={`/notes/${d.note?._id}`}
                    className="font-medium text-indigo-300 hover:text-indigo-200"
                  >
                    {d.note?.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {d.downloadedAt && new Date(d.downloadedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
