import { createFileRoute } from '@tanstack/react-router'
import { PortfolioTimeline } from '../../components/portfolio/PortfolioTimeline'

export const Route = createFileRoute('/portfolio/')({
  component: PortfolioTimeline,
})
