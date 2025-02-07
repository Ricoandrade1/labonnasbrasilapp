import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uefncrfntjhijscxrbqj.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZm5jcmZudGpoaWpzY3hyYnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NjM5NTAsImV4cCI6MjA1NDQzOTk1MH0._10eKNCZErRh7IXgW6u-kJoDRTGWptLPQh_isQmgkv4";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
