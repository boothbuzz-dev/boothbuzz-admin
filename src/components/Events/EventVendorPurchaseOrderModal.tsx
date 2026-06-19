import React, { useCallback, useEffect, useState } from 'react';
import { X, FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table';
import type { PurchaseOrderStatus } from '../../types';

export interface EventVendorPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  vendorId: string;
  vendorName: string;
  organizationId: string | null;
  userId: string | null;
  initialMode: 'list' | 'create';
  onSaved?: () => void;
}

type POListRow = {
  id: string;
  po_number: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
};

type DraftLine = { description: string; quantity: string; unit_price: string };

function generatePoNumber(): string {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PO-${y}-${r}`;
}

export const EventVendorPurchaseOrderModal: React.FC<EventVendorPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  vendorId,
  vendorName,
  organizationId,
  userId,
  initialMode,
  onSaved,
}) => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [editFetchBusy, setEditFetchBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<POListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingPoId, setEditingPoId] = useState<string | null>(null);
  const [editingPoNumber, setEditingPoNumber] = useState('');

  const [status, setStatus] = useState<PurchaseOrderStatus>('draft');
  const [notes, setNotes] = useState('');
  const [taxTotal, setTaxTotal] = useState('0');
  const [lines, setLines] = useState<DraftLine[]>([{ description: '', quantity: '1', unit_price: '0' }]);

  const loadList = useCallback(async () => {
    if (!eventId || !vendorId) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchErr } = await apiClient
      .from('purchase_orders')
      .select('id, po_number, status, grand_total, currency, created_at')
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (fetchErr) {
      setError(fetchErr.message);
      setRows([]);
      return;
    }
    setRows((data as POListRow[]) || []);
  }, [eventId, vendorId]);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setEditingPoId(null);
    setEditingPoNumber('');
    setEditFetchBusy(false);
    setError(null);
    setStatus('draft');
    setNotes('');
    setTaxTotal('0');
    setLines([{ description: '', quantity: '1', unit_price: '0' }]);
    void loadList();
  }, [isOpen, initialMode, loadList]);

  const goBackToList = () => {
    setMode('list');
    setEditingPoId(null);
    setEditingPoNumber('');
    setError(null);
    void loadList();
  };

  const openEdit = async (row: POListRow) => {
    setError(null);
    setEditFetchBusy(true);
    const { data: poRow, error: poErr } = await apiClient
      .from('purchase_orders')
      .select('id, po_number, status, notes, tax_total')
      .eq('id', row.id)
      .single();
    if (poErr || !poRow) {
      setError(poErr?.message || 'Could not load purchase order');
      setEditFetchBusy(false);
      return;
    }
    const { data: lineRows, error: lineErr } = await apiClient
      .from('purchase_order_lines')
      .select('description, quantity, unit_price, line_no')
      .eq('purchase_order_id', row.id)
      .order('line_no', { ascending: true });
    setEditFetchBusy(false);
    if (lineErr) {
      setError(lineErr.message);
      return;
    }
    const loaded = (lineRows as { description: string; quantity: number; unit_price: number; line_no: number }[]) || [];
    const mapped: DraftLine[] =
      loaded.length > 0
        ? loaded.map((l) => ({
            description: l.description ?? '',
            quantity: String(l.quantity ?? 1),
            unit_price: String(l.unit_price ?? 0),
          }))
        : [{ description: '', quantity: '1', unit_price: '0' }];
    setEditingPoId(String(poRow.id));
    setEditingPoNumber(String(poRow.po_number));
    setStatus((poRow.status as PurchaseOrderStatus) || 'draft');
    setNotes((poRow.notes as string) || '');
    setTaxTotal(String(poRow.tax_total ?? 0));
    setLines(mapped);
    setMode('edit');
  };

  const lineTotals = lines.map((l) => {
    const q = parseFloat(l.quantity) || 0;
    const p = parseFloat(l.unit_price) || 0;
    return q * p;
  });
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const tax = parseFloat(taxTotal) || 0;
  const grand = subtotal + tax;

  const addLine = () => setLines((prev) => [...prev, { description: '', quantity: '1', unit_price: '0' }]);
  const removeLine = (idx: number) => setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  const updateLine = (idx: number, field: keyof DraftLine, value: string) => {
    setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleCreateSubmit = async () => {
    if (!organizationId) {
      setError('Event has no organization. Assign organization to the event before creating POs.');
      return;
    }
    const validLines = lines
      .map((l, i) => ({
        line_no: i + 1,
        description: l.description.trim(),
        quantity: parseFloat(l.quantity) || 0,
        unit_price: parseFloat(l.unit_price) || 0,
      }))
      .filter((l) => l.description.length > 0 && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Add at least one line with description and quantity greater than 0.');
      return;
    }
    setSaving(true);
    setError(null);
    const amounts = validLines.map((l) => l.quantity * l.unit_price);
    const sub = amounts.reduce((a, b) => a + b, 0);
    const taxN = parseFloat(taxTotal) || 0;
    const grandN = sub + taxN;

    let poNumber = generatePoNumber();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: inserted, error: insErr } = await apiClient
        .from('purchase_orders')
        .insert({
          organization_id: organizationId,
          event_id: eventId,
          vendor_id: vendorId,
          po_number: poNumber,
          status,
          currency: 'INR',
          notes: notes.trim() || null,
          subtotal: sub,
          tax_total: taxN,
          grand_total: grandN,
          created_by: userId,
        })
        .select('id')
        .single();

      if (!insErr && inserted?.id) {
        const lineRows = validLines.map((l, i) => ({
          purchase_order_id: inserted.id,
          line_no: l.line_no,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          amount: l.quantity * l.unit_price,
        }));
        const { error: lineErr } = await apiClient.from('purchase_order_lines').insert(lineRows);
        if (lineErr) {
          await apiClient.from('purchase_orders').delete().eq('id', inserted.id);
          setError(lineErr.message);
        } else {
          onSaved?.();
          setMode('list');
          await loadList();
        }
        setSaving(false);
        return;
      }
      if (insErr?.message?.includes('unique') || insErr?.code === '23505') {
        poNumber = generatePoNumber();
        continue;
      }
      setError(insErr?.message || 'Failed to create purchase order');
      setSaving(false);
      return;
    }
    setError('Could not allocate a unique PO number. Try again.');
    setSaving(false);
  };

  const handleEditSubmit = async () => {
    if (!editingPoId) return;
    const validLines = lines
      .map((l, i) => ({
        line_no: i + 1,
        description: l.description.trim(),
        quantity: parseFloat(l.quantity) || 0,
        unit_price: parseFloat(l.unit_price) || 0,
      }))
      .filter((l) => l.description.length > 0 && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Add at least one line with description and quantity greater than 0.');
      return;
    }
    setSaving(true);
    setError(null);
    const amounts = validLines.map((l) => l.quantity * l.unit_price);
    const sub = amounts.reduce((a, b) => a + b, 0);
    const taxN = parseFloat(taxTotal) || 0;
    const grandN = sub + taxN;

    const { error: updErr } = await apiClient
      .from('purchase_orders')
      .update({
        status,
        notes: notes.trim() || null,
        subtotal: sub,
        tax_total: taxN,
        grand_total: grandN,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingPoId);

    if (updErr) {
      setError(updErr.message);
      setSaving(false);
      return;
    }

    const { error: delErr } = await apiClient.from('purchase_order_lines').delete().eq('purchase_order_id', editingPoId);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return;
    }

    const lineRows = validLines.map((l) => ({
      purchase_order_id: editingPoId,
      line_no: l.line_no,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      amount: l.quantity * l.unit_price,
    }));
    const { error: insErr } = await apiClient.from('purchase_order_lines').insert(lineRows);
    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }
    onSaved?.();
    setSaving(false);
    goBackToList();
  };

  if (!isOpen) return null;

  const orgMissing = !organizationId;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="po-modal-title"
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-200">
          <div className="min-w-0">
            <h2 id="po-modal-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-blue-600" />
              Purchase orders
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium text-gray-800">{vendorName}</span>
              {eventTitle ? (
                <>
                  {' '}
                  · <span className="text-gray-700">{eventTitle}</span>
                </>
              ) : null}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {orgMissing && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              This event is missing an organization record. Fix that in the database before creating purchase orders.
            </p>
          )}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}

          {mode === 'list' && (
            <>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <p className="text-sm text-gray-600">POs for this vendor on this event.</p>
                <Button
                  type="button"
                  size="sm"
                  disabled={orgMissing || editFetchBusy}
                  onClick={() => {
                    setError(null);
                    setEditingPoId(null);
                    setEditingPoNumber('');
                    setStatus('draft');
                    setNotes('');
                    setTaxTotal('0');
                    setLines([{ description: '', quantity: '1', unit_price: '0' }]);
                    setMode('create');
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New PO
                </Button>
              </div>
              {editFetchBusy && (
                <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">Loading purchase order…</p>
              )}
              {loading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-6 text-center">
                  No purchase orders yet. Click <strong>New PO</strong> to create one.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-sm">{r.po_number}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.status === 'sent'
                                  ? 'info'
                                  : r.status === 'draft'
                                    ? 'warning'
                                    : r.status === 'cancelled'
                                      ? 'error'
                                      : 'success'
                              }
                              className="capitalize"
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {r.currency} {Number(r.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={editFetchBusy}
                              onClick={() => void openEdit(r)}
                              className="inline-flex items-center"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <>
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={goBackToList}>
                  Back to list
                </Button>
                {mode === 'edit' && editingPoNumber && (
                  <p className="text-sm text-gray-600">
                    Editing <span className="font-mono font-medium text-gray-900">{editingPoNumber}</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    {mode === 'edit' && (
                      <>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tax (INR)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={taxTotal}
                    onChange={(e) => setTaxTotal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Optional notes to vendor…"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">Line items</span>
                  <Button type="button" size="sm" variant="outline" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add line
                  </Button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium text-gray-600">Description</th>
                        <th className="px-3 py-2 font-medium text-gray-600 w-24">Qty</th>
                        <th className="px-3 py-2 font-medium text-gray-600 w-28">Unit (INR)</th>
                        <th className="px-3 py-2 font-medium text-gray-600 w-28 text-right">Amount</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-2 py-1">
                            <input
                              value={line.description}
                              onChange={(e) => updateLine(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                              placeholder="Item / service"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.quantity}
                              onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.unit_price}
                              onChange={(e) => updateLine(idx, 'unit_price', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                            />
                          </td>
                          <td className="px-2 py-1 text-right font-medium text-gray-800">
                            ₹{lineTotals[idx].toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-1 py-1">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              aria-label="Remove line"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end text-sm gap-6 pt-2 border-t border-gray-100">
                  <span className="text-gray-600">
                    Subtotal: <strong>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </span>
                  <span className="text-gray-600">
                    Tax: <strong>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </span>
                  <span className="text-gray-900">
                    Total: <strong>₹{grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {mode === 'create' && (
            <Button type="button" disabled={saving || orgMissing} onClick={() => void handleCreateSubmit()}>
              {saving ? 'Saving…' : 'Save purchase order'}
            </Button>
          )}
          {mode === 'edit' && (
            <Button type="button" disabled={saving} onClick={() => void handleEditSubmit()}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
