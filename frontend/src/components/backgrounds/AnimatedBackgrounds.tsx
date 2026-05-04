'use client';

import { useEffect, useRef } from 'react';

// Homepage: Sparse dot grid (open, spacious)
export function HomeBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, #1e1e1e 1.5px, transparent 1.5px)',
                backgroundSize: '40px 40px',
            }} />
        </div>
    );
}

// Gallery: Square grid (tight, like a photo grid / pixels)
export function GalleryBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(to right, #1a1a1a 1px, transparent 1px)',
                backgroundSize: '32px 32px',
            }} />
        </div>
    );
}

// Articles: Horizontal rule lines (editorial datasheet)
export function ArticlesBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to bottom, transparent calc(100% - 1px), #1a1a1a 100%)',
                backgroundSize: '100% 48px',
            }} />
        </div>
    );
}

// Projects: Dot grid (engineering precision)
export function ProjectsBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, #ffffff07 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />
        </div>
    );
}

// Contact: Diagonal lines (subtle, directional)
export function ContactBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 24px, #161616 24px, #161616 25px)',
            }} />
        </div>
    );
}

// Tech/Skills: Fine grid (technical spec sheet)
export function TechBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#1c1c1c 1px, transparent 1px), linear-gradient(to right, #1c1c1c 1px, transparent 1px)',
                backgroundSize: '60px 60px',
            }} />
        </div>
    );
}

// Academia: Ruled horizontal lines (notebook / academic paper)
export function AcademiaBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to bottom, transparent calc(100% - 1px), #191919 100%)',
                backgroundSize: '100% 36px',
            }} />
        </div>
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

// Resume: Vertical column lines (ledger / document columns)
export function ResumeBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080808]">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to right, transparent calc(100% - 1px), #1a1a1a 100%)',
                backgroundSize: '80px 100%',
            }} />
        </div>
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

