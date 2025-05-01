import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  return useMutation({
    mutationFn: async (formData: SignupData) => {
      const { data } = await api.post('/user/register', formData);
      return data;
    },
  });
};
