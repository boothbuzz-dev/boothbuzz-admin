import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f)) {
      let c = fs.readFileSync(p, 'utf8');
      const o = c;
      c = c.replace(/from ['"](\.\.\/)+lib\/supabase['"]/g, (m) => m.replace('supabase', 'apiClient'));
      c = c.replace(/from ['"]\.\/supabase['"]/g, "from './apiClient'");
      c = c.replace(/\bsupabase\b/g, 'apiClient');
      c = c.replace(/import \{ supabase \}/g, 'import { apiClient }');
      c = c.replace(/import \{ generateEventFlyer, supabase \}/g, 'import { generateEventFlyer, apiClient }');
      c = c.replace(/import \{ supabase, generateEventFlyer \}/g, 'import { apiClient, generateEventFlyer }');
      c = c.replace(/isSupabaseConfigured/g, 'isApiConfigured');
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log('updated', p);
      }
    }
  }
}

walk('c:\\codebase\\boothbuzz\\repos\\boothbuzz-admin\\src');
