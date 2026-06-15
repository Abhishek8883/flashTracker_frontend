import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'https://flashtraker-backend.onrender.com',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Subject', 'Topic', 'Flashcard', 'PinnedFlashcard'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/api/auth/me',
    }),

    // Subjects
    getSubjects: builder.query({
      query: () => '/api/subjects',
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation({
      query: (subjectData) => ({
        url: '/api/subjects',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['Subject'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, name, description }) => ({
        url: `/api/subjects/${id}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: ['Subject'],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/api/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject', 'Topic', 'Flashcard', 'PinnedFlashcard'],
    }),

    // Topics
    getTopicsBySubject: builder.query({
      query: (subjectId) => `/api/topics/subject/${subjectId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'Topic', id: _id })),
            { type: 'Topic', id: 'LIST' },
          ]
          : [{ type: 'Topic', id: 'LIST' }],
    }),
    createTopic: builder.mutation({
      query: ({ subjectId, name, description }) => ({
        url: `/api/topics/subject/${subjectId}`,
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: ['Topic', 'Subject'],
    }),
    updateTopic: builder.mutation({
      query: ({ id, name, description, isCompleted }) => ({
        url: `/api/topics/${id}`,
        method: 'PUT',
        body: { name, description, isCompleted },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Topic', id },
        'Subject',
      ],
    }),
    incrementRevision: builder.mutation({
      query: (id) => ({
        url: `/api/topics/${id}/revise`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Topic', id },
        'Subject',
      ],
    }),
    deleteTopic: builder.mutation({
      query: (id) => ({
        url: `/api/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Topic', id },
        'Subject',
        'Flashcard',
        'PinnedFlashcard',
      ],
    }),

    // Flashcards
    getFlashcardsByTopic: builder.query({
      query: (topicId) => `/api/flashcards/topic/${topicId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'Flashcard', id: _id })),
            { type: 'Flashcard', id: 'LIST' },
          ]
          : [{ type: 'Flashcard', id: 'LIST' }],
    }),
    getPinnedFlashcards: builder.query({
      query: () => '/api/flashcards/pinned',
      providesTags: ['PinnedFlashcard'],
    }),
    createFlashcard: builder.mutation({
      query: ({ topicId, front, back }) => ({
        url: `/api/flashcards/topic/${topicId}`,
        method: 'POST',
        body: { front, back },
      }),
      invalidatesTags: ['Flashcard', 'Topic'],
    }),
    updateFlashcard: builder.mutation({
      query: ({ id, front, back }) => ({
        url: `/api/flashcards/${id}`,
        method: 'PUT',
        body: { front, back },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Flashcard', id },
        'PinnedFlashcard',
      ],
    }),
    togglePinFlashcard: builder.mutation({
      query: ({ id, isPinned }) => ({
        url: `/api/flashcards/${id}`,
        method: 'PUT',
        body: { isPinned },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Flashcard', id },
        'PinnedFlashcard',
      ],
    }),
    deleteFlashcard: builder.mutation({
      query: ({ id }) => ({
        url: `/api/flashcards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Flashcard', id },
        'PinnedFlashcard',
        'Topic',
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetTopicsBySubjectQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useIncrementRevisionMutation,
  useDeleteTopicMutation,
  useGetFlashcardsByTopicQuery,
  useGetPinnedFlashcardsQuery,
  useCreateFlashcardMutation,
  useUpdateFlashcardMutation,
  useTogglePinFlashcardMutation,
  useDeleteFlashcardMutation,
} = apiSlice;
