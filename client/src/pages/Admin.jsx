import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [pending, setPending] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [u, p] = await Promise.all([
        api.get('/admin/users', { params: { limit: 50 } }),
        api.get('/admin/notes/pending'),
      ])
      setUsers(u.data.data)
      setPending(p.data.data)
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function setRole(userId, role) {
    setMsg('')
    try {
      await api.patch(`/admin/users/${userId}/role`, { role })
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed')
    }
  }

  async function setStatus(noteId, status) {
    setMsg('')
    try {
      await api.patch(`/admin/notes/${noteId}/status`, { status })
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Action failed')
    }
  }

  async function removeNote(noteId) {
    if (!confirm('Delete this note permanently?')) return
    setMsg('')
    try {
      await api.delete(`/admin/notes/${noteId}`)
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) return <p className="text-slate-400">Loading admin…</p>

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin</h1>
        <p className="mt-1 text-slate-400">Users, pending uploads, moderation.</p>
      </div>

      {msg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          {msg}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-white">Pending notes</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          {pending.length === 0 ? (
            <p className="bg-slate-900/40 p-4 text-sm text-slate-500">No pending notes.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {pending.map((n) => (
                <li
                  key={n._id}
                  className="flex flex-col gap-3 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-500">
                      {n.subject} · {n.semester} · {n.uploadedBy?.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(n._id, 'approved')}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(n._id, 'rejected')}
                      className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(n._id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Users</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((u) => (
                <tr key={u._id} className="bg-slate-900/40">
                  <td className="px-4 py-3 text-white">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-indigo-300">{u.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {['user', 'premium', 'admin'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(u._id, r)}
                          className="rounded border border-white/10 px-2 py-0.5 text-xs text-slate-300 hover:bg-white/5"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
