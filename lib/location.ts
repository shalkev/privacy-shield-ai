export async function getLocationFromIP(ip: string): Promise<string> {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
        return 'Lokal (Development)';
    }

    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) throw new Error('Location lookup failed');

        const data = await response.json();
        if (data.error) return 'Unbekannt (IP Lookup Limit)';

        return `${data.city || ''}, ${data.country_name || ''}`.trim() || 'Unbekannt';
    } catch (error) {
        console.error('IP Location lookup error:', error);
        return 'Unbekannt';
    }
}

export function getClientIP(req: Request): string {
    const xForwardedFor = req.headers.get('x-forwarded-for');
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    // Next.js standard way to get IP in requests if available through other headers
    return 'Unbekannt';
}
