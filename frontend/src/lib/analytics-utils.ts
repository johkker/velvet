// Analytics utilities

export function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('velvet_session_id');
    
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('velvet_session_id', sessionId);
    }
    
    return sessionId;
}

export function getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

export function formatMetricValue(value: number, suffix: string = ''): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M${suffix}`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K${suffix}`;
    }
    return `${value}${suffix}`;
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
