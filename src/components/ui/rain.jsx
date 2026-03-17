import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function RainBackground({
  className,
  children,
  count = 150,
  intensity = 1,
  angle = 15,
  color = "rgba(174, 194, 224, 0.5)",
  lightning = true,
  cloudSpeed = 1,     // 1 = normal, higher = faster
  storminess = 0      // 0 = clear/gloomy, 1 = full storm (pitch black, frequent lightning)
}) {
  /* Refactor for dynamic updates without re-init */
  const configRef = useRef({ count, intensity, angle, color, lightning, cloudSpeed, storminess });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const flashRef = useRef(null);

  // Update refs when props change
  useEffect(() => {
    configRef.current = { count, intensity, angle, color, lightning, cloudSpeed, storminess };
  }, [count, intensity, angle, color, lightning, cloudSpeed, storminess]);

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const flash = flashRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height
    canvas.width = width
    canvas.height = height

    let animationId
    // Initial setup based on current props (count is structural, so we might need re-init if count changes drastically, 
    // but for speed/angle drag, we want to keep drops exists)

    // We will initialize drops once. If count changes, we might ignore or simple slice/add. 
    // For this specific use case (wind drag), count is stable.

    const totalDrops = Math.floor(configRef.current.count * configRef.current.intensity)
    // We use a fixed number of drops for stability during drag

    const createDrop = layer => {
      const layerConfig = [
        { speed: 12, length: 15, opacity: 0.2 }, // back
        { speed: 18, length: 20, opacity: 0.35 }, // mid
        { speed: 25, length: 28, opacity: 0.5 }, // front
      ][layer]

      return {
        x: Math.random() * (width + 400) - 200, // wider spread for angle
        y: Math.random() * height - height,
        baseLength: layerConfig.length + Math.random() * 10,
        baseSpeed: layerConfig.speed + Math.random() * 5,
        opacity: layerConfig.opacity + Math.random() * 0.1,
        layer,
      };
    }

    const drops = []
    for (let i = 0; i < totalDrops; i++) {
      // Distribute layers
      const layer = i % 3;
      drops.push(createDrop(layer))
    }

    // Lightning
    let nextLightning = Date.now() + 3000

    const triggerLightning = (stormLevel) => {
      if (!flash) return
      // Flash intensity and duration depends on storminess? 
      // Keep it standard but frequency changes.
      flash.style.opacity = "0.8"
      setTimeout(() => {
        if (flash) flash.style.opacity = "0.3"
      }, 50)
      setTimeout(() => {
        if (flash) flash.style.opacity = "0"
      }, 150)

      // Calculate next lightning time based on storminess
      // storminess 0: 3000-8000ms
      // storminess 1: 500-2000ms
      const minDelay = 500 + (1 - stormLevel) * 2500;
      const randomDelay = Math.random() * (1500 + (1 - stormLevel) * 3500);
      nextLightning = Date.now() + minDelay + randomDelay
    }

    // Resize handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Read current config from ref
      const { angle, color, lightning, storminess, intensity } = configRef.current;
      const angleRad = (angle * Math.PI) / 180;

      // Calculate global speed multiplier based on angle (steeper = faster visually usually, or just passed via prop?)
      // Actually, let's assume 'intensity' or just use angle to drive x-velocity.
      // Ideally, specific speed prop should be passed? 
      // The prompt asked for "flowing according to speed of wind". 
      // We can use 'intensity' prop as a speed multiplier if we want, or add a new 'speed' prop.
      // But for now, let's assume higher angle = higher wind = faster x movement.

      // Let's deduce an extra speed factor from the angle if it's high?
      // Or just rely on the prop 'intensity' if the user passes it mapped to wind.
      // Let's use configRef.current.intensity as a speed multiplier.
      const userSpeedMultiplier = intensity;

      // Check lightning
      if (lightning && storminess > 0 && Date.now() > nextLightning) {
        triggerLightning(storminess)
      }

      // Draw drops
      ctx.strokeStyle = color
      ctx.lineCap = "round"

      for (const drop of drops) {
        // effective speed
        const currentSpeed = drop.baseSpeed * userSpeedMultiplier;

        // Move drop
        drop.y += currentSpeed * Math.cos(angleRad); // Vertical component
        drop.x += currentSpeed * Math.sin(angleRad); // Horizontal component

        // Reset if off screen
        const isOffBottom = drop.y > height + 50;
        const isOffSide = (angle > 0 && drop.x > width + 50) || (angle < 0 && drop.x < -50);

        if (isOffBottom || isOffSide) {
          drop.y = -drop.baseLength - Math.random() * 100;
          // Respawn x at top, accounting for angle to cover the whole screen
          // If angle is positive (blowing right), we need to spawn further left to cover bottom left.
          // x = spawn range
          // Simple fix: pure random across wide range
          drop.x = Math.random() * (width + height * Math.tan(Math.abs(angleRad)) * 2 + 200) - (height * Math.tan(Math.abs(angleRad)) + 100);
        }

        // Draw
        ctx.globalAlpha = drop.opacity
        ctx.lineWidth = drop.layer === 2 ? 1.5 : drop.layer === 1 ? 1 : 0.5
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(
          drop.x + Math.sin(angleRad) * drop.baseLength,
          drop.y + Math.cos(angleRad) * drop.baseLength
        )
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    };
  }, []); // Empty dep array: only run once! Dynamic updates handled via refs.

  // Dynamic Background: Interpolate between gloomy blue and storm black
  // We can just use opacity of a black overlay based on storminess

  // Cloud/Fog Animation Speed
  // We'll use inline styles for animationDuration
  const computedCloudSpeed = 60 / (Math.max(0.1, configRef.current.cloudSpeed)); // 60s base, faster with multiplier

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{
        background: "linear-gradient(to bottom, #1e293b 0%, #334155 100%)", // Base gloomy sky
      }}>

      {/* Storm Darkening Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-black"
        style={{ opacity: configRef.current.storminess * 0.7 }} // Up to 70% black overlay
      />

      {/* Moving Cloud Layer 1 (Slow, Back) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", // Use noise as texture for now
          filter: "blur(40px) contrast(1.5)",
          backgroundSize: "600% 600%",
          animation: `moveClouds ${computedCloudSpeed * 1.5}s linear infinite`,
        }}
      />

      {/* Moving Cloud Layer 2 (Fast, Front) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 60%)",
          backgroundSize: "100% 100%",
          transform: "scale(1.5)",
          animation: `pulseClouds ${computedCloudSpeed * 0.5}s ease-in-out infinite alternate`,
        }}
      />

      {/* CSS Keyframes for clouds (injected style) */}
      <style>{`
        @keyframes moveClouds {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes pulseClouds {
            0% { opacity: 0.1; transform: scale(1.4); }
            100% { opacity: 0.3; transform: scale(1.6); }
        }
      `}</style>

      <canvas 
        ref={canvasRef} 
        className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-1000",
            configRef.current.storminess <= 0 ? "opacity-0" : "opacity-100"
        )} 
      />
      {/* Lightning flash overlay */}
      {lightning && (
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-blue-100 opacity-0 transition-opacity duration-100" />
      )}
      {/* Fog/mist at bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(20, 25, 35, 0.8) 0%, transparent 100%)",
        }} />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(8,10,15,0.7) 100%)",
        }} />
      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

export default function RainBackgroundDemo() {
  return <RainBackground />;
}
