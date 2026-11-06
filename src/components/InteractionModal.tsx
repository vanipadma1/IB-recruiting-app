import React, { useState } from 'react';
import { X, PhoneCall, Coffee, Mail, Video, Users, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Interaction, InteractionType } from '../types';

export const InteractionModal: React.FC<{
  contactId?: string;
  onClose: () => void;
}> = ({ contactId, onClose }) => {
  const { state, saveInteraction } = useApp();

  const [selectedContactId, setSelectedContactId] = useState(
    contactId || (state.contacts[0] ? state.contacts[0].id : '')
  );

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [interactionType, setInteractionType] = useState<InteractionType>('Phone Call');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [personalDetails, setPersonalDetails] = useState('');
  const [adviceReceived, setAdviceReceived] = useState('');
  const [recruitingInsights, setRecruitingInsights] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [followUpAction, setFollowUpAction] = useState('Send thank you note citing conversation highlights');
  const [followUpDeadline, setFollowUpDeadline] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [thankYouEmailSent, setThankYouEmailSent] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return;

    await saveInteraction({
      contactId: selectedContactId,
      date,
      interactionType,
      durationMinutes: Number(durationMinutes),
      keyTakeaways,
      personalDetails,
      adviceReceived,
      recruitingInsights,
      questionsAsked,
      followUpAction,
      followUpDeadline: followUpDeadline || null,
      thankYouEmailSent,
    });
    onClose();
  };

  const contact = state.contacts.find((c) => c.id === selectedContactId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Log Networking Conversation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record key takeaways, personal details, advice, and follow-up commitments
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Contact Picker */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Banker Contact *</label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 font-medium"
            >
              {state.contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.bank} ({c.group}, {c.seniority})
                </option>
              ))}
            </select>
          </div>

          {/* Row 1: Date, Type, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Conversation *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Interaction Type *</label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="In-Person Coffee Chat">In-Person Coffee Chat</option>
                <option value="Zoom">Zoom / Virtual Call</option>
                <option value="Email">Email Exchange</option>
                <option value="LinkedIn">LinkedIn Conversation</option>
                <option value="Information Session">Information Session / Panel</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 20)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Key Takeaways */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Key Takeaways & Discussion Points *
            </label>
            <textarea
              required
              rows={2}
              value={keyTakeaways}
              onChange={(e) => setKeyTakeaways(e.target.value)}
              placeholder="What deals, group dynamics, or day-to-day realities did they describe?"
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Row 3: Personal Details & Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Personal Details to Remember
              </label>
              <textarea
                rows={2}
                value={personalDetails}
                onChange={(e) => setPersonalDetails(e.target.value)}
                placeholder="Hometown, sports teams, hobbies, pets, favorite vacation spots..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Advice Received
              </label>
              <textarea
                rows={2}
                value={adviceReceived}
                onChange={(e) => setAdviceReceived(e.target.value)}
                placeholder="What preparation or behavioral advice did they give you?"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 4: Recruiting Insights & Questions Asked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Recruiting & Group Insights
              </label>
              <textarea
                rows={2}
                value={recruitingInsights}
                onChange={(e) => setRecruitingInsights(e.target.value)}
                placeholder="Who is the staffer? When do first rounds drop? What are they screening for?"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Questions You Asked
              </label>
              <textarea
                rows={2}
                value={questionsAsked}
                onChange={(e) => setQuestionsAsked(e.target.value)}
                placeholder="List the high-impact questions you asked during the call..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 5: Follow-Up Action, Deadline, Thank-You Check */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Follow-Up Action</label>
                <input
                  type="text"
                  value={followUpAction}
                  onChange={(e) => setFollowUpAction(e.target.value)}
                  placeholder="e.g. Send updated resume, review deal article, check back in 3 weeks"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Follow-Up Deadline</label>
                <input
                  type="date"
                  value={followUpDeadline}
                  onChange={(e) => setFollowUpDeadline(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={thankYouEmailSent}
                onChange={(e) => setThankYouEmailSent(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Thank-you email sent (or drafted to send within 24 hours)</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow-sm"
            >
              Log Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
