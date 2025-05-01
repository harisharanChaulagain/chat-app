import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async (formData: LoginData) => {
      const { data } = await api.post('/user/login', formData);
      return data;
    },
  });
};
