import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://bjtjhtqnaewvrjmffjgk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpodHFuYWV3dnJqbWZmamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjY4MTksImV4cCI6MjA5MjE0MjgxOX0.zqo6kMt23mS1agBTvhBSEkDDtA2JuiXAfQhoJIpvuzI',
)
