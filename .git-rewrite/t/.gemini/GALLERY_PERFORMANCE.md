## 🚀 Performance & Flow Update

### ⚡ **Lag & Hang Fixes**

1.  **Hardware Acceleration Enabled** 🏎️
    - Added `force3D: true` to all GSAP animations. This forces the browser to use the GPU (Graphics Card) instead of the CPU for moving images.
    - Added `will-change: transform` to the image containers. This tells the browser *ahead of time* to prepare these elements for movement, eliminating the split-second "hang" when you click.

2.  **Animation Flow Refinement** 🌊
    - **Changed Easing**: Switched from `power4.out` (which slows down very heavily at the end) to `power2.out`. This creates a much more uniform, "flowy", and responsive movement.
    - **Optimized Timing**: Adjusted duration to `1.0s` to balance smoothness with responsiveness. It won't feel like it's dragging anymore.

3.  **Sync Issue Resolved** 🔄
    - Switched from `useEffect` to `useLayoutEffect`. This ensures the animation calculations happen *before* the browser paints the frame, preventing any visual "snap" or glitch at the start of the movement.

### 🎮 **Try It Now**

Go to **[http://localhost:3000/gallery](http://localhost:3000/gallery)**.
- Click the arrows.
- The movement should be butter-smooth without that initial "stutter".
- The flow is continuous and aligned.

Let me know if it feels better! 🚀
