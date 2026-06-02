<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Performance & Smooth Scrolling Clean Code Guidelines

To prevent UI lag and maintain a constant 60fps experience, all future agents MUST strictly adhere to the following architectural rules:

1. **Viewport-Aware Animation Execution**:
   - Any component that renders on a `<canvas>` (2D or WebGL) or runs a continuous `requestAnimationFrame` loop **must** be wrapped in a native browser `IntersectionObserver` or Page Visibility listener.
   - Automatically pause the loop completely when the element is off-screen, ensuring it consumes **0% CPU** when scrolled out of view.

2. **Zero String and Regex Parsing inside Animation Frame Loops**:
   - Avoid executing string manipulation, regular expressions (`hex.match`), or conversion routines (like hex to RGB) within high-frequency active frames.
   - Pre-parse all input properties (such as color hex arrays) into raw numeric `{ r, g, b }` objects once on mount or property change.
   - Utilize direct arithmetic numerical interpolation inside the transition loops instead of heavy processing structures.

3. **Smooth Scroll Discipline**:
   - The application relies on `Lenis` (via [SmoothScrollProvider](file:///c:/laragon/www/phishing-expert-system/frontend/src/components/motion/SmoothScrollProvider.tsx)) for unified, smooth page kinetics.
   - **Do NOT** install or load parallel scrolling listeners, custom wheel monitors, or heavy GSAP ScrollTrigger loops that duplicate thread calculations and choke the main thread.

