'use client';

import {useCallback, useState} from 'react';
import {Section, Question} from '@/lib/types/database';

interface UseFormBuilderReturn {
  sections: Section[];
  activeSection: string | null;
  activeQuestion: string | null;
  setActiveSection: (id: string | null) => void;
  setActiveQuestion: (id: string | null) => void;
  addSection: (
    section: Omit<Section, 'id' | 'created_at' | 'updated_at'>
  ) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
  addQuestion: (
    sectionId: string,
    question: Omit<Question, 'id' | 'created_at' | 'updated_at'>
  ) => void;
  updateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  reorderQuestions: (
    sectionId: string,
    startIndex: number,
    endIndex: number
  ) => void;
}

export function useFormBuilder(): UseFormBuilderReturn {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const addSection = useCallback(
    (section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) => {
      setSections((prev) => [
        ...prev,
        {
          ...section,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Section,
      ]);
    },
    []
  );

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? {...section, ...updates} : section
      )
    );
  }, []);

  const removeSection = useCallback(
    (id: string) => {
      setSections((prev) => prev.filter((section) => section.id !== id));
      if (activeSection === id) {
        setActiveSection(null);
      }
    },
    [activeSection]
  );

  const addQuestion = useCallback(
    (
      sectionId: string,
      question: Omit<Question, 'id' | 'created_at' | 'updated_at'>
    ) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          const questions = Array.isArray(section.questions)
            ? section.questions
            : [];
          return {
            ...section,
            questions: [
              ...questions,
              {
                ...question,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Question,
            ],
          };
        })
      );
    },
    []
  );

  const updateQuestion = useCallback(
    (sectionId: string, questionId: string, updates: Partial<Question>) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          const questions = Array.isArray(section.questions)
            ? section.questions
            : [];
          return {
            ...section,
            questions: questions.map((q: Question) =>
              q.id === questionId ? {...q, ...updates} : q
            ),
          };
        })
      );
    },
    []
  );

  const removeQuestion = useCallback(
    (sectionId: string, questionId: string) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          const questions = Array.isArray(section.questions)
            ? section.questions
            : [];
          return {
            ...section,
            questions: questions.filter((q: Question) => q.id !== questionId),
          };
        })
      );
      if (activeQuestion === questionId) {
        setActiveQuestion(null);
      }
    },
    [activeQuestion]
  );

  const reorderSections = useCallback(
    (startIndex: number, endIndex: number) => {
      setSections((prev) => {
        const result = Array.from(prev);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result.map((section, index) => ({
          ...section,
          order: index,
        }));
      });
    },
    []
  );

  const reorderQuestions = useCallback(
    (sectionId: string, startIndex: number, endIndex: number) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          const questions = Array.isArray(section.questions)
            ? section.questions
            : [];
          const result = Array.from(questions);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            ...section,
            questions: result.map((q: Question, index) => ({
              ...q,
              order: index,
            })),
          };
        })
      );
    },
    []
  );

  return {
    sections,
    activeSection,
    activeQuestion,
    setActiveSection,
    setActiveQuestion,
    addSection,
    updateSection,
    removeSection,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderSections,
    reorderQuestions,
  };
}
