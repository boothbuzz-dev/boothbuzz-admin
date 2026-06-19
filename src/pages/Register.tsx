import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { Button } from '../components/UI/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const eventId = searchParams.get('id');

  useEffect(() => {
    if (eventId) {
      apiClient
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error(error);
            setError('Event not found.');
          } else {
            setEvent(data);
          }
          setLoading(false);
        });
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = formData.email.trim();
    if (!email) {
      setError('Email is required.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: rows, error: exErr } = await apiClient
        .from('exhibitors')
        .select('id')
        .eq('email', email)
        .limit(2);

      if (exErr) {
        setError('Could not verify exhibitor profile.');
        return;
      }
      const exhibitor = rows?.[0];
      if (!exhibitor) {
        setError(
          'No exhibitor account uses this email. Create an exhibitor profile in the portal first, then register here.',
        );
        return;
      }

      const { data: existing } = await apiClient
        .from('event_registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('exhibitor_id', exhibitor.id)
        .maybeSingle();

      if (existing) {
        setError('You are already registered for this event.');
        return;
      }

      const { error: insErr } = await apiClient.from('event_registrations').insert({
        event_id: event.id,
        exhibitor_id: exhibitor.id,
        status: 'interested',
      });

      if (insErr) {
        console.error(insErr);
        setError(insErr.message || 'Registration failed.');
        return;
      }
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading event...</div>;
  if (!event) return <div className="p-6 text-red-600">Event not found.</div>;

  if (success) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white shadow rounded mt-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
        <p className="text-gray-600 mt-2">
          You are registered for: <strong>{event.title}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded mt-12">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Register for {event.title}</h1>
      <p className="text-sm text-gray-600 mb-6">{event.description}</p>
      <p className="text-sm text-gray-600 mb-4">
        Enter the <strong>same email</strong> as your exhibitor profile. We link this event to your exhibitor record — no
        duplicate contact fields.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email (must match exhibitor profile)"
          value={formData.email}
          onChange={(e) => setFormData({ email: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
        {error && (
          <div className="text-red-600 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit registration'}
        </Button>
      </form>
    </div>
  );
};
