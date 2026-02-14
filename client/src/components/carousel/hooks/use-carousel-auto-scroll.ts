import type { EmblaCarouselType } from 'embla-carousel';

import { useState, useEffect, useCallback } from 'react';

import type { UseCarouselAutoPlayReturn } from '../types';

// ----------------------------------------------------------------------

export function useCarouselAutoScroll(mainApi?: EmblaCarouselType): UseCarouselAutoPlayReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const onClickAutoplay = useCallback(
    (callback: () => void) => {
      const autoScroll = mainApi?.plugins()?.autoScroll as any;
      if (!autoScroll) return;

      const resetOrStop =
        autoScroll.options.stopOnInteraction === false ? autoScroll.reset : autoScroll.stop;

      resetOrStop();
      callback();
    },
    [mainApi]
  );

  const onTogglePlay = useCallback(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll as any;
    if (!autoScroll) return;

    const playOrStop = autoScroll.isPlaying() ? autoScroll.stop : autoScroll.play;
    playOrStop();
  }, [mainApi]);

  useEffect(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll as any;
    if (!autoScroll || !mainApi) return;

    setIsPlaying(autoScroll.isPlaying());
    mainApi
      .on('autoScroll:play' as any, () => setIsPlaying(true))
      .on('autoScroll:stop' as any, () => setIsPlaying(false))
      .on('reInit', () => setIsPlaying(false));
  }, [mainApi]);

  return { isPlaying, onTogglePlay, onClickAutoplay };
}
