import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetSubjectsQuery,
  useGetTopicsBySubjectQuery,
  useGetFlashcardsByTopicQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useCreateFlashcardMutation,
  useDeleteFlashcardMutation,
} from '../store/apiSlice';
import { ChevronLeft, Plus, Play, Trash2, CheckCircle2, Circle, X, HelpCircle, Eye, EyeOff } from 'lucide-react';

export const SubjectView = () => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();

  // Expanded topic ID state to view cards drawer
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Queries
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: topics = [], isLoading: loading, error } = useGetTopicsBySubjectQuery(subjectId, { skip: !subjectId });
  const { data: cards = [], isLoading: cardsLoading } = useGetFlashcardsByTopicQuery(expandedTopicId, { skip: !expandedTopicId });

  // Mutations
  const [createTopic] = useCreateTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [createFlashcard] = useCreateFlashcardMutation();
  const [deleteFlashcard] = useDeleteFlashcardMutation();

  // Find current subject in list
  const currentSubject = subjects.find((s) => s._id === subjectId);

  // Modals state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  if (!currentSubject) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Subject not found or loading...</p>
        <Link to="/" className="text-indigo-400 hover:underline inline-flex items-center mt-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!subjectId || !topicName.trim()) return;
    try {
      await createTopic({ subjectId, name: topicName, description: topicDesc }).unwrap();
      setTopicName('');
      setTopicDesc('');
      setShowTopicModal(false);
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!selectedTopicId || !cardFront.trim() || !cardBack.trim()) return;
    try {
      await createFlashcard({ topicId: selectedTopicId, front: cardFront, back: cardBack }).unwrap();
      setCardFront('');
      setCardBack('');
      setSelectedTopicId(null);
      setShowCardModal(false);
    } catch (err) {
      console.error('Failed to create flashcard:', err);
    }
  };

  const handleToggleCompleted = async (topicId, currentStatus) => {
    try {
      await updateTopic({ id: topicId, isCompleted: !currentStatus }).unwrap();
    } catch (err) {
      console.error('Failed to update topic completion status:', err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic? All associated flashcards will be permanently deleted!')) {
      try {
        await deleteTopic(topicId).unwrap();
      } catch (err) {
        console.error('Failed to delete topic:', err);
      }
    }
  };

  const handleToggleExpand = (topicId) => {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(topicId);
    }
  };

  const handleDeleteCard = async (cardId, topicId) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await deleteFlashcard({ id: cardId }).unwrap();
      } catch (err) {
        console.error('Failed to delete flashcard:', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 text-sm text-slate-450">
        <Link to="/" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{currentSubject.name}</span>
      </div>

      {/* Header Info */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{currentSubject.name}</h1>
            {currentSubject.description && (
              <p className="text-sm text-slate-400 mt-2 max-w-xl">{currentSubject.description}</p>
            )}
          </div>
          
          {/* Progress Overview */}
          <div className="w-full md:w-64 bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Subject Progress</span>
              <span className="text-indigo-400 font-bold">{currentSubject.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${currentSubject.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Completed Topics</span>
              <span className="text-white font-semibold">{currentSubject.completedTopics} / {currentSubject.totalTopics}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Topics In Subject</h2>
          <p className="text-xs text-slate-455 mt-1">Check completed topics or launch revision sessions on flashcards.</p>
        </div>
        <button
          onClick={() => {
            setTopicName('');
            setTopicDesc('');
            setShowTopicModal(true);
          }}
          className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Topic</span>
        </button>
      </div>

      {/* Topics Grid/List */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <span>{error?.data?.message || error?.error || 'Failed to load topics'}</span>
        </div>
      )}

      {loading && topics.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : topics.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <HelpCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-330">No topics created</h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Organize this subject by creating a few topics, then adding flashcards inside them.
          </p>
          <button
            onClick={() => setShowTopicModal(true)}
            className="mt-5 inline-flex items-center space-x-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create First Topic</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic._id} className="space-y-3">
              {/* Topic Card Header */}
              <div
                className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  topic.isCompleted ? 'border-slate-800/40 bg-slate-900/20' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                {/* Left Side: Checkbox + Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Completed Checkbox */}
                  <button
                    onClick={() => handleToggleCompleted(topic._id, topic.isCompleted)}
                    className={`mt-1 flex-shrink-0 cursor-pointer p-0.5 rounded-lg transition-colors ${
                      topic.isCompleted
                        ? 'text-indigo-400 hover:text-indigo-500'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={topic.isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {topic.isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 fill-indigo-500/10" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className={`font-bold text-slate-105 ${topic.isCompleted ? 'line-through text-slate-455 font-normal' : ''}`}>
                        {topic.name}
                      </h3>
                      {/* Badge Stats */}
                      <div className="flex items-center space-x-1.5 select-none">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400" title="Flashcard Count">
                          {topic.cardCount} cards
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400" title="Revision count">
                          {topic.revisionCount} revisions
                        </span>
                      </div>
                    </div>
                    {topic.description && (
                      <p className={`text-xs text-slate-455 mt-1.5 max-w-xl ${topic.isCompleted ? 'line-through opacity-70' : ''}`}>
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-3.5 self-end md:self-auto">
                  {/* View Cards Button */}
                  <button
                    onClick={() => handleToggleExpand(topic._id)}
                    className={`flex items-center space-x-1.5 text-xs px-3 py-2 border rounded-xl transition-all cursor-pointer font-semibold ${
                      expandedTopicId === topic._id
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700/80 bg-slate-950/20'
                    }`}
                    title={expandedTopicId === topic._id ? 'Hide Flashcards' : 'View Flashcards'}
                  >
                    {expandedTopicId === topic._id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{expandedTopicId === topic._id ? 'Hide Cards' : 'View Cards'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTopicId(topic._id);
                      setCardFront('');
                      setCardBack('');
                      setShowCardModal(true);
                    }}
                    className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 px-3 py-2 border border-indigo-500/10 rounded-xl transition-all cursor-pointer font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Card</span>
                  </button>
                  
                  <button
                    disabled={topic.cardCount === 0}
                    onClick={() => navigate(`/topics/${topic._id}/revise`)}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all border shadow-sm ${
                      topic.cardCount === 0
                        ? 'bg-slate-950 border-slate-905 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-indigo-500 hover:bg-indigo-600 active:scale-95 border-indigo-600 text-white cursor-pointer shadow-indigo-500/5'
                    }`}
                    title={topic.cardCount === 0 ? 'Add flashcards to revise' : 'Revise Flashcards'}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Revise</span>
                  </button>

                  <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

                  <button
                    onClick={() => handleDeleteTopic(topic._id)}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-505 hover:text-rose-455 transition-colors cursor-pointer"
                    title="Delete Topic"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Flashcard Drawer List */}
              {expandedTopicId === topic._id && (
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-950/40 ml-0 md:ml-10 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Flashcards List</h4>
                    <span className="text-[10px] text-slate-505 font-semibold">{cards.length} cards found</span>
                  </div>

                  {cardsLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : cards.length === 0 ? (
                    <p className="text-xs text-slate-500 py-1">No flashcards in this topic. Click "Add Card" to create one.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {cards.map((card) => (
                        <div
                          key={card._id}
                          className="flex items-center justify-between bg-slate-900/30 border border-slate-800/80 p-3 rounded-lg hover:border-slate-700/80 transition-all group/card"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-xs font-bold text-slate-205 truncate" title={card.front}>
                              <span className="text-indigo-400 font-semibold uppercase text-[9px] mr-1.5 border border-indigo-505/25 px-1 rounded bg-indigo-500/5">Q</span>
                              {card.front}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 truncate" title={card.back}>
                              <span className="text-emerald-400 font-semibold uppercase text-[9px] mr-1.5 border border-emerald-505/25 px-1 rounded bg-emerald-500/5">A</span>
                              {card.back}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card._id, topic._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-455 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer opacity-0 group-hover/card:opacity-100 focus:opacity-100 shrink-0"
                            title="Delete Card"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowTopicModal(false)}></div>
          
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 z-10 animate-scale-up relative">
            <button
              onClick={() => setShowTopicModal(false)}
              className="absolute top-4 right-4 text-slate-505 hover:text-slate-350 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add New Topic</h3>
            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Topic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton's Third Law, Photosynthesis Phase 1"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Summarize the core topics or chapters covered..."
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-955 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Create Topic
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Flashcard Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-955/80 backdrop-blur-sm" onClick={() => { setShowCardModal(false); setSelectedTopicId(null); }}></div>
          
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-805 p-6 z-10 animate-scale-up relative">
            <button
              onClick={() => { setShowCardModal(false); setSelectedTopicId(null); }}
              className="absolute top-4 right-4 text-slate-505 hover:text-slate-350 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add Flashcard</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Front Side (Question / Concept / Formula)
                </label>
                <textarea
                  placeholder="e.g. What is the derivative of sin(x)?"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-955 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all resize-none"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Back Side (Answer / Explanation / Definition)
                </label>
                <textarea
                  placeholder="e.g. cos(x)"
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-955 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Add Flashcard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
