import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

const SolarFrame = ({ vibrationIntensity = 0, isKondaas = false, windSpeed = 0, cellColor = "#051025" }) => {
    const upperStructureRef = useRef();

    useFrame((state) => {
        if (upperStructureRef.current && vibrationIntensity > 0) {
            // Complex vibration: visual shaking (Panel only)
            const time = state.clock.getElapsedTime();
            const shake = vibrationIntensity * 0.0005;
            upperStructureRef.current.rotation.z = Math.sin(time * 40) * (shake * 0.5);
            upperStructureRef.current.rotation.x = Math.sin(time * 55) * (shake * 0.2); // slight twist
            // upperStructureRef.current.position.x = Math.sin(time * 30) * shake; // Keep position mostly stable relative to legs
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
        const frontRot = isFrontDetached ? [0.4, 0, (index - 1) * 0.2] : [0, 0, 0];
        const backRot = isBackDetached ? [-0.4, 0, (index - 1) * 0.2] : [0, 0, 0];

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
                    <group position={[0, frontLegHeight, 1]} rotation={frontRot}>
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
                    <group position={[0, backLegHeight, -1]} rotation={backRot}>
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
        <div className="w-full h-full">
            <Canvas>
                {/* Lower camera angle for more dramatic look */}
                <PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={45} />
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
