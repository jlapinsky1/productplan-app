import { createFileRoute } from '@tanstack/react-router'
import { RoadmapTimeline } from '../../components/roadmap/RoadmapTimeline'

export const Route = createFileRoute('/roadmap/')({
  component: RoadmapTimeline,
})
