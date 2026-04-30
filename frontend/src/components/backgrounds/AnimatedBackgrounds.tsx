'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

// Homepage: Flowing particles with connections (like outray.dev style)
export function HomeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: Particle[] = [];
        let mouse = { x: 0, y: 0 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.2,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, i) => {
                // Mouse interaction
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    particle.vx -= (dx / dist) * force * 0.02;
                    particle.vy -= (dy / dist) * force * 0.02;
                }

                particle.x += particle.vx;
                particle.y += particle.vy;

                // Boundary bounce
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(100, 100, 100, ${0.2 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        resize();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Gallery: Floating image frames animation
export function GalleryBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface Frame {
            x: number;
            y: number;
            size: number;
            rotation: number;
            rotationSpeed: number;
            floatOffset: number;
            floatSpeed: number;
            opacity: number;
        }

        let frames: Frame[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createFrames = () => {
            frames = [];
            const numFrames = 15;
            for (let i = 0; i < numFrames; i++) {
                frames.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 60 + 40,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.01,
                    floatOffset: Math.random() * Math.PI * 2,
                    floatSpeed: Math.random() * 0.02 + 0.01,
                    opacity: Math.random() * 0.15 + 0.05,
                });
            }
        };

        let time = 0;
        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.016;

            frames.forEach((frame) => {
                const floatY = Math.sin(time * frame.floatSpeed + frame.floatOffset) * 20;
                frame.rotation += frame.rotationSpeed;

                ctx.save();
                ctx.translate(frame.x, frame.y + floatY);
                ctx.rotate(frame.rotation);

                // Draw frame border
                ctx.strokeStyle = `rgba(255, 255, 255, ${frame.opacity})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(-frame.size / 2, -frame.size * 0.7, frame.size, frame.size * 1.4);

                // Draw inner frame
                ctx.strokeStyle = `rgba(255, 255, 255, ${frame.opacity * 0.5})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(-frame.size / 2 + 5, -frame.size * 0.7 + 5, frame.size - 10, frame.size * 1.4 - 10);

                ctx.restore();
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createFrames();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createFrames();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Articles: Floating text/document particles
export function ArticlesBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface TextParticle {
            x: number;
            y: number;
            char: string;
            speed: number;
            opacity: number;
            size: number;
        }

        let particles: TextParticle[] = [];
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]';

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const numParticles = 50;
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    speed: Math.random() * 0.5 + 0.2,
                    opacity: Math.random() * 0.15 + 0.05,
                    size: Math.random() * 16 + 12,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.y -= particle.speed;
                if (particle.y < -20) {
                    particle.y = canvas.height + 20;
                    particle.x = Math.random() * canvas.width;
                    particle.char = chars[Math.floor(Math.random() * chars.length)];
                }

                ctx.font = `${particle.size}px monospace`;
                ctx.fillStyle = `rgba(120, 120, 120, ${particle.opacity})`;
                ctx.fillText(particle.char, particle.x, particle.y);
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Projects: Floating code brackets and gears
export function ProjectsBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface Gear {
            x: number;
            y: number;
            radius: number;
            teeth: number;
            rotation: number;
            speed: number;
            opacity: number;
        }

        let gears: Gear[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createGears = () => {
            gears = [];
            const numGears = 8;
            for (let i = 0; i < numGears; i++) {
                gears.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 50 + 30,
                    teeth: Math.floor(Math.random() * 8) + 6,
                    rotation: Math.random() * Math.PI * 2,
                    speed: (Math.random() - 0.5) * 0.02,
                    opacity: Math.random() * 0.1 + 0.05,
                });
            }
        };

        const drawGear = (gear: Gear) => {
            ctx.save();
            ctx.translate(gear.x, gear.y);
            ctx.rotate(gear.rotation);

            ctx.strokeStyle = `rgba(150, 150, 150, ${gear.opacity})`;
            ctx.lineWidth = 2;

            // Draw outer circle
            ctx.beginPath();
            ctx.arc(0, 0, gear.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw teeth
            for (let i = 0; i < gear.teeth; i++) {
                const angle = (i / gear.teeth) * Math.PI * 2;
                const x1 = Math.cos(angle) * gear.radius;
                const y1 = Math.sin(angle) * gear.radius;
                const x2 = Math.cos(angle) * (gear.radius + 10);
                const y2 = Math.sin(angle) * (gear.radius + 10);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            // Draw inner circle
            ctx.beginPath();
            ctx.arc(0, 0, gear.radius * 0.3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            gears.forEach((gear) => {
                gear.rotation += gear.speed;
                drawGear(gear);
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createGears();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createGears();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Contact: Floating envelope and connection lines
export function ContactBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

        interface Node {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            radius: number;
        }

        let nodes: Node[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createNodes = () => {
            nodes = [];
            const numNodes = 20;
            for (let i = 0; i < numNodes; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                nodes.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    radius: Math.random() * 4 + 2,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw connections to mouse
            nodes.forEach((node) => {
                const dx = mouse.x - node.x;
                const dy = mouse.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Attract to mouse gently
                node.x += (node.baseX + dx * 0.05 - node.x) * 0.02;
                node.y += (node.baseY + dy * 0.05 - node.y) * 0.02;

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - dist / 1000})`;
                ctx.fill();

                // Draw connection to mouse if close enough
                if (dist < 300) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(100, 100, 100, ${0.2 * (1 - dist / 300)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // Draw center point at mouse
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();

            animationId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        resize();
        createNodes();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createNodes();
        });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Tech/Skills: Matrix-style falling code
export function TechBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        const fontSize = 14;
        let columns: number[];

        const initColumns = () => {
            const numCols = Math.floor(canvas.width / fontSize);
            columns = new Array(numCols).fill(1);
        };

        resize();
        initColumns();

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.font = `${fontSize}px monospace`;

            columns.forEach((y, i) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                ctx.fillText(char, x, y * fontSize);

                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    columns[i] = 0;
                }
                columns[i]++;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', () => {
            resize();
            initColumns();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Academia: Floating mathematical symbols and formulas
export function AcademiaBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const symbols = ['∫', '∑', '∏', 'π', '∞', 'Δ', '∇', '√', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ω', '≈', '≠', '≤', '≥', '∈', '∉', '⊆', '∪', '∩'];

        interface Symbol {
            x: number;
            y: number;
            char: string;
            size: number;
            rotation: number;
            rotSpeed: number;
            floatSpeed: number;
            floatOffset: number;
            opacity: number;
        }

        let floatingSymbols: Symbol[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createSymbols = () => {
            floatingSymbols = [];
            const numSymbols = 30;
            for (let i = 0; i < numSymbols; i++) {
                floatingSymbols.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    char: symbols[Math.floor(Math.random() * symbols.length)],
                    size: Math.random() * 30 + 20,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.02,
                    floatSpeed: Math.random() * 0.01 + 0.005,
                    floatOffset: Math.random() * Math.PI * 2,
                    opacity: Math.random() * 0.15 + 0.05,
                });
            }
        };

        let time = 0;
        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.016;

            floatingSymbols.forEach((sym) => {
                const floatY = Math.sin(time * sym.floatSpeed * 60 + sym.floatOffset) * 15;
                sym.rotation += sym.rotSpeed;

                ctx.save();
                ctx.translate(sym.x, sym.y + floatY);
                ctx.rotate(sym.rotation);
                ctx.font = `${sym.size}px serif`;
                ctx.fillStyle = `rgba(150, 150, 150, ${sym.opacity})`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sym.char, 0, 0);
                ctx.restore();
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createSymbols();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createSymbols();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Profiles Page: Connecting network nodes (social links theme)
export function ProfilesBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface Node {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;
            pulsePhase: number;
        }

        let nodes: Node[] = [];

        const colors = [
            'rgba(59, 130, 246, 0.6)',  // blue
            'rgba(168, 85, 247, 0.6)',  // purple
            'rgba(236, 72, 153, 0.6)',  // pink
            'rgba(34, 197, 94, 0.6)',   // green
            'rgba(234, 179, 8, 0.6)',   // yellow
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createNodes = () => {
            nodes = [];
            const numNodes = Math.floor((canvas.width * canvas.height) / 25000);
            for (let i = 0; i < numNodes; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 3 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() * 0.001;

            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                // Boundary wrap
                if (node.x < 0) node.x = canvas.width;
                if (node.x > canvas.width) node.x = 0;
                if (node.y < 0) node.y = canvas.height;
                if (node.y > canvas.height) node.y = 0;

                // Pulsing effect
                const pulse = Math.sin(time + node.pulsePhase) * 0.3 + 1;
                const currentRadius = node.radius * pulse;

                // Draw glow
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, currentRadius * 3
                );
                gradient.addColorStop(0, node.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.beginPath();
                ctx.arc(node.x, node.y, currentRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = node.color.replace('0.6', '0.9');
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - node.x;
                    const dy = nodes[j].y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(100, 100, 100, ${0.3 * (1 - distance / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createNodes();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createNodes();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Resume Page: Multi-Industry floating icons (Tech, Finance, Engineering, Accounting, Science)
export function ResumeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface IndustryIcon {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            rotation: number;
            rotationSpeed: number;
            opacity: number;
            industry: string;
            symbol: string;
            color: string;
        }

        let icons: IndustryIcon[] = [];

        // Industry configurations with symbols and colors
        const industries = [
            // Tech
            { industry: 'tech', symbol: '{ }', color: 'rgba(59, 130, 246, 0.7)' },      // Blue - Code brackets
            { industry: 'tech', symbol: '</>', color: 'rgba(99, 102, 241, 0.7)' },     // Indigo - HTML
            { industry: 'tech', symbol: '⚡', color: 'rgba(139, 92, 246, 0.7)' },      // Purple - Energy/Fast
            { industry: 'tech', symbol: '💻', color: 'rgba(59, 130, 246, 0.6)' },      // Blue - Computer
            { industry: 'tech', symbol: '⚙️', color: 'rgba(107, 114, 128, 0.7)' },     // Gray - Settings

            // Finance
            { industry: 'finance', symbol: '$', color: 'rgba(34, 197, 94, 0.7)' },     // Green - Dollar
            { industry: 'finance', symbol: '📈', color: 'rgba(34, 197, 94, 0.6)' },    // Green - Chart
            { industry: 'finance', symbol: '💰', color: 'rgba(234, 179, 8, 0.6)' },    // Yellow - Money bag
            { industry: 'finance', symbol: '₿', color: 'rgba(247, 147, 26, 0.7)' },    // Orange - Bitcoin
            { industry: 'finance', symbol: '%', color: 'rgba(16, 185, 129, 0.7)' },    // Emerald - Percent

            // Engineering
            { industry: 'engineering', symbol: '⚙', color: 'rgba(156, 163, 175, 0.7)' }, // Gray - Gear
            { industry: 'engineering', symbol: '🔧', color: 'rgba(107, 114, 128, 0.6)' }, // Gray - Wrench
            { industry: 'engineering', symbol: '📐', color: 'rgba(249, 115, 22, 0.6)' },  // Orange - Ruler
            { industry: 'engineering', symbol: '∫', color: 'rgba(168, 85, 247, 0.7)' },  // Purple - Integral
            { industry: 'engineering', symbol: '∆', color: 'rgba(236, 72, 153, 0.7)' },  // Pink - Delta

            // Accounting
            { industry: 'accounting', symbol: '∑', color: 'rgba(34, 197, 94, 0.7)' },    // Green - Sum
            { industry: 'accounting', symbol: '📊', color: 'rgba(59, 130, 246, 0.6)' },  // Blue - Bar chart
            { industry: 'accounting', symbol: '±', color: 'rgba(156, 163, 175, 0.7)' },  // Gray - Plus minus
            { industry: 'accounting', symbol: '÷', color: 'rgba(107, 114, 128, 0.7)' },  // Gray - Divide
            { industry: 'accounting', symbol: '=', color: 'rgba(75, 85, 99, 0.8)' },     // Dark gray - Equals

            // Science/Research
            { industry: 'science', symbol: '🔬', color: 'rgba(139, 92, 246, 0.6)' },    // Purple - Microscope
            { industry: 'science', symbol: '⚗', color: 'rgba(34, 211, 238, 0.7)' },    // Cyan - Alchemy
            { industry: 'science', symbol: '∞', color: 'rgba(168, 85, 247, 0.7)' },    // Purple - Infinity
            { industry: 'science', symbol: 'π', color: 'rgba(236, 72, 153, 0.7)' },    // Pink - Pi
            { industry: 'science', symbol: 'Ω', color: 'rgba(34, 211, 238, 0.7)' },    // Cyan - Omega

            // Healthcare/Medical
            { industry: 'medical', symbol: '⚕', color: 'rgba(239, 68, 68, 0.7)' },     // Red - Caduceus
            { industry: 'medical', symbol: '💊', color: 'rgba(236, 72, 153, 0.6)' },   // Pink - Pill
            { industry: 'medical', symbol: '+', color: 'rgba(239, 68, 68, 0.8)' },     // Red - Medical cross
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createIcons = () => {
            icons = [];
            const numIcons = Math.floor((canvas.width * canvas.height) / 20000);

            for (let i = 0; i < numIcons; i++) {
                const industryConfig = industries[Math.floor(Math.random() * industries.length)];
                icons.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 20 + 14,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.01,
                    opacity: Math.random() * 0.4 + 0.2,
                    industry: industryConfig.industry,
                    symbol: industryConfig.symbol,
                    color: industryConfig.color,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            icons.forEach((icon, i) => {
                // Update position
                icon.x += icon.vx;
                icon.y += icon.vy;
                icon.rotation += icon.rotationSpeed;

                // Boundary wrap
                if (icon.x < -50) icon.x = canvas.width + 50;
                if (icon.x > canvas.width + 50) icon.x = -50;
                if (icon.y < -50) icon.y = canvas.height + 50;
                if (icon.y > canvas.height + 50) icon.y = -50;

                // Draw glow effect
                ctx.save();
                ctx.translate(icon.x, icon.y);

                // Subtle glow
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, icon.size * 1.5);
                gradient.addColorStop(0, icon.color.replace(/[\d.]+\)$/, `${icon.opacity * 0.3})`));
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.beginPath();
                ctx.arc(0, 0, icon.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw the symbol
                ctx.rotate(icon.symbol.length <= 2 ? icon.rotation * 0.2 : 0); // Only rotate text symbols slightly
                ctx.font = `${icon.size}px Arial, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = icon.color.replace(/[\d.]+\)$/, `${icon.opacity})`);
                ctx.fillText(icon.symbol, 0, 0);

                ctx.restore();

                // Draw connecting lines between nearby icons of same industry
                for (let j = i + 1; j < icons.length; j++) {
                    if (icons[j].industry === icon.industry) {
                        const dx = icons[j].x - icon.x;
                        const dy = icons[j].y - icon.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 120) {
                            ctx.beginPath();
                            ctx.moveTo(icon.x, icon.y);
                            ctx.lineTo(icons[j].x, icons[j].y);
                            ctx.strokeStyle = icon.color.replace(/[\d.]+\)$/, `${0.15 * (1 - distance / 120)})`);
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            });

            // Draw subtle floating industry labels
            const time = Date.now() * 0.0003;
            const labels = ['TECH', 'FINANCE', 'ENGINEERING', 'SCIENCE', 'MEDICAL'];
            labels.forEach((label, i) => {
                const x = (canvas.width / 6) * (i + 1);
                const y = canvas.height * 0.1 + Math.sin(time + i) * 20;

                ctx.font = '10px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(100, 100, 100, 0.15)';
                ctx.fillText(label, x, y);
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createIcons();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createIcons();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #09090b, #18181b)' }}
        />
    );
}

// Generic gradient background for other pages
export function DefaultBackground() {
    return (
        <div
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{
                background: 'linear-gradient(to bottom, #09090b, #18181b)',
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
        </div>
    );
}

