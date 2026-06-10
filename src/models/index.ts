export type IdeaStatus = 'backlog' | 'planned' | 'in_progress' | 'done'
export type ObjectiveScope = 'company' | 'team'
export type RagStatus = 'red' | 'amber' | 'green'
export type BarStatus = 'planned' | 'in_progress' | 'complete'
export type KrUnit = 'dollar' | 'percent' | 'number'
export type PriorityColumnType = 'benefit' | 'cost'
export type InitiativeStatus = 'draft' | 'in_progress' | 'complete' | 'cancelled'

export interface PriorityColumn {
  id: string
  name: string
  type: PriorityColumnType
  weight: number
  sortOrder: number
}

export interface IdeaScore {
  ideaId: string
  columnId: string
  score: number // 1-5
}

export interface Idea {
  id: string
  title: string
  description: string
  status: IdeaStatus
  requester: string
  votes: number
  tags: string[]
  linkedBarId?: string
  scores: IdeaScore[]
  createdAt: string
  updatedAt: string
}

export interface Theme {
  id: string
  name: string
  color: string
  sortOrder: number
}

export interface Container {
  id: string
  themeId: string
  name: string
  color: string
  sortOrder: number
}

export interface RoadmapBar {
  id: string
  containerId?: string
  themeId?: string
  title: string
  description: string
  startDate: string
  endDate: string
  color: string
  percentComplete: number
  tags: string[]
  isParked: boolean
  linkedObjectiveIds: string[]
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  color: string
}

export interface KeyResult {
  id: string
  objectiveId: string
  title: string
  unit: KrUnit
  targetValue: number
  currentValue: number
  sortOrder: number
}

export interface Objective {
  id: string
  title: string
  description: string
  color: string
  scope: ObjectiveScope
  parentId?: string
  ragStatus: RagStatus
  teamName: string
  keyResults: KeyResult[]
  linkedBarIds: string[]
  linkedInitiativeIds: string[]
  createdAt: string
}

export interface Initiative {
  id: string
  title: string
  description: string
  businessValue: string
  status: InitiativeStatus
  objectiveId?: string
  createdAt: string
}
