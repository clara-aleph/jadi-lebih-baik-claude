import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://usudeysgphkwcxxlbgeb.supabase.co/rest/v1/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWRleXNncGhrd2N4eGxiZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjI0MDAsImV4cCI6MjA5NDM5ODQwMH0.KbntyeuEz-_HoY25NWOD4T2nf-i22jqx4gi0C5tmLlo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)