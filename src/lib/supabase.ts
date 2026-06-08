/**
 * Supabase-compatible client — routes all calls to boothbuzz-api.
 */
import { adminPathForTable, apiFetch, apiUpload, getApiUrl, publicFileUrl } from './api';

type Row = Record<string, unknown>;

function camelToSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function toSnake<T>(value: T): T {
  if (value == null || value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((v) => toSnake(v)) as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[camelToSnakeKey(k)] = toSnake(v);
    }
    return out as T;
  }
  return value;
}

function enrichUserRow(row: Row): Row {
  const snake = toSnake(row) as Row;
  if (row.organizationName) {
    snake.organizations = { name: row.organizationName };
  }
  return snake;
}

class QueryBuilder {
  private filters: Array<{ col: string; val: unknown; op: 'eq' | 'in' }> = [];
  private orderCol?: string;
  private orderAsc = true;
  private limitN?: number;
  private singleMode: 'none' | 'single' | 'maybe' = 'none';
  private pendingInsert?: Row | Row[];
  private pendingUpdate?: Row;
  private pendingDelete = false;
  private headCount = false;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.head) this.headCount = true;
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push({ col, val, op: 'eq' });
    return this;
  }

  in(col: string, vals: unknown[]) {
    this.filters.push({ col, val: vals, op: 'in' });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }

  insert(rows: Row | Row[]) {
    this.pendingInsert = rows;
    return this;
  }

  update(patch: Row) {
    this.pendingUpdate = patch;
    return this;
  }

  delete() {
    this.pendingDelete = true;
    return this;
  }

  private basePath() {
    return adminPathForTable(this.table);
  }

  private idFilter(): string | null {
    const idF = this.filters.find((f) => f.col === 'id' && f.op === 'eq');
    return idF ? String(idF.val) : null;
  }

  private emailFilter(): string | null {
    const f = this.filters.find((x) => x.col === 'email' && x.op === 'eq');
    return f ? String(f.val) : null;
  }

  async then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
    try {
      resolve(await this.execute());
    } catch (e) {
      reject?.(e);
    }
  }

  private applyFilters(rows: Row[]): Row[] {
    let result = [...rows];
    for (const f of this.filters) {
      if (f.op === 'eq') {
        result = result.filter((r) => r[f.col] === f.val || r[camelToSnakeKey(f.col)] === f.val);
      } else if (f.op === 'in') {
        const vals = f.val as unknown[];
        result = result.filter((r) => vals.includes(r[f.col]) || vals.includes(r[camelToSnakeKey(f.col)]));
      }
    }
    return result;
  }

  async execute(): Promise<{ data: unknown; error: { message: string } | null; count?: number }> {
    const path = this.basePath();

    if (this.pendingInsert) {
      const rows = Array.isArray(this.pendingInsert) ? this.pendingInsert : [this.pendingInsert];
      if (rows.length === 1) {
        const { data, error } = await apiFetch(path, { method: 'POST', body: JSON.stringify(rows[0]) });
        return { data: data ? toSnake(data) : null, error };
      }
      const results: Row[] = [];
      for (const row of rows) {
        const { data, error } = await apiFetch<Row>(path, { method: 'POST', body: JSON.stringify(row) });
        if (error) return { data: null, error };
        if (data) results.push(toSnake(data) as Row);
      }
      return { data: results, error: null };
    }

    const id = this.idFilter();
    if (this.pendingUpdate && id) {
      const { data, error } = await apiFetch(`${path}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(this.pendingUpdate),
      });
      return { data: data ? toSnake(data) : null, error };
    }

    if (this.pendingDelete && id) {
      const { data, error } = await apiFetch(`${path}/${id}`, { method: 'DELETE' });
      return { data: data ?? { ok: true }, error };
    }

    const email = this.emailFilter();
    if (this.table === 'users' && email && this.singleMode !== 'none') {
      const { data, error } = await apiFetch<Row[]>(`${path}?email=${encodeURIComponent(email)}`);
      if (error) return { data: null, error };
      const rows = (Array.isArray(data) ? data : []).map(enrichUserRow);
      if (this.singleMode === 'maybe') return { data: rows[0] ?? null, error: null };
      if (rows.length !== 1) return { data: null, error: { message: 'User not found' } };
      return { data: rows[0], error: null };
    }

    if (id) {
      const { data, error } = await apiFetch(`${path}/${id}`);
      if (error) {
        if (this.singleMode === 'maybe') return { data: null, error: null };
        return { data: null, error };
      }
      let row = toSnake(data) as Row;
      if (this.table === 'users') row = enrichUserRow(data as Row);
      return { data: row, error: null };
    }

    const { data, error } = await apiFetch<Row[]>(path);
    if (error) return { data: null, error };

    let rows = (Array.isArray(data) ? data : data ? [data] : []).map((r) => {
      const snake = toSnake(r) as Row;
      return this.table === 'users' ? enrichUserRow(r as Row) : snake;
    });

    rows = this.applyFilters(rows);

    if (this.orderCol) {
      rows.sort((a, b) => {
        const av = a[this.orderCol!] ?? a[camelToSnakeKey(this.orderCol!)];
        const bv = b[this.orderCol!] ?? b[camelToSnakeKey(this.orderCol!)];
        if (av === bv) return 0;
        const cmp = av! > bv! ? 1 : -1;
        return this.orderAsc ? cmp : -cmp;
      });
    }

    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    if (this.headCount) return { data: null, error: null, count: rows.length };

    if (this.singleMode === 'single') {
      if (rows.length !== 1) return { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned' } };
      return { data: rows[0], error: null };
    }
    if (this.singleMode === 'maybe') return { data: rows[0] ?? null, error: null };

    return { data: rows, error: null };
  }
}

const authListeners: Array<(event: string, session: { user: Row } | null) => void> = [];

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },

  auth: {
    async getSession() {
      const { data, error } = await apiFetch<Row>('/admin/auth/me');
      if (error || !data) return { data: { session: null }, error: null };
      const user = {
        id: data.id,
        email: data.email,
        user_metadata: { name: data.name, role: data.role },
        created_at: data.createdAt ?? new Date().toISOString(),
      };
      return {
        data: { session: { user, access_token: 'cookie' } },
        error: null,
      };
    },

    async refreshSession() {
      return supabase.auth.getSession();
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const { data, error } = await apiFetch<{ user: Row }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (error) return { data: { user: null, session: null }, error: { message: error.message } };
      const u = data!.user;
      authListeners.forEach((cb) => cb('SIGNED_IN', { user: u }));
      return {
        data: {
          user: {
            id: u.id,
            email: u.email,
            user_metadata: { name: u.name, role: u.role },
            created_at: new Date().toISOString(),
          },
          session: { access_token: 'cookie' },
        },
        error: null,
      };
    },

    async signUp(opts: { email: string; password: string; options?: { data?: Row } }) {
      const body = {
        email: opts.email,
        password: opts.password,
        name: opts.options?.data?.name ?? opts.email.split('@')[0],
        role: opts.options?.data?.role ?? 'admin',
        city: opts.options?.data?.city,
        phone: opts.options?.data?.phone,
      };
      const { data, error } = await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(body) });
      if (error) return { data: { user: null }, error: { message: error.message } };
      return { data: { user: toSnake(data) }, error: null };
    },

    async signOut() {
      await apiFetch('/admin/auth/logout', { method: 'POST' });
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },

    onAuthStateChange(cb: (event: string, session: { user: Row } | null) => void) {
      authListeners.push(cb);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const i = authListeners.indexOf(cb);
              if (i >= 0) authListeners.splice(i, 1);
            },
          },
        },
      };
    },

    async getUser() {
      const { data } = await supabase.auth.getSession();
      return { data: { user: data.session?.user ?? null }, error: null };
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(filePath: string, file: File | Blob, _opts?: unknown) {
          const dir = filePath.includes('/') ? filePath.replace(/\/[^/]+$/, '') : '';
          const { data, error } = await apiUpload(bucket, file, dir ? `${dir}/` : undefined);
          if (error) return { data: null, error: { message: error.message } };
          return { data: { path: data!.path }, error: null };
        },
        getPublicUrl(objectPath: string) {
          return { data: { publicUrl: publicFileUrl(bucket, objectPath) } };
        },
        async list(_prefix: string) {
          return { data: [], error: null };
        },
        async createSignedUrl(objectPath: string) {
          return { data: { signedUrl: publicFileUrl(bucket, objectPath) }, error: null };
        },
        remove(_paths: string[]) {
          return Promise.resolve({ data: [], error: null });
        },
      };
    },
  },

  functions: {
    async invoke(name: string, opts?: { body?: unknown }) {
      if (name === 'generate-event-flyer') {
        const eventId = (opts?.body as Row)?.meta && (opts as { body: { meta: { eventId?: string } } }).body.meta?.eventId;
        if (!eventId) return { data: null, error: { message: 'eventId required' } };
        return apiFetch(`/admin/events/${eventId}/flyer`, { method: 'POST', body: JSON.stringify(opts?.body) });
      }
      return { data: null, error: { message: `Unknown function: ${name}` } };
    },
  },
};

export const generateEventFlyer = async (payload: unknown) => {
  const eventId = (payload as Row)?.meta && (payload as { meta: { eventId?: string } }).meta?.eventId;
  if (!eventId) return { data: null, error: { message: 'eventId required' } };
  return apiFetch(`/admin/events/${eventId}/flyer`, { method: 'POST', body: JSON.stringify(payload) });
};

export default supabase;
export const isSupabaseConfigured = () => !!getApiUrl();
