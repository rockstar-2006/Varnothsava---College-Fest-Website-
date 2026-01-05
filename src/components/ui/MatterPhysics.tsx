"use client";

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function MatterPhysics() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);

    useEffect(() => {
        if (!sceneRef.current) return;

        // Matter.js setup
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

        const engine = Engine.create();
        engineRef.current = engine;
        const world = engine.world;
        engine.gravity.y = 0.2; // Low gravity for floating feel

        const width = window.innerWidth;
        const height = window.innerHeight;

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: 'transparent',
            }
        });

        Render.run(render);

        const runner = Runner.create();
        Runner.run(runner, engine);

        // Create scattered festive tech shapes
        const shapes = [];
        const colors = ['#10b981', '#fbbf24', '#ffffff', '#34d399'];
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * width;
            const y = Math.random() * -height;
            const size = Math.random() * 15 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];

            if (i % 3 === 0) {
                // Triangles
                shapes.push(Bodies.polygon(x, y, 3, size, {
                    render: { fillStyle: `${color}22`, strokeStyle: `${color}99`, lineWidth: 2 }
                }));
            } else if (i % 3 === 1) {
                // Squares
                shapes.push(Bodies.rectangle(x, y, size, size, {
                    chamfer: { radius: 3 },
                    render: { fillStyle: `${color}11`, strokeStyle: color, lineWidth: 1 }
                }));
            } else {
                // Pentagons
                shapes.push(Bodies.polygon(x, y, 5, size, {
                    render: { fillStyle: 'transparent', strokeStyle: color, lineWidth: 2 }
                }));
            }
        }

        // Invisible floor & walls
        const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
        const leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
        const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });

        Composite.add(world, [...shapes, ground, leftWall, rightWall]);

        // Add mouse control
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        Composite.add(world, mouseConstraint);
        render.mouse = mouse;

        // Cleanup
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, []);

    return <div ref={sceneRef} className="absolute inset-0 pointer-events-none z-0" />;
}
