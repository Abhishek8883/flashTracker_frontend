import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useGetFlashcardsByTopicQuery, useIncrementRevisionMutation } from '../store/apiSlice';
import { ChevronLeft, ChevronRight, RotateCw, PartyPopper, CheckCircle, ArrowLeft, Keyboard } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RevisionWindow = () => {
  const { id: topicId } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: cards = [], isLoading: loading } = useGetFlashcardsByTopicQuery(topicId, { skip: !topicId });

  // Mutations
  const [incrementRevision] = useIncrementRevisionMutation();

  // Find current topic in cache across all topics queries
  const currentTopic = useAppSelector((state) => {
    const queries = state.api.queries;
    for (const key in queries) {
      if (key.startsWith('getTopicsBySubject') && queries[key]?.data) {
        const found = queries[key].data.find((t) => t._id === topicId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  });

  // Interactive slide state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const cardRef = useRef(null);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, currentIndex, isFlipped, isCompleted]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      // Wait for flip back animation before sliding (optional delay but state change works)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 150);
    }
  };



  const handleFinish = async () => {
    if (!topicId) return;
    try {
      await incrementRevision(topicId).unwrap();
      setIsCompleted(true);
      // Play premium confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#a855f7', '#3b82f6', '#10b981'],
      });
    } catch (err) {
      console.error('Failed to increment revision count:', err);
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-400">This topic has no flashcards to revise.</p>
        {currentTopic && (
          <Link to={`/subjects/${currentTopic.subjectId}`} className="text-indigo-400 hover:underline inline-flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Subject Page
          </Link>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-6 min-h-[75vh] flex flex-col justify-center animate-fade-in">
      
      {/* Active Study Mode Header */}
      {!isCompleted && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentTopic) navigate(`/subjects/${currentTopic.subjectId}`);
              else navigate('/');
            }}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Study Session</span>
          </button>
          
          <div className="flex items-center space-x-1 text-xs text-slate-500 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg select-none">
            <Keyboard className="h-3.5 w-3.5" />
            <span>Use Left/Right & Space keys</span>
          </div>
        </div>
      )}

      {/* Completion View */}
      {isCompleted ? (
        <div className="glass-panel border-indigo-500/20 rounded-2xl p-10 text-center space-y-6 relative overflow-hidden animate-scale-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl w-fit mx-auto text-emerald-400">
            <PartyPopper className="h-10 w-10 fill-current" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Revision Complete!</h2>
            <p className="text-sm text-slate-400">
              Amazing job. You successfully reviewed all <span className="font-semibold text-indigo-400">{cards.length}</span> cards in this topic.
            </p>
          </div>

          <div className="py-4 border-t border-b border-slate-855 max-w-xs mx-auto flex items-center justify-between text-sm">
            <span className="text-slate-400 font-semibold">Total Revisions:</span>
            <span className="text-white font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
              {currentTopic ? currentTopic.revisionCount + 1 : 1}
            </span>
          </div>

          <button
            onClick={() => {
              if (currentTopic) navigate(`/subjects/${currentTopic.subjectId}`);
              else navigate('/');
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
          >
            Go Back to Subject Details
          </button>
        </div>
      ) : (
        /* Card Study Slider Screen */
        <div className="space-y-6">
          {/* Card Meta details */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>
              Topic: <span className="text-slate-200">{currentTopic?.name || 'Loading...'}</span>
            </span>
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Interactive Flip Card (3D Mechanics) */}
          <div
            ref={cardRef}
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 w-full h-[320px] cursor-pointer"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Panel */}
              <div className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between backface-hidden select-none">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    Front / Question
                  </span>
                </div>

                {/* Middle Content */}
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-100 tracking-wide">
                    {currentCard.front}
                  </p>
                </div>

                {/* Footer Tip */}
                <div className="flex justify-center items-center text-slate-500 text-xs font-semibold space-x-1.5">
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Click card to reveal answer</span>
                </div>
              </div>

              {/* Back Panel */}
              <div className="absolute inset-0 bg-slate-900 border border-indigo-500/35 rounded-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 select-none">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    Back / Answer
                  </span>
                </div>

                {/* Middle Content */}
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-base md:text-lg font-medium leading-relaxed text-slate-200">
                    {currentCard.back}
                  </p>
                </div>

                {/* Footer Tip */}
                <div className="flex justify-center items-center text-indigo-400 text-xs font-semibold space-x-1.5">
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Click card to show question</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center justify-center p-3 border border-slate-805 rounded-xl transition-all ${
                currentIndex === 0
                  ? 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed opacity-50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-355 cursor-pointer hover:border-slate-700/80 active:scale-95'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Slider Dots */}
            <div className="flex items-center space-x-1.5">
              {cards.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-800'
                  }`}
                ></div>
              ))}
            </div>

            {/* Next or Finish Button */}
            {currentIndex === cards.length - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border border-emerald-600 active:scale-95 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Finish Revision</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center justify-center p-3 bg-slate-900 hover:bg-slate-800 text-slate-355 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
