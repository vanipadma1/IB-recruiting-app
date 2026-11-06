import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Edit2,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskItem, TaskType } from '../types';
import { formatDate, isPastDate, isToday, isWithinDays } from '../utils/helpers';

const TASK_TYPES: TaskType[] = [
  'Send networking email',
  'Follow up with contact',
  'Send thank-you email',
  'Submit application',
  'Prepare for interview',
  'Complete online assessment',
  'Research bank',
  'Update resume',
  'Practice technical questions',
  'Other',
];

export const TasksView: React.FC<{
  onOpenQuickAddTask: () => void;
}> = ({ onOpenQuickAddTask }) => {
  const { state, toggleTaskStatus, deleteTask, saveTask, navigateWithFilter } = useApp();

  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('Pending');
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = state.tasks.filter((t) => {
    if (filterStatus === 'Pending' && t.status === 'Completed') return false;
    if (filterStatus === 'Completed' && t.status !== 'Completed') return false;
    if (filterStatus === 'Overdue') {
      if (t.status === 'Completed') return false;
      if (!isPastDate(t.dueDate)) return false;
    }

    if (filterType !== 'All' && t.type !== filterType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.bank && t.bank.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const overdueCount = state.tasks.filter(
    (t) => t.status !== 'Completed' && isPastDate(t.dueDate)
  ).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Recruiting Tasks & Follow-Up Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss a follow-up deadline, thank-you email, or application portal cutoff
          </p>
        </div>

        <button
          onClick={onOpenQuickAddTask}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Task / Follow-Up</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title, bank, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Status Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200">
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'Pending' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('Overdue')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'Overdue'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                Overdue ({overdueCount})
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'Completed' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'All' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                All
              </button>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700">No tasks found</div>
            <div className="text-slate-400 mt-1">
              {filterStatus === 'Overdue'
                ? 'Great job! Zero tasks are overdue.'
                : 'All tasks matching this filter are complete.'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isOverdue = task.status !== 'Completed' && isPastDate(task.dueDate);
              const isDueToday = task.status !== 'Completed' && isToday(task.dueDate);
              const contact = task.contactId ? state.contacts.find((c) => c.id === task.contactId) : null;

              return (
                <div
                  key={task.id}
                  className={`p-4 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors text-xs ${
                    task.status === 'Completed' ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      onChange={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded">
                          {task.type}
                        </span>
                      </div>

                      {/* Associated Details */}
                      <div className="text-slate-500 text-xs flex items-center gap-2 flex-wrap">
                        {task.bank && (
                          <span className="font-medium text-slate-700">{task.bank}</span>
                        )}
                        {contact && (
                          <>
                            <span>·</span>
                            <span
                              onClick={() => navigateWithFilter('crm', { crmSearch: contact.fullName })}
                              className="text-blue-600 hover:underline cursor-pointer"
                            >
                              {contact.fullName} ({contact.seniority})
                            </span>
                          </>
                        )}
                        {task.notes && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 italic">{task.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Due Date & Actions */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div
                        className={`font-mono text-xs font-semibold ${
                          isOverdue
                            ? 'text-rose-600'
                            : isDueToday
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isOverdue ? (
                          <span className="text-rose-600 font-semibold uppercase">Overdue</span>
                        ) : isDueToday ? (
                          <span className="text-amber-600 font-semibold uppercase">Due Today</span>
                        ) : (
                          'Due Date'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit task"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete task?')) deleteTask(task.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={async (saved) => {
            await saveTask(saved);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Task Create / Edit Modal
export const TaskModal: React.FC<{
  task: Partial<TaskItem>;
  onClose: () => void;
  onSave: (t: Partial<TaskItem>) => Promise<void>;
}> = ({ task, onClose, onSave }) => {
  const { state } = useApp();

  const [formData, setFormData] = useState<Partial<TaskItem>>({
    title: task.title || '',
    type: task.type || 'Follow up with contact',
    contactId: task.contactId || null,
    bank: task.bank || null,
    applicationId: task.applicationId || null,
    dueDate: task.dueDate || new Date().toISOString().split('T')[0],
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    notes: task.notes || '',
    id: task.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full my-8 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? 'Edit Recruiting Task' : 'New Task / Follow-Up Commitment'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Follow up with Marcus Vance regarding referral status"
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Task Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Associate with contact or bank */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Associated Banker</label>
              <select
                value={formData.contactId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  const c = state.contacts.find((x) => x.id === val);
                  setFormData({
                    ...formData,
                    contactId: val,
                    bank: c ? c.bank : formData.bank,
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">None / General</option>
                {state.contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.bank})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank Association</label>
              <input
                type="text"
                value={formData.bank || ''}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value || null })}
                placeholder="e.g. Evercore, Goldman"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-sm"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
