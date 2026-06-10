import { createFileRoute } from '@tanstack/react-router'
import { StrategyBoard } from '../../components/strategy/StrategyBoard'

export const Route = createFileRoute('/strategy/')({
  component: StrategyBoard,
})
