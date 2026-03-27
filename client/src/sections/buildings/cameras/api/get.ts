import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface ICamera {
  id: number;
  object_card_id: number;
  name: string;
  camera_ip: string;
  camera_login: string;
  created_at: string;
  updated_at: string;
  status: 'online' | 'offline' | 'unknown';
}

export const getCamerasByBuilding = (objectCardId: string): Promise<{ data: ICamera[] }> =>
  axiosInstance.get(`/object-cards/${objectCardId}/cameras`).then((res) => res.data);

export const useGetCamerasByBuilding = (objectCardId: string | undefined) =>
  useQuery({
    queryKey: ['cameras', objectCardId],
    queryFn: () => getCamerasByBuilding(objectCardId!),
    enabled: !!objectCardId,
  });
