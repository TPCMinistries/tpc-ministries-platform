/**
 * Ecosystem Client - TPC Ministries
 * 
 * Connects to the LDC Brain AI (Perpetual Core) central database
 * for cross-app event tracking, people sync, and unified analytics.
 */

const ECOSYSTEM_BASE_URL = process.env.NEXT_PUBLIC_ECOSYSTEM_URL || 'https://perpetualcore.com/api/ecosystem';
const APP_SLUG = 'tpc-ministries';

interface EventPayload {
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  actor_email?: string;
  payload?: Record<string, unknown>;
}

interface PersonPayload {
  external_user_id: string;
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

interface TransactionPayload {
  external_transaction_id?: string;
  transaction_type: 'revenue' | 'donation' | 'expense' | 'transfer' | 'grant';
  amount: number;
  currency?: string;
  category?: string;
  contact_email?: string;
  description?: string;
  transaction_date?: string;
  metadata?: Record<string, unknown>;
}

class EcosystemClient {
  private baseUrl: string;
  private appSlug: string;

  constructor(appSlug: string, baseUrl?: string) {
    this.appSlug = appSlug;
    this.baseUrl = baseUrl || ECOSYSTEM_BASE_URL;
  }

  async logEvent(eventPayload: EventPayload): Promise<{ success: boolean; event_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_slug: this.appSlug, ...eventPayload }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`[Ecosystem] Event log failed:`, data);
        return { success: false, error: data.error };
      }
      return { success: true, event_id: data.event_id };
    } catch (error) {
      console.error(`[Ecosystem] Event log error:`, error);
      return { success: false, error: 'Network error' };
    }
  }

  async syncPerson(personPayload: PersonPayload): Promise<{ success: boolean; contact_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_slug: this.appSlug, ...personPayload }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`[Ecosystem] Person sync failed:`, data);
        return { success: false, error: data.error };
      }
      return { success: true, contact_id: data.contact_id };
    } catch (error) {
      console.error(`[Ecosystem] Person sync error:`, error);
      return { success: false, error: 'Network error' };
    }
  }

  async logTransaction(txPayload: TransactionPayload): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_slug: this.appSlug, ...txPayload }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`[Ecosystem] Transaction log failed:`, data);
        return { success: false, error: data.error };
      }
      return { success: true, transaction_id: data.transaction_id };
    } catch (error) {
      console.error(`[Ecosystem] Transaction log error:`, error);
      return { success: false, error: 'Network error' };
    }
  }

  async getOverview(startDate?: string, endDate?: string): Promise<{
    apps?: Array<Record<string, unknown>>;
    totals?: Record<string, unknown>;
    recent_events?: Array<Record<string, unknown>>;
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      const response = await fetch(`${this.baseUrl}/overview?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) return { error: data.error };
      return data;
    } catch (error) {
      console.error(`[Ecosystem] Overview fetch error:`, error);
      return { error: 'Network error' };
    }
  }
}

// Pre-configured instance for TPC Ministries
export const tpcMinistriesEcosystem = new EcosystemClient(APP_SLUG);

// Export class for custom instances
export { EcosystemClient };

// Convenience functions
export const logEvent = (payload: EventPayload) => tpcMinistriesEcosystem.logEvent(payload);
export const syncPerson = (payload: PersonPayload) => tpcMinistriesEcosystem.syncPerson(payload);
export const logTransaction = (payload: TransactionPayload) => tpcMinistriesEcosystem.logTransaction(payload);
export const getEcosystemOverview = (start?: string, end?: string) => tpcMinistriesEcosystem.getOverview(start, end);
