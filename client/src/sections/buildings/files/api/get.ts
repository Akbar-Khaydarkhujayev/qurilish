import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IFile {
  id: number;
  object_card_id: number;
  path: string;
  file_name: string;
  description: string | null;
  object_name: string;
  card_number: string;
  created_at: string;
  updated_at: string;
}

export interface IFilesResponse {
  files: IFile[];
  count: number;
}

export const getFilesByObjectCard = (objectCardId: string): Promise<IFilesResponse> =>
  axiosInstance.get(`/object-cards/${objectCardId}/files`).then((res) => res.data.data);

export const useGetFilesByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['files', objectCardId],
    queryFn: () => getFilesByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
