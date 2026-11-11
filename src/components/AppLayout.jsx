import { BrainCircuit, ChevronRight, History, LayoutDashboard, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/history', label: 'Practice history', Icon: History },
];

function NavigationLinks({ mobile = false }) {
  return navigation.map(({ to, label, Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        } ${mobile ? 'justify-center' : ''}`
      }
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      {label}
    </NavLink>
  ));
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-100 bg-white px-5 py-6 lg:flex">
        <NavLink to="/" className="mb-10 flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <BrainCircuit aria-hidden="true" size={22} />
          </span>
          <span className="text-lg font-bold tracking-tight">prepwise<span className="text-indigo-600">.</span></span>
        </NavLink>

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        <nav aria-label="Main navigation" className="space-y-1">
          <NavigationLinks />
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Sparkles aria-hidden="true" size={18} strokeWidth={1.8} />
            Practice
          </NavLink>
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 grid size-9 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <Sparkles aria-hidden="true" size={17} />
          </div>
          <p className="text-sm font-semibold text-slate-800">Small steps, big wins.</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            A little practice each day goes a long way.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
            You&apos;ve got this <ChevronRight aria-hidden="true" size={14} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <NavLink to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <BrainCircuit aria-hidden="true" size={20} />
            </span>
            <span className="font-bold tracking-tight">prepwise<span className="text-indigo-600">.</span></span>
          </NavLink>
          <p className="hidden text-sm font-medium text-slate-500 lg:block">Your interview prep workspace</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold text-slate-800">Alex Morgan</span>
              <span className="block text-xs text-slate-500">Candidate</span>
            </span>
            <span role="img" aria-label="Alex Morgan" className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              AM
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-7 pb-24 sm:px-8 sm:py-9 lg:px-10 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-slate-200 bg-white px-3 py-2 lg:hidden">
        <NavigationLinks mobile />
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            `flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
            }`
          }
        >
          <Sparkles aria-hidden="true" size={18} />
          Practice
        </NavLink>
      </nav>
    </div>
  );
}

export default AppLayout;
