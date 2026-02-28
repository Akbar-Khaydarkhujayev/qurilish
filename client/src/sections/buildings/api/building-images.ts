import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IBuildingImage {
  id: number;
  object_card_id: number;
  path: string;
  file_name: string;
  sort_order: number;
  created_at: string;
}

// Get images for a building
const getBuildingImages = (objectCardId: number): Promise<IBuildingImage[]> =>
  axiosInstance.get(`/object-cards/${objectCardId}/images`).then((res) => res.data.data);

export const useGetBuildingImages = (objectCardId: number | string | undefined) =>
  useQuery({
    queryKey: ['building-images', objectCardId],
    queryFn: () => getBuildingImages(Number(objectCardId)),
    enabled: !!objectCardId,
  });

// Upload images for a building
const uploadBuildingImages = ({ objectCardId, files }: { objectCardId: number; files: File[] }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  return axiosInstance
    .post(`/object-cards/${objectCardId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const useUploadBuildingImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBuildingImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-full-details'] });
    },
  });
};

// Delete a building image
const deleteBuildingImage = (imageId: number) =>
  axiosInstance.delete(`/building-images/${imageId}`).then((res) => res.data);

export const useDeleteBuildingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBuildingImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-full-details'] });
      queryClient.invalidateQueries({ queryKey: ['building-images'] });
    },
  });
};
