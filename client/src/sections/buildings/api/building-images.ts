import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

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
    },
  });
};
