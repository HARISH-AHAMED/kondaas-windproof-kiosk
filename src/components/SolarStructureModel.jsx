import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

// A component to dynamically adjust camera FOV based on aspect ratio
// This prevents the 3D model from zooming incorrectly in wide/fullscreen Kiosk displays
const ResponsiveCamera = () => {
    const { camera, size } = useThree();

    useEffect(() => {
        // Calculate aspect ratio
        const aspect = size.width / size.height;

        // Base FOV for standard aspect ratios
        let fov = 45;

        // If the screen is narrow (e.g. 16:9 fullscreen on half width -> 8:9 -> aspect 0.88)
        // Set a much more aggressive FOV adjustment so it never clips horizontally
        if (aspect < 1.2) {
            // Push FOV wider to squeeze the model into narrow columns
            fov = 45 * (1.2 / aspect);
        }

        // Cap FOV to avoid extreme distortion, then update
        camera.fov = Math.min(85, Math.max(35, fov));
        camera.updateProjectionMatrix();

    }, [size, camera]);

    // Pulled the camera position back slightly more from z:5.5 to z:6.5 to give breathing room
    return <PerspectiveCamera makeDefault position={[0, 1.5, 6.5]} fov={45} />;
};

export const SolarFrame = ({ vibrationIntensity = 0, isKondaas = false, windSpeed = 0, cellColor = "#051025" }) => {
    const upperStructureRef = useRef();

    useFrame((state) => {
        if (upperStructureRef.current) {
            if (vibrationIntensity > 0) {
                // Complex vibration: visual shaking (Panel only)
                const time = state.clock.getElapsedTime();
                const shake = vibrationIntensity * 0.0005;
                upperStructureRef.current.rotation.z = Math.sin(time * 40) * (shake * 0.5);
                upperStructureRef.current.rotation.x = Math.sin(time * 55) * (shake * 0.2); // slight twist
            } else {
                // Reset to pristine state when wind is 0
                upperStructureRef.current.rotation.set(0, 0, 0);
            }
        }
    });

    // Dimensions
    const legRadius = isKondaas ? 0.08 : 0.04;
    const frontLegHeight = 1.2;
    const backLegHeight = 2.2;
    const legColor = isKondaas ? "#d0d0d0" : "#a0a0a0";
    const baseSize = [0.4, 0.2, 0.4];

    // Helper for a leg pair (Front + Back)
    // index: 0=Left, 1=Middle, 2=Right
    const LegComponent = ({ xOffset, index }) => {
        // Sequential Detachment Logic (Local Only)
        // 90 km/h: Front Left
        // 95 km/h: Front Right
        // 100 km/h: Back Left
        // 105 km/h: Back Right
        // 110 km/h: Middle Front
        // 115 km/h: Middle Back
        let isFrontDetached = false;
        let isBackDetached = false;

        if (!isKondaas) {
            // Front Legs
            if (index === 0 && windSpeed > 90) isFrontDetached = true;
            if (index === 2 && windSpeed > 95) isFrontDetached = true;
            if (index === 1 && windSpeed > 110) isFrontDetached = true;

            // Back Legs
            if (index === 0 && windSpeed > 100) isBackDetached = true;
            if (index === 2 && windSpeed > 105) isBackDetached = true;
            if (index === 1 && windSpeed > 115) isBackDetached = true;
        }

        // Random-ish swing angle for detached legs
        const targetFrontRot = isFrontDetached ? [0.4, 0, (index - 1) * 0.2] : [0, 0, 0];
        const targetBackRot = isBackDetached ? [-0.4, 0, (index - 1) * 0.2] : [0, 0, 0];

        const frontLegRef = useRef();
        const backLegRef = useRef();

        useFrame((state, delta) => {
            if (windSpeed === 0) {
                // Force an explicit hard-reset of the object rotation when wind drops to 0
                // This bypasses any lerp desyncs caused by the parent CSS opacity transitions
                if (frontLegRef.current) frontLegRef.current.rotation.set(0, 0, 0);
                if (backLegRef.current) backLegRef.current.rotation.set(0, 0, 0);
                return;
            }

            // Add vibration to the legs based on vibrationIntensity 
            // even before they detach, creating physical tension visible in the scope.
            const time = state.clock.getElapsedTime();
            // Scale shake based on component. Kondaas structures shake much less natively.
            const shakeBase = vibrationIntensity * 0.0003;
            const shakeX = Math.sin(time * 60 + index) * shakeBase;
            const shakeZ = Math.cos(time * 50 + index) * shakeBase;

            const targetFrontX = targetFrontRot[0] + (isFrontDetached ? 0 : shakeX);
            const targetFrontZ = targetFrontRot[2] + (isFrontDetached ? 0 : shakeZ);

            const targetBackX = targetBackRot[0] + (isBackDetached ? 0 : shakeX);
            const targetBackZ = targetBackRot[2] + (isBackDetached ? 0 : shakeZ);

            // Smoothly interpolate current rotation to target rotation
            const lerpFactor = 10 * delta; // Adjust speed of snap-back

            if (frontLegRef.current) {
                frontLegRef.current.rotation.x += (targetFrontX - frontLegRef.current.rotation.x) * lerpFactor;
                frontLegRef.current.rotation.y += (targetFrontRot[1] - frontLegRef.current.rotation.y) * lerpFactor;
                frontLegRef.current.rotation.z += (targetFrontZ - frontLegRef.current.rotation.z) * lerpFactor;
            }

            if (backLegRef.current) {
                backLegRef.current.rotation.x += (targetBackX - backLegRef.current.rotation.x) * lerpFactor;
                backLegRef.current.rotation.y += (targetBackRot[1] - backLegRef.current.rotation.y) * lerpFactor;
                backLegRef.current.rotation.z += (targetBackZ - backLegRef.current.rotation.z) * lerpFactor;
            }
        });

        return (
            <group position={[xOffset, 0, 0]}>
                {/* Front Leg System */}
                <group>
                    {/* Footing (Static) */}
                    <mesh position={[0, 0.1, 1]}>
                        <boxGeometry args={baseSize} />
                        <meshStandardMaterial color="#999" roughness={0.9} />
                    </mesh>
                    {/* Leg (Pivots from Top) */}
                    <group ref={frontLegRef} position={[0, frontLegHeight, 1]}>
                        <mesh position={[0, -frontLegHeight / 2, 0]}>
                            <cylinderGeometry args={[legRadius, legRadius, frontLegHeight, 16]} />
                            <meshStandardMaterial color={legColor} metalness={0.6} roughness={0.4} />
                        </mesh>
                    </group>
                </group>

                {/* Back Leg System */}
                <group>
                    {/* Footing (Static) */}
                    <mesh position={[0, 0.1, -1]}>
                        <boxGeometry args={baseSize} />
                        <meshStandardMaterial color="#999" roughness={0.9} />
                    </mesh>
                    {/* Leg (Pivots from Top) */}
                    <group ref={backLegRef} position={[0, backLegHeight, -1]}>
                        <mesh position={[0, -backLegHeight / 2, 0]}>
                            <cylinderGeometry args={[legRadius, legRadius, backLegHeight, 16]} />
                            <meshStandardMaterial color={legColor} metalness={0.6} roughness={0.4} />
                        </mesh>
                    </group>
                </group>
            </group>
        );
    };

    return (
        <group>
            {/* Legs are OUTSIDE the vibrating group to stay static (until detached) */}
            <LegComponent xOffset={-1.8} index={0} />
            <LegComponent xOffset={0} index={1} />
            <LegComponent xOffset={1.8} index={2} />

            {/* Vibrating Upper Structure (Rails + Panel) */}
            <group ref={upperStructureRef}>
                {/* Rails (connecting legs) */}
                {/* Front Rail */}
                <mesh position={[0, frontLegHeight, 1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[isKondaas ? 0.08 : 0.05, isKondaas ? 0.08 : 0.05, 4.2, 8]} />
                    <meshStandardMaterial color={legColor} metalness={0.7} />
                </mesh>
                {/* Back Rail */}
                <mesh position={[0, backLegHeight, -1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[isKondaas ? 0.08 : 0.05, isKondaas ? 0.08 : 0.05, 4.2, 8]} />
                    <meshStandardMaterial color={legColor} metalness={0.7} />
                </mesh>

                {/* Solar Panel Array (4 Individual Panels) */}
                <group position={[0, (frontLegHeight + backLegHeight) / 2 + 0.1, 0]} rotation={[0.46, 0, 0]}>

                    {/* Reusable Single Panel Component */}
                    {[-1.5, -0.5, 0.5, 1.5].map((xPos, idx) => (
                        <group key={idx} position={[xPos, 0, 0]}>
                            {/* Frame */}
                            <mesh position={[0, 0, 0]}>
                                <boxGeometry args={[0.98, 0.05, 2.3]} />
                                <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
                            </mesh>

                            {/* Cells Background (Silicon) */}
                            <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[0.92, 2.2]} />
                                <meshStandardMaterial color={cellColor} roughness={0.2} metalness={0.6} />
                            </mesh>

                            {/* Cell Grid Lines (White transparency) */}
                            <mesh position={[0, 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[0.92, 2.2, 6, 12]} /> {/* 6x12 grid of cells */}
                                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
                            </mesh>

                            {/* Busbars (Silver lines) */}
                            <mesh position={[-0.2, 0.028, 0]}>
                                <boxGeometry args={[0.004, 0.001, 2.2]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>
                            <mesh position={[0, 0.028, 0]}>
                                <boxGeometry args={[0.004, 0.001, 2.2]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>
                            <mesh position={[0.2, 0.028, 0]}>
                                <boxGeometry args={[0.004, 0.001, 2.2]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>

                            {/* Glass Top (Reflective) */}
                            <mesh position={[0, 0.03, 0]}>
                                <boxGeometry args={[0.98, 0.01, 2.3]} />
                                <meshStandardMaterial
                                    color="#aaccff" // Standard Blue Reflection
                                    transparent
                                    opacity={0.15}
                                    metalness={0.95}
                                    roughness={0.05}
                                />
                            </mesh>
                        </group>
                    ))}

                </group>
            </group>
        </group>
    );
};

const SolarStructureModel = ({ vibration = 0, isKondaas = false, windSpeed = 0, cellColor }) => {
    return (
        <div className="w-full h-full relative">
            <Canvas>
                {/* Dynamic Camera that locks field of view to container boundary */}
                <ResponsiveCamera />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <SolarFrame vibrationIntensity={vibration} isKondaas={isKondaas} windSpeed={windSpeed} cellColor={cellColor} />

                <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default SolarStructureModel;
