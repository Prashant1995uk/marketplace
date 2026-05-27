import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-indigo-500/20 text-indigo-200'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            Notes<span className="text-indigo-400">Market</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavItem to="/browse">Browse</NavItem>
            <NavItem to="/leaderboard">Leaderboard</NavItem>
            {user && (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/upload">Upload</NavItem>
              </>
            )}
            {isAdmin && <NavItem to="/admin">Admin</NavItem>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-xs text-slate-500 sm:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        Ad placeholder: configure via <code className="text-slate-400">GET /api/ads/config</code>
      </footer>
    </div>
  )
}
