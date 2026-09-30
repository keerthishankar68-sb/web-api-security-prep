import { useQuery } from '@tanstack/react-query';
import type { QuestionData } from '../types/question';

export function useQuestions() {
  return useQuery<QuestionData[]>({
    queryKey: ['questions'],
    queryFn: async () => {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const url = `${cleanBase}data/questions.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load questions data: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
