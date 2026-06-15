import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetSubjectsQuery,
  useGetPinnedFlashcardsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '../store/apiSlice';
import { FolderPlus, BookOpen, CheckCircle2, Bookmark, Award, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();

  // Queries
  const { data: subjects = [], isLoading: loading, error: subjectsError } = useGetSubjectsQuery();
  const { data: pinnedList = [] } = useGetPinnedFlashcardsQuery();

  // Mutations
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [selectedSubjId, setSelectedSubjId] = useState(null);

  // Overall progress calculations
  const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // SVG parameters for radial progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    try {
      await createSubject({ name: subjectName, description: subjectDesc }).unwrap();
      setSubjectName('');
      setSubjectDesc('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!selectedSubjId || !subjectName.trim()) return;
    try {
      await updateSubject({ id: selectedSubjId, name: subjectName, description: subjectDesc }).unwrap();
      setSubjectName('');
      setSubjectDesc('');
      setSelectedSubjId(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update subject:', err);
    }
  };

  const handleDeleteSubject = async (id, e) => {
    e.stopPropagation(); // Prevent card click navigation
    if (window.confirm('Are you sure you want to delete this subject? All nested topics and flashcards will be deleted!')) {
      try {
        await deleteSubject(id).unwrap();
      } catch (err) {
        console.error('Failed to delete subject:', err);
      }
    }
  };

  const openEditModal = (id, name, desc, e) => {
    e.stopPropagation();
    setSelectedSubjId(id);
    setSubjectName(name);
    setSubjectDesc(desc);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Grid: Overall Progress + Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Radial Progress Panel */}
        <div className="glass-panel rounded-2xl p-6 flex items-center space-x-6 col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Circular Progress SVG */}
          <div className="relative flex-shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{overallProgress}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Progress</span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Award className="h-3.5 w-3.5" />
              <span>Overall Achievement</span>
            </span>
            <h2 className="text-xl font-bold text-white mb-1">Your Learning Dashboard</h2>
            <p className="text-sm text-slate-400 max-w-md">
              You have completed <span className="font-semibold text-indigo-400">{completedTopics}</span> out of{' '}
              <span className="font-semibold text-slate-350">{totalTopics}</span> topics across all subjects. Keep it up!
            </p>
          </div>
        </div>

        {/* Quick Shortcut Card: Pinned Flashcards */}
        <button
          onClick={() => navigate('/pinned')}
          className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left relative overflow-hidden border border-slate-800 hover:border-indigo-500/50 cursor-pointer group"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="text-3xl font-extrabold text-white">{pinnedList.length}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Pinned Cards</h3>
            <p className="text-xs text-slate-450 mt-1">Quickly access cards you flagged for special review.</p>
          </div>
        </button>
      </div>

      {/* Main Subjects Header / Actions */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="h-5.5 w-5.5 text-indigo-400" />
            <span>Your Subjects</span>
          </h2>
          <p className="text-xs text-slate-455 mt-1">Create and manage your courses and track their specific topic progress.</p>
        </div>
        <button
          onClick={() => {
            setSubjectName('');
            setSubjectDesc('');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <FolderPlus className="h-4.5 w-4.5" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {subjectsError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{subjectsError?.data?.message || subjectsError?.error || 'Failed to load subjects'}</span>
        </div>
      )}

      {loading && subjects.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No subjects yet</h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Get started by creating your first subject (e.g. Mathematics, History, Computer Science).
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 inline-flex items-center space-x-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
          >
            <FolderPlus className="h-4.5 w-4.5" />
            <span>Create First Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              onClick={() => navigate(`/subjects/${subject._id}`)}
              className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700/80 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {subject.name}
                  </h3>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(subject._id, subject.name, subject.description || '', e)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSubject(subject._id, e)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {subject.description && (
                  <p className="text-sm text-slate-450 line-clamp-2 mb-4">
                    {subject.description}
                  </p>
                )}
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      {subject.completedTopics} / {subject.totalTopics} Topics
                    </span>
                  </span>
                  <span className="text-white font-bold">{subject.progress}%</span>
                </div>
                {/* Progress Bar Container */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 z-10 animate-scale-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry, Algorithms"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief summary of what this subject covers..."
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Create Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 z-10 animate-scale-up relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-355 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Subject</h3>
            <form onSubmit={handleEditSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
