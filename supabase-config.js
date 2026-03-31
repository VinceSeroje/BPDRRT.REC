// Supabase Configuration
// Replace these with your Supabase project credentials
const SUPABASE_URL = 'https://jkwlkfifzifknrsvmgxr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FIwmt93LiqOUn-17V3OkmA_hIdkKX4N';

// Initialize Supabase client
let supabaseClient;

// Initialize Supabase
async function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
        return true;
    }
    return false;
}

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
