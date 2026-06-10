import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AppNav } from '../components/shared/AppNav'

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <AppNav />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  ),
})
