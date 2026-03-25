import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgkjpghqxbwblnjamrhz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpna2pwZ2hxeGJ3YmxuamFtcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzE5NjAsImV4cCI6MjA4OTgwNzk2MH0.XjlHm-H0ws4A4HWwm9voP5UpiIYQGkFKqnmw4vqqo9Y'

export const supabase = createClient(supabaseUrl, supabaseKey)