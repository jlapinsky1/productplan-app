import { createFileRoute } from '@tanstack/react-router'
import { IdeasBoard } from '../../components/ideas/IdeasBoard'

export const Route = createFileRoute('/ideas/')({
  component: IdeasBoard,
})
