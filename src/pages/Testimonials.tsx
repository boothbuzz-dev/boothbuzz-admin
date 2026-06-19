import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, MessageSquareQuote, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/UI/Table';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';

/** Matches public.testimonials columns */
export interface TestimonialRow {
  id: string;
  author_name: string;
  author_title: string | null;
  content: string;
  rating: number | null;
  avatar_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  author_name: '',
  author_title: '',
  content: '',
  rating: '' as string | number,
  avatar_url: '',
  sort_order: 0,
  is_published: true,
};

const TESTIMONIAL_COLUMNS =
  'id, author_name, author_title, content, rating, avatar_url, sort_order, is_published, created_at, updated_at';

export const Testimonials: React.FC = () => {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editRow, setEditRow] = useState<TestimonialRow | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [deleteRow, setDeleteRow] = useState<TestimonialRow | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient
      .from('testimonials')
      .select(TESTIMONIAL_COLUMNS)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows((data || []) as TestimonialRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isSuperAdmin) {
      setLoading(false);
      setRows([]);
      return;
    }
    fetchRows();
  }, [authLoading, isSuperAdmin, fetchRows]);

  const parseRating = (v: string | number): number | null => {
    if (v === '' || v === null || v === undefined) return null;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    if (Number.isNaN(n) || n < 1 || n > 5) return null;
    return n;
  };

  const toInsertPayload = (f: typeof emptyForm) => ({
    author_name: f.author_name.trim(),
    author_title: f.author_title.trim() || null,
    content: f.content.trim(),
    rating: parseRating(f.rating),
    avatar_url: f.avatar_url.trim() || null,
    sort_order: Number.isFinite(Number(f.sort_order)) ? Number(f.sort_order) : 0,
    is_published: f.is_published,
    updated_at: new Date().toISOString(),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.author_name.trim() || !form.content.trim()) {
      setError('Please fill in the author name and testimonial quote.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await apiClient.from('testimonials').insert(toInsertPayload(form));
      if (err) throw err;
      setSuccess('Testimonial created.');
      setForm(emptyForm);
      setAddOpen(false);
      fetchRows();
    } catch (err: any) {
      setError(err?.message || 'Failed to create testimonial');
    }
    setSubmitting(false);
  };

  const openEdit = (row: TestimonialRow) => {
    setEditRow(row);
    setEditForm({
      author_name: row.author_name,
      author_title: row.author_title || '',
      content: row.content,
      rating: row.rating ?? '',
      avatar_url: row.avatar_url || '',
      sort_order: row.sort_order,
      is_published: row.is_published,
    });
    setError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRow) return;
    setError(null);
    if (!editForm.author_name.trim() || !editForm.content.trim()) {
      setError('Please fill in the author name and testimonial quote.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await apiClient
        .from('testimonials')
        .update(toInsertPayload(editForm))
        .eq('id', editRow.id);
      if (err) throw err;
      setSuccess('Testimonial updated.');
      setEditRow(null);
      fetchRows();
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    }
    setSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRow) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await apiClient.from('testimonials').delete().eq('id', deleteRow.id);
      if (err) throw err;
      setSuccess('Testimonial deleted.');
      setDeleteRow(null);
      fetchRows();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
    setSubmitting(false);
  };

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const formFields = (
    f: typeof emptyForm,
    setF: React.Dispatch<React.SetStateAction<typeof emptyForm>>,
    idPrefix: string
  ) => (
    <div className="space-y-4">
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-author_name`}>
          Author name <span className="text-red-500">*</span>
        </label>
        <input
          id={`${idPrefix}-author_name`}
          value={f.author_name}
          onChange={(e) => setF((p) => ({ ...p, author_name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Full name"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-author_title`}>
          Role or company
        </label>
        <input
          id={`${idPrefix}-author_title`}
          value={f.author_title}
          onChange={(e) => setF((p) => ({ ...p, author_title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. CEO, Acme Corp"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-content`}>
          Testimonial quote <span className="text-red-500">*</span>
        </label>
        <textarea
          id={`${idPrefix}-content`}
          value={f.content}
          onChange={(e) => setF((p) => ({ ...p, content: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="What they said about your product or event"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-rating`}>
            Star rating
          </label>
          <select
            id={`${idPrefix}-rating`}
            value={f.rating === '' ? '' : String(f.rating)}
            onChange={(e) =>
              setF((p) => ({ ...p, rating: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'star' : 'stars'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-sort_order`}>
            Display order
          </label>
          <input
            id={`${idPrefix}-sort_order`}
            type="number"
            value={f.sort_order}
            onChange={(e) => setF((p) => ({ ...p, sort_order: parseInt(e.target.value, 10) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-avatar_url`}>
          Photo URL
        </label>
        <input
          id={`${idPrefix}-avatar_url`}
          type="url"
          value={f.avatar_url}
          onChange={(e) => setF((p) => ({ ...p, avatar_url: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://…"
        />
      </div>
      <div>
        <label className={`${labelCls} flex items-center gap-2 cursor-pointer`} htmlFor={`${idPrefix}-is_published`}>
          <input
            id={`${idPrefix}-is_published`}
            type="checkbox"
            checked={f.is_published}
            onChange={(e) => setF((p) => ({ ...p, is_published: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Published (visible on site)
        </label>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[16rem]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only Super Admins can manage testimonials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquareQuote className="h-7 w-7 text-blue-600" />
            Testimonials
          </h1>
          <p className="text-gray-600">Manage customer quotes for marketing and landing pages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchRows()}
            disabled={loading}
            title="Reload from database"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => { setAddOpen(true); setError(null); setForm(emptyForm); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add testimonial
          </Button>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm flex justify-between items-center">
          <span>{success}</span>
          <button type="button" className="text-green-800 underline text-sm" onClick={() => setSuccess(null)}>
            Dismiss
          </button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">All testimonials</h2>
          {!loading && (
            <span className="text-sm text-gray-500">
              {rows.length} {rows.length === 1 ? 'row' : 'rows'} from <code className="text-xs bg-gray-100 px-1 rounded">testimonials</code>
            </span>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No testimonials yet. Add your first one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right" aria-label="Actions" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium whitespace-nowrap">{row.author_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-600 text-sm">
                        {row.author_title || '—'}
                      </TableCell>
                      <TableCell className="text-sm">{row.rating != null ? `${row.rating} / 5` : '—'}</TableCell>
                      <TableCell className="text-sm">{row.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={row.is_published ? 'success' : 'default'}>
                          {row.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => openEdit(row)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => setDeleteRow(row)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {addOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add testimonial</h2>
              <button type="button" className="p-2 rounded hover:bg-gray-100" onClick={() => setAddOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {formFields(form, setForm, 'add')}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit testimonial</h2>
              <button type="button" className="p-2 rounded hover:bg-gray-100" onClick={() => setEditRow(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editRow && (
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div>
                    <span className={labelCls}>Record ID</span>
                    <p className="text-xs text-gray-600 break-all font-mono bg-gray-50 rounded px-2 py-1">{editRow.id}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</span>
                      <p>{formatDateTime(editRow.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last updated</span>
                      <p>{formatDateTime(editRow.updated_at)}</p>
                    </div>
                  </div>
                </div>
              )}
              {formFields(editForm, setEditForm, 'edit')}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Delete testimonial?</h2>
            <p className="text-gray-600 text-sm mb-4">
              This will permanently remove the testimonial from <strong>{deleteRow.author_name}</strong>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteRow(null)}>
                Cancel
              </Button>
              <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting} onClick={handleDeleteConfirm}>
                {submitting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
