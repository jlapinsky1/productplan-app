import { supabase } from './supabase'
import type {
  Idea, Product, PriorityColumn, Theme, RoadmapBar,
  Objective, KeyResult, Initiative, IdeaScore,
} from '../models'

const COMPANY_ID = '00000000-0000-0000-0000-000000000001'

// ---- Ideas ----

export async function fetchIdeas(): Promise<Idea[]> {
  const { data: ideas } = await supabase
    .from('pp_ideas')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })

  if (!ideas?.length) return []

  const ideaIds = ideas.map(i => i.id)
  const { data: scores } = await supabase
    .from('pp_idea_scores')
    .select('*')
    .in('idea_id', ideaIds)

  const scoreMap = new Map<string, IdeaScore[]>()
  for (const s of scores ?? []) {
    const list = scoreMap.get(s.idea_id) ?? []
    list.push({ ideaId: s.idea_id, columnId: s.column_id, score: s.score })
    scoreMap.set(s.idea_id, list)
  }

  return ideas.map(i => ({
    id: i.id,
    title: i.title,
    description: i.description ?? '',
    problem: i.problem ?? '',
    customerEvidence: i.customer_evidence ?? '',
    appetite: i.appetite ?? 'tbd',
    constraints: i.constraints ?? '',
    status: i.status ?? 'backlog',
    requester: i.requester ?? '',
    votes: i.votes ?? 0,
    tags: i.tags ?? [],
    productId: i.product_id ?? undefined,
    linkedBarId: i.linked_bar_id ?? undefined,
    scores: scoreMap.get(i.id) ?? [],
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  }))
}

// ---- Products ----

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('pp_products')
    .select('id, name')
    .eq('company_id', COMPANY_ID)
    .order('name')

  return (data ?? []).map(p => ({ id: p.id, name: p.name }))
}

// ---- Idea mutations ----

export async function updateIdeaTags(ideaId: string, tags: string[]): Promise<void> {
  await supabase
    .from('pp_ideas')
    .update({ tags })
    .eq('id', ideaId)
}

// ---- Priority Columns ----

export async function fetchPriorityColumns(): Promise<PriorityColumn[]> {
  const { data } = await supabase
    .from('pp_priority_columns')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('sort_order')

  return (data ?? []).map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    weight: c.weight,
    sortOrder: c.sort_order,
  }))
}

// ---- Themes ----

export async function fetchThemes(): Promise<Theme[]> {
  const { data } = await supabase
    .from('pp_strategic_themes')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .eq('active', true)
    .order('name')

  return (data ?? []).map(t => ({
    id: t.id,
    name: t.name,
    color: '#6366f1', // default — theme table doesn't store color
    sortOrder: 0,
  }))
}

// ---- Roadmap Bars ----

export async function fetchRoadmapBars(): Promise<RoadmapBar[]> {
  const { data } = await supabase
    .from('pp_roadmap_bars')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('start_date')

  return (data ?? []).map(b => ({
    id: b.id,
    containerId: undefined,
    themeId: b.theme_id ?? undefined,
    title: b.title,
    description: b.description ?? '',
    startDate: b.start_date ?? '',
    endDate: b.end_date ?? '',
    color: b.color ?? '#6366f1',
    percentComplete: b.percent_complete ?? 0,
    tags: b.tags ?? [],
    isParked: b.is_parked ?? false,
    linkedObjectiveIds: b.linked_objective_ids ?? [],
    createdAt: b.created_at,
  }))
}

// ---- Objectives + Key Results ----

export async function fetchObjectives(): Promise<Objective[]> {
  const { data } = await supabase
    .from('pp_objectives')
    .select('*, pp_key_results(*)')
    .eq('company_id', COMPANY_ID)
    .order('created_at')

  return (data ?? []).map(o => ({
    id: o.id,
    title: o.title,
    description: o.description ?? '',
    color: o.color ?? '#6366f1',
    scope: o.scope ?? 'company',
    parentId: o.parent_id ?? undefined,
    ragStatus: o.rag_status ?? 'green',
    teamName: o.team_name ?? '',
    keyResults: (o.pp_key_results ?? []).map((kr: any): KeyResult => ({
      id: kr.id,
      objectiveId: kr.objective_id,
      title: kr.title,
      unit: kr.unit ?? 'number',
      targetValue: kr.target_value ?? 0,
      currentValue: kr.current_value ?? 0,
      sortOrder: kr.sort_order ?? 0,
    })),
    linkedBarIds: o.linked_bar_ids ?? [],
    linkedInitiativeIds: o.linked_initiative_ids ?? [],
    createdAt: o.created_at,
  }))
}

// ---- Initiatives ----

export async function fetchInitiatives(): Promise<Initiative[]> {
  const { data, error } = await supabase
    .from('pp_initiatives')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at')

  if (error) console.error('fetchInitiatives error:', error)

  return (data ?? []).map(i => ({
    id: i.id,
    title: i.title,
    description: i.description ?? '',
    businessValue: i.business_value ?? '',
    businessGoal: i.business_goal ?? '',
    successMetric: i.success_metric ?? '',
    targetValue: i.target_value ?? 0,
    currentValue: i.current_value ?? 0,
    deadline: i.deadline ?? undefined,
    priority: i.priority ?? 'medium',
    status: i.status ?? 'draft',
    stakeholders: (typeof i.stakeholders === 'string' ? JSON.parse(i.stakeholders || '[]') : i.stakeholders) ?? [],
    blockers: i.blockers ?? '',
    executiveOwner: i.executive_owner ?? '',
    operatingOwner: i.operating_owner ?? '',
    objectiveId: i.objective_id ?? undefined,
    initiativeKey: i.initiative_key ?? undefined,
    createdAt: i.created_at,
    updatedAt: i.updated_at ?? undefined,
  }))
}

export async function updateInitiativeObjective(initiativeId: string, objectiveId: string | null): Promise<void> {
  const { error } = await supabase
    .from('pp_initiatives')
    .update({ objective_id: objectiveId })
    .eq('id', initiativeId)
  if (error) throw error
}
