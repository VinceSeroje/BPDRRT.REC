// Supabase Configuration
// Replace these with your Supabase project credentials
const SUPABASE_URL = 'https://jkwlkfifzifknrsvmgxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2xrZmlmemlma25yc3ZtZ3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTc2MDksImV4cCI6MjA5MDUzMzYwOX0.QlFVEyjwmcUq4yRy0C4Xz_Zi23xdFEqZczspYSdmVi8';

let supabaseClient;

async function initSupabase() {
    try {
        // Try to use the globally available supabase from the script
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase connected successfully');
            return true;
        }
    } catch (e) {
        console.error('❌ Supabase initialization failed:', e);
    }
    return false;
}

// Wait for Supabase to be ready
window.addEventListener('load', () => {
    setTimeout(initSupabase, 500);
});

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// Database operations with fallback to localStorage
const db = {
    // Get data
    async get(key) {
        if (isSupabaseConfigured() && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('app_data')
                    .select('value')
                    .eq('key', key)
                    .single();
                if (error) throw error;
                return data ? JSON.parse(data.value) : null;
            } catch (e) {
                console.warn('Supabase get failed, using localStorage:', e);
                return getData(key);
            }
        }
        return getData(key);
    },
    
    // Set data
    async set(key, value) {
        if (isSupabaseConfigured() && supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('app_data')
                    .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' });
                if (error) throw error;
            } catch (e) {
                console.warn('Supabase set failed, using localStorage:', e);
            }
        }
        setData(key, value);
    },
    
    // Sync all local data to Supabase
    async syncToCloud() {
        if (!isSupabaseConfigured() || !supabaseClient) return false;
        
        const keys = ['admin', 'm_data', 'gatherings', 'sys_cfg'];
        for (const key of keys) {
            const value = getData(key);
            if (value) {
                await this.set(key, value);
            }
        }
        return true;
    },
    
    // Sync all cloud data to local
    async syncFromCloud() {
        if (!isSupabaseConfigured() || !supabaseClient) return false;
        
        const keys = ['admin', 'm_data', 'gatherings', 'sys_cfg'];
        for (const key of keys) {
            const value = await this.get(key);
            if (value) {
                setData(key, value);
            }
        }
        return true;
    }
};
