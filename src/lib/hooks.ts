import { useQuery } from '@tanstack/react-query'
import {
  fetchIdeas, fetchProducts, fetchPriorityColumns, fetchThemes,
  fetchRoadmapBars, fetchObjectives, fetchInitiatives,
} from './api'

export function useIdeas() {
  return useQuery({ queryKey: ['ideas'], queryFn: fetchIdeas })
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts })
}

export function usePriorityColumns() {
  return useQuery({ queryKey: ['priorityColumns'], queryFn: fetchPriorityColumns })
}

export function useThemes() {
  return useQuery({ queryKey: ['themes'], queryFn: fetchThemes })
}

export function useRoadmapBars() {
  return useQuery({ queryKey: ['roadmapBars'], queryFn: fetchRoadmapBars })
}

export function useObjectives() {
  return useQuery({ queryKey: ['objectives'], queryFn: fetchObjectives })
}

export function useInitiatives() {
  return useQuery({ queryKey: ['initiatives'], queryFn: fetchInitiatives })
}
