const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Helper to get auth token from cookies
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('velvet_token='))
        ?.split('=')[1] || null;
}

// Helper for authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge with any existing headers
    if (options.headers) {
        Object.assign(headers, options.headers);
    }
    
    return fetch(url, { ...options, headers });
}

// ============================================
// PUBLIC ENDPOINTS
// ============================================

export async function fetchFeaturedTalents() {
    try {
        const res = await fetch(`${API_URL}/talents/featured`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to fetch featured talents');
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function searchTalents(query: any) {
    const params = new URLSearchParams(query);
    try {
        const res = await fetch(`${API_URL}/talents/search?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to search talents');
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function smartSearch(query: any) {
    const params = new URLSearchParams(query);
    try {
        const res = await fetch(`${API_URL}/talents/smart-search?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to search talents');
        return res.json();
    } catch (error) {
        console.error(error);
        return { featured: [], regular: [], meta: {} };
    }
}

export async function fetchTalentProfile(slug: string) {
    try {
        const res = await fetch(`${API_URL}/talents/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Login failed');
    }
    
    return res.json();
}

export async function registerTalent(data: {
    email: string;
    password: string;
    displayName: string;
    city: string;
}) {
    const res = await fetch(`${API_URL}/auth/register/talent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Registration failed');
    }
    
    return res.json();
}

export async function registerEstablishment(data: { 
    email: string; 
    password: string; 
    name: string; 
    slug: string;
    address: string;
    city: string;
}) {
    const res = await fetch(`${API_URL}/auth/register/establishment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Registration failed');
    }
    
    return res.json();
}

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

export async function fetchCurrentUser() {
    try {
        const res = await fetchWithAuth(`${API_URL}/users/me`);
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateTalentProfile(data: {
    displayName?: string;
    bio?: string;
    age?: number;
    services?: string[];
    priceMin?: number;
    city?: string;
    // Physical attributes
    hairColor?: string;
    eyeColor?: string;
    bodyType?: string;
    height?: number;
    skinTone?: string;
    ethnicity?: string;
    measurements?: string;
    weight?: number;
    tattoos?: boolean;
    piercings?: boolean;
    // Professional fields
    languages?: string[];
    availability?: string;
    outcall?: boolean;
    incall?: boolean;
}) {
    const res = await fetchWithAuth(`${API_URL}/talents`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Update failed');
    }
    
    return res.json();
}

export async function uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Upload failed');
    }
    
    return res.json();
}

export async function fetchInvitations() {
    try {
        const res = await fetchWithAuth(`${API_URL}/invitations/incoming`);
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function acceptInvitation(id: string) {
    const res = await fetchWithAuth(`${API_URL}/invitations/accept/${id}`, {
        method: 'POST',
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Accept failed');
    }
    
    return res.json();
}

export async function getActiveBoost() {
    const res = await fetchWithAuth(`${API_URL}/boosts/active`);
    
    if (!res.ok) {
        throw new Error('Failed to fetch active boost');
    }
    
    const response = await res.json();
    return response.data;
}

export async function createBoost(boostType: string, paymentMethod: string = 'PIX') {
    const res = await fetchWithAuth(`${API_URL}/boosts/purchase`, {
        method: 'POST',
        body: JSON.stringify({ boostType }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Boost creation failed');
    }

    const response = await res.json();
    
    // Backend wraps response in { data: {...}, meta: {}, error: null }
    // Return the actual data
    return response.data || response;
}

export async function checkPaymentStatus(billingId: string) {
    const res = await fetch(`${API_URL}/payments/status/${billingId}`);
    if (!res.ok) throw new Error('Failed to check payment status');
    return res.json();
}

// ============================================
// ESTABLISHMENT ENDPOINTS
// ============================================

export async function fetchEstablishmentProfile() {
    try {
        const res = await fetchWithAuth(`${API_URL}/establishments/me`);
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateEstablishmentProfile(data: {
    name?: string;
    address?: string;
    city?: string;
}) {
    const res = await fetchWithAuth(`${API_URL}/establishments/me`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Update failed');
    }
    
    return res.json();
}

export async function sendInvitation(talentId: string, message?: string) {
    const res = await fetchWithAuth(`${API_URL}/establishments/invitations/send`, {
        method: 'POST',
        body: JSON.stringify({ talentId, message }),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Invitation failed');
    }
    
    return res.json();
}

export async function fetchSentInvitations() {
    try {
        const res = await fetchWithAuth(`${API_URL}/invitations/sent`);
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function fetchEstablishments() {
    try {
        const res = await fetch(`${API_URL}/establishments`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch establishments');
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function fetchManagedTalents() {
    try {
        const res = await fetchWithAuth(`${API_URL}/invitations/managed-talents`);
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export async function purchaseBoostForTalents(talentIds: string[], boostType: string) {
    const res = await fetchWithAuth(`${API_URL}/boosts/purchase-for-talents`, {
        method: 'POST',
        body: JSON.stringify({ talentIds, boostType }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Boost purchase failed');
    }

    const response = await res.json();
    return response.data || response;
}

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

export async function trackView(profileType: string, profileId: string, sessionId: string, referrer?: string, deviceType?: string) {
    try {
        const res = await fetch(`${API_URL}/analytics/track/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                profileType,
                profileId,
                sessionId,
                referrer,
                deviceType,
            }),
        });

        if (!res.ok) return { success: false };
        return res.json();
    } catch (error) {
        console.error('Erro ao rastrear visualização:', error);
        return { success: false };
    }
}

export async function trackInteraction(profileType: string, profileId: string, interactionType: string, sessionId: string, metadata?: any) {
    try {
        const res = await fetch(`${API_URL}/analytics/track/interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                profileType,
                profileId,
                interactionType,
                sessionId,
                metadata,
            }),
        });

        if (!res.ok) return { success: false };
        return res.json();
    } catch (error) {
        console.error('Erro ao rastrear interação:', error);
        return { success: false };
    }
}

export async function fetchTalentMetrics(talentId: string, period?: string) {
    try {
        const url = period 
            ? `${API_URL}/analytics/metrics/talent/${talentId}?period=${period}`
            : `${API_URL}/analytics/metrics/talent/${talentId}`;

        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: null };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        return { data: null };
    }
}

export async function fetchMyMetrics(period?: string) {
    try {
        const url = period 
            ? `${API_URL}/analytics/metrics/my-metrics?period=${period}`
            : `${API_URL}/analytics/metrics/my-metrics`;

        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: null };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        return { data: null };
    }
}

export async function fetchEstablishmentMetrics(establishmentId: string, period?: string) {
    try {
        const url = period 
            ? `${API_URL}/analytics/metrics/establishment/${establishmentId}?period=${period}`
            : `${API_URL}/analytics/metrics/establishment/${establishmentId}`;

        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: null };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        return { data: null };
    }
}

export async function fetchManagedTalentsMetrics(establishmentId: string) {
    try {
        const res = await fetchWithAuth(`${API_URL}/analytics/metrics/establishment/${establishmentId}/talents`);
        
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar métricas dos talentos:', error);
        return { data: [] };
    }
}

export async function fetchTalentBoostHistory(limit?: number, offset?: number) {
    try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const url = `${API_URL}/boost-history/talent${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: [], meta: {} };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar histórico de boosts:', error);
        return { data: [], meta: {} };
    }
}

export async function fetchEstablishmentBoostHistory(limit?: number, offset?: number) {
    try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const url = `${API_URL}/boost-history/establishment${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: [], meta: {} };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar histórico de boosts:', error);
        return { data: [], meta: {} };
    }
}

export async function fetchPaymentHistory(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
}) {
    try {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const url = `${API_URL}/payments/history${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetchWithAuth(url);
        
        if (!res.ok) return { data: [], meta: {} };
        return res.json();
    } catch (error) {
        console.error('Erro ao buscar histórico de pagamentos:', error);
        return { data: [], meta: {} };
    }
}

