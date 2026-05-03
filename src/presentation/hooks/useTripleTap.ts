import { useEffect, useRef } from 'react';

export function useTripleTap(callback: () => void, delay: number = 300) {
    const lastTap = useRef<number>(0);
    const tapCount = useRef<number>(0);

    useEffect(() => {
        const handleTouch = () => {
            const now = Date.now();
            if (now - lastTap.current < delay) {
                tapCount.current += 1;
            } else {
                tapCount.current = 1;
            }

            lastTap.current = now;

            if (tapCount.current === 3) {
                callback();
                tapCount.current = 0;
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '~' || event.key === '²') {
                callback();
            }
        };

        window.addEventListener('touchstart', handleTouch);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [callback, delay]);
}
