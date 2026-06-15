import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetPinnedFlashcardsQuery, useTogglePinFlashcardMutation } from '../store/apiSlice';
import { Bookmark, RotateCw, BookmarkMinus, Folder } from 'lucide-react';

export const PinnedCards = () => {
  // Queries
  const { data: pinnedList = [], isLoading: loading } = useGetPinnedFlashcardsQuery();

  // Mutations
  const [togglePinFlashcard] = useTogglePinFlashcardMutation();

  // Track flip states for individual cards by ID
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleUnpin = async (id, e) => {
    e.stopPropagation(); // Stop click from triggering flip
    if (window.confirm('Are you sure you want to unpin this flashcard? It will be removed from this section.')) {
      try {
        await togglePinFlashcard({ id, isPinned: false }).unwrap();
      } catch (err) {
        console.error('Failed to unpin card:', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 text-sm text-slate-450">
        <Link to="/" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Pinned Cards</span>
      </div>

      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center space-x-3">
        <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl text-yellow-500">
          <Bookmark className="h-5.5 w-5.5 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Pinned Flashcards</h1>
          <p className="text-xs text-slate-450 mt-1">Review your flagged cards across all topics and subjects in one place.</p>
        </div>
      </div>

      {loading && pinnedList.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pinnedList.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <Bookmark className="h-12 w-12 text-slate-650 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-350">No pinned cards</h3>
          <p className="text-sm text-slate-550 mt-1.5 max-w-sm mx-auto">
            You haven't pinned any flashcards yet. While revising a topic, click the bookmark/pin icon to collect cards here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <span>Start Learning</span>
          </Link>
        </div>
      ) : (
        /* Pinned Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pinnedList.map((card) => {
            const isFlipped = !!flippedCards[card._id];
            
            // Extract nested names safely
            const topicObj = typeof card.topicId === 'object' && card.topicId ? card.topicId : null;
            const topicName = topicObj?.name || 'Unknown Topic';
            const subjectName = topicObj?.subjectId?.name || 'Unknown Subject';

            return (
              <div
                key={card._id}
                onClick={() => toggleFlip(card._id)}
                className="perspective-1000 w-full h-[240px] cursor-pointer"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front Face */}
                  <div className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backface-hidden select-none">
                    {/* Header: Context + Unpin */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-450 font-bold tracking-wide">
                        <Folder className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[150px]" title={`${subjectName} > ${topicName}`}>
                          {subjectName} &gt; {topicName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleUnpin(card._id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-450 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Remove Pin"
                      >
                        <BookmarkMinus className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center text-center px-2">
                      <p className="text-sm font-bold leading-relaxed text-slate-100 line-clamp-4">
                        {card.front}
                      </p>
                    </div>

                    {/* Footer Tip */}
                    <div className="flex justify-center items-center text-slate-500 text-[10px] font-semibold space-x-1.5">
                      <RotateCw className="h-3 w-3" />
                      <span>Click to reveal answer</span>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 bg-slate-900 border border-indigo-500/25 rounded-2xl p-5 flex flex-col justify-between backface-hidden rotate-y-180 select-none">
                    {/* Header: Context + Unpin */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold tracking-wide">
                        <Folder className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {subjectName} &gt; {topicName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleUnpin(card._id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-450 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Remove Pin"
                      >
                        <BookmarkMinus className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center text-center px-2">
                      <p className="text-xs font-semibold leading-relaxed text-slate-200 line-clamp-5">
                        {card.back}
                      </p>
                    </div>

                    {/* Footer Tip */}
                    <div className="flex justify-center items-center text-indigo-400 text-[10px] font-semibold space-x-1.5">
                      <RotateCw className="h-3 w-3" />
                      <span>Click to show question</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
