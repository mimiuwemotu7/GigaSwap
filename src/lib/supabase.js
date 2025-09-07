import { createClient } from '@supabase/supabase-js'

// Supabase configuration - supports both React and Next.js env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing required Supabase environment variables')
}

// Create a minimal Supabase client (no auth listeners/config)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
  'X-Client-Info': 'supabase-js-web',
  // Keep apikey for some REST calls; do NOT hard-code Authorization here so
  // supabase-js can attach user JWTs when available (important for RLS)
  'apikey': supabaseAnonKey
    }
  }
})

// Minimal connectivity diagnostics (non-auth)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    console.log('🧪 Testing Supabase connectivity...')
    console.log('🔧 Configuration:')
    console.log('  - URL:', supabaseUrl)
    console.log('  - Key length:', supabaseAnonKey?.length || 0)
    try {
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, { 
        method: 'HEAD',
        headers: { 'apikey': supabaseAnonKey }
      })
      console.log('🌐 REST API reachable:', restResponse.status === 200 ? 'Yes' : `No (${restResponse.status})`)
    } catch (error) {
      console.log('🌐 REST API reachable: No (network error)')
    }
  }, 1000)
}

// Enhanced database helper functions
export const db = {
  profiles: {
    async get(userId) {
      if (!userId) throw new Error('User ID is required')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },
    
    async create(profile) {
      if (!profile?.id) throw new Error('Profile data with ID is required')
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(userId, updates) {
      if (!userId || !updates) throw new Error('User ID and updates required')
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  conversations: {
    async getByUser(userId) {
      if (!userId) throw new Error('User ID is required')
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            role,
            timestamp,
            component_type
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    
    async create(conversation) {
      if (!conversation?.user_id) throw new Error('Conversation data with user_id required')
      
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('conversations')
        .insert({ ...conversation, created_at: now, updated_at: now })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(conversationId, updates) {
      if (!conversationId || !updates) throw new Error('Conversation ID and updates required')
      
      const { data, error } = await supabase
        .from('conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async delete(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      // Delete messages first
      await db.messages.deleteByConversation(conversationId)
      
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (error) throw error
    }
  },
  
  messages: {
    async getByConversation(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    
    async create(message) {
      if (!message?.conversation_id) throw new Error('Message with conversation_id required')
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async deleteByConversation(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
      
      if (error) throw error
    }
  }
}

export default supabase