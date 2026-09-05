import React, { useState, useEffect } from 'react';
import './AdminPage.css';

// Type declaration for the side-effect CSS import (no css.d.ts available)
declare module '*.css';

// TypeScript interfaces for our prototype
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'cosmic' | 'mortal';
    joinedDate: string;
    status: 'active' | 'suspended';
    avatar: string;
}

interface Prompt {
    id: number;
    userId: number;
    category: 'instruction' | 'shortcut' | 'template';
    text: string;
}

interface SystemLog {
    id: number;
    timestamp: string;
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
    latency?: string;
}

// Initial mock data
const initialUsers: User[] = [
    { id: 1, name: 'Adam Jones', email: 'adam@whiskerion.ai', role: 'admin', joinedDate: '2026-05-15', status: 'active', avatar: '🐱' },
    { id: 2, name: 'Cosmic Kitty', email: 'kitty@nebula.net', role: 'cosmic', joinedDate: '2026-05-28', status: 'active', avatar: '👽' },
    { id: 3, name: 'Mortal Bob', email: 'bob@earth.org', role: 'mortal', joinedDate: '2026-06-01', status: 'active', avatar: '🤖' },
    { id: 4, name: 'Stardust Rover', email: 'rover@galaxy.com', role: 'cosmic', joinedDate: '2026-06-08', status: 'active', avatar: '🐯' },
    { id: 5, name: 'Catnip Overlord', email: 'nip@dimension9.cat', role: 'cosmic', joinedDate: '2026-06-12', status: 'suspended', avatar: '🦁' },
];

const initialPrompts: Prompt[] = [
    { id: 1, userId: 1, category: 'instruction', text: 'Prepend answers with cosmic revelations.' },
    { id: 2, userId: 1, category: 'template', text: 'Hark! The stars align and suggest...' },
    { id: 3, userId: 2, category: 'shortcut', text: 'Explain warp speed to a kitten.' },
    { id: 4, userId: 2, category: 'instruction', text: 'Answer in deep, booming feline purrs.' },
    { id: 5, userId: 3, category: 'template', text: 'Human greeting: Meow-dy!' },
];

// SVG Chart data points
const cumulativeGrowthData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 145 },
    { label: 'Wed', value: 180 },
    { label: 'Thu', value: 210 },
    { label: 'Fri', value: 260 },
    { label: 'Sat', value: 310 },
    { label: 'Sun', value: 350 }
];

const dailyGrowthData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 25 },
    { label: 'Wed', value: 35 },
    { label: 'Thu', value: 30 },
    { label: 'Fri', value: 50 },
    { label: 'Sat', value: 50 },
    { label: 'Sun', value: 40 }
];

const logMessages = [
    { level: 'info', message: 'Incoming chat request received' },
    { level: 'success', message: 'Gemini LLM response generated successfully', latency: '184ms' },
    { level: 'success', message: 'ElevenLabs synthesized speech audio stream', latency: '320ms' },
    { level: 'warning', message: 'High request frequency detected from Mortal Bob' },
    { level: 'error', message: 'ElevenLabs API rate-limit threshold near' },
    { level: 'info', message: 'System prompts reloaded' },
];

const AdminPage = () => {
    // Navigation / UI View States
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics'>('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    // Simulated Databases
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
    const [logs, setLogs] = useState<SystemLog[]>([]);

    // Growth Chart controls
    const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');
    const [hoveredDataPoint, setHoveredDataPoint] = useState<{ index: number; x: number; y: number } | null>(null);

    // Selected User highlights
    const [selectedUserId, setSelectedUserId] = useState<number>(1);

    // Search / Filter
    const [searchQuery, setSearchQuery] = useState<string>('');

    // CRUD Modal States
    const [modalMode, setModalMode] = useState<'none' | 'view' | 'edit' | 'create'>('none');
    const [activeUser, setActiveUser] = useState<User | null>(null);

    // CRUD Form Inputs
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRole, setFormRole] = useState<'admin' | 'cosmic' | 'mortal'>('mortal');
    const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
    const [formAvatar, setFormAvatar] = useState('🐱');



    // Input Validation State
    const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; prompt?: string }>({});

    // Validation helper functions
    const validateUser = (name: string, email: string, userIdToIgnore?: number): boolean => {
        const errors: { name?: string; email?: string } = {};

        const trimmedName = name.trim();
        if (!trimmedName) {
            errors.name = 'Full Name is required.';
        } else if (trimmedName.length < 2) {
            errors.name = 'Name must be at least 2 characters.';
        } else if (trimmedName.length > 50) {
            errors.name = 'Name must not exceed 50 characters.';
        } else if (!/^[A-Za-z\s'\-]+$/.test(trimmedName)) {
            errors.name = 'Name must contain only letters, spaces, hyphens, or apostrophes.';
        }

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            errors.email = 'Email Address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            errors.email = 'Please enter a valid email format (e.g. name@domain.com).';
        } else {
            const duplicate = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.id !== userIdToIgnore);
            if (duplicate) {
                errors.email = 'A citizen with this email address already exists in the directory.';
            }
        }

        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };




    // Initialize Log stream simulator
    useEffect(() => {
        // Initial set of logs
        const initialLogs: SystemLog[] = Array.from({ length: 4 }).map((_, index) => {
            const time = new Date(Date.now() - (4 - index) * 60000);
            const refLog = logMessages[index % logMessages.length];
            return {
                id: index + 1,
                timestamp: time.toLocaleTimeString(),
                level: refLog.level as any,
                message: refLog.message,
                latency: refLog.latency
            };
        });
        setLogs(initialLogs);

        const interval = setInterval(() => {
            const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
            const newLog: SystemLog = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                level: randomLog.level as any,
                message: randomLog.message,
                latency: randomLog.latency
            };
            setLogs(prev => [newLog, ...prev.slice(0, 14)]);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    // Filtered Users based on Search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Prompts matching selected user
    const selectedUserPrompts = prompts.filter(p => p.userId === selectedUserId);
    const highlightedUserObj = users.find(u => u.id === selectedUserId);

    // Modal Operations
    const openCreateModal = () => {
        setFormName('');
        setFormEmail('');
        setFormRole('mortal');
        setFormStatus('active');
        setFormAvatar('🐱');
        setFormErrors({});
        setModalMode('create');
    };

    const openEditModal = (user: User) => {
        setActiveUser(user);
        setFormName(user.name);
        setFormEmail(user.email);
        setFormRole(user.role);
        setFormStatus(user.status);
        setFormAvatar(user.avatar);
        setFormErrors({});
        setModalMode('edit');
    };

    const openViewModal = (user: User) => {
        setActiveUser(user);
        setModalMode('view');
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors(prev => ({ ...prev, name: undefined, email: undefined }));
        
        if (!validateUser(formName, formEmail)) {
            return;
        }

        const newUser: User = {
            id: Date.now(),
            name: formName.trim(),
            email: formEmail.trim(),
            role: formRole,
            joinedDate: new Date().toISOString().split('T')[0],
            status: formStatus,
            avatar: formAvatar
        };

        setUsers(prev => [...prev, newUser]);
        setSelectedUserId(newUser.id); // auto-highlight new user
        setModalMode('none');

        // Append log
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            message: `Created new user: ${newUser.name}`
        }, ...prev]);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUser) return;
        setFormErrors(prev => ({ ...prev, name: undefined, email: undefined }));

        if (!validateUser(formName, formEmail, activeUser.id)) {
            return;
        }

        setUsers(prev => prev.map(user => {
            if (user.id === activeUser.id) {
                return {
                    ...user,
                    name: formName.trim(),
                    email: formEmail.trim(),
                    role: formRole,
                    status: formStatus,
                    avatar: formAvatar
                };
            }
            return user;
        }));

        setModalMode('none');
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Updated profile details for user: ${formName.trim()}`
        }, ...prev]);
    };

    const handleDeleteUser = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to banish user "${name}" from the Cosmic Kingdom?`)) {
            setUsers(prev => prev.filter(user => user.id !== id));
            setPrompts(prev => prev.filter(p => p.userId !== id));

            // reset selection if needed
            if (selectedUserId === id) {
                const remaining = users.filter(user => user.id !== id);
                if (remaining.length > 0) {
                    setSelectedUserId(remaining[0].id);
                }
            }

            setLogs(prev => [{
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                level: 'error',
                message: `Exiled user: ${name}`
            }, ...prev]);
        }
    };



    const handleDeletePrompt = (id: number) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'warning',
            message: `Removed system prompt shortcut: ID ${id}`
        }, ...prev]);
    };


    // SVG Chart Geometry Calculators
    const activeDataPoints = chartMode === 'cumulative' ? cumulativeGrowthData : dailyGrowthData;
    const maxVal = Math.max(...activeDataPoints.map(d => d.value)) * 1.15; // 15% padding top
    const minVal = 0;

    const chartWidth = 550;
    const chartHeight = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    // Map data indices to SVG coordinates
    const coordinates = activeDataPoints.map((d, index) => {
        const x = paddingLeft + (index / (activeDataPoints.length - 1)) * graphWidth;
        const y = chartHeight - paddingBottom - ((d.value - minVal) / (maxVal - minVal)) * graphHeight;
        return { x, y, label: d.label, value: d.value };
    });

    // Create SVG Path strings
    const pathString = coordinates.length > 0
        ? `M ${coordinates[0].x} ${coordinates[0].y} ` +
          coordinates.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ')
        : '';

    const areaString = coordinates.length > 0
        ? `${pathString} L ${coordinates[coordinates.length - 1].x} ${chartHeight - paddingBottom} L ${coordinates[0].x} ${chartHeight - paddingBottom} Z`
        : '';

    return (
        <div className="admin-layout">
            {/* Exit/Back to Chat button (Hash Route Changer) */}
            <button className="admin-toggle-gear" onClick={() => window.location.hash = ''}>
                <span className="admin-toggle-gear-icon">🔮</span> Exit Admin
            </button>

            {/* Mobile Header */}
            <div className="mobile-header">
                <div className="admin-sidebar-logo">
                    WHISKERION <span>ADMIN</span>
                </div>
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        Whisk<span>erion</span>
                    </div>
                </div>

                <ul className="admin-menu-list">
                    <li
                        className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                    >
                        <span className="admin-menu-icon">📊</span> Dashboard
                    </li>
                    <li
                        className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                    >
                        <span className="admin-menu-icon">👥</span> User Directory
                    </li>
                    <li
                        className={`admin-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                    >
                        <span className="admin-menu-icon">📈</span> System Health
                    </li>
                </ul>

                <div className="admin-sidebar-footer">
                    <button className="exit-btn" onClick={() => window.location.hash = ''}>
                        Close Control Deck
                    </button>
                </div>
            </div>

            {/* Main Content Workspace */}
            <div className="admin-main">
                {/* Header title */}
                <div className="admin-header">
                    <div className="admin-title-area">
                        <h2>{activeTab === 'dashboard' ? 'Cosmic Control Deck' :
                             activeTab === 'users' ? 'Celestial User Directory' :
                             'Nebula Health Analytics'}</h2>
                        <p>{activeTab === 'dashboard' ? 'Real-time monitoring and user activity summary' :
                             activeTab === 'users' ? 'Exile, view, and upgrade mortal and cosmic accounts' :
                             'API Latency, Token consumption, and telemetry stats'}</p>
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Cards Row */}
                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <div>
                                    <div className="stat-title">Cosmic Chat Sessions</div>
                                    <div className="stat-value">1,482</div>
                                </div>
                                <div className="stat-footer">
                                    <span className="stat-trend positive">▲ 14.2%</span>
                                    <span className="stat-icon">💬</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <div className="stat-title">Feline LLM Latency</div>
                                    <div className="stat-value">184 ms</div>
                                </div>
                                <div className="stat-footer">
                                    <span className="stat-trend positive">▼ 8.4%</span>
                                    <span className="stat-icon">⚡</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <div className="stat-title">Catnip Tokens Consumed</div>
                                    <div className="stat-value">412.8K</div>
                                </div>
                                <div className="stat-footer">
                                    <span className="stat-trend neutral">● Steady</span>
                                    <span className="stat-icon">🪙</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <div className="stat-title">Dimension Gateways (Status)</div>
                                    <div className="stat-value" style={{ color: '#00ffcc', textShadow: '0 0 10px rgba(0,255,204,0.3)' }}>ONLINE</div>
                                </div>
                                <div className="stat-footer">
                                    <span className="stat-trend positive">99.98% uptime</span>
                                    <span className="stat-icon">🛸</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart and Details row */}
                        <div className="dashboard-row-one">
                            {/* SVG Chart Panel */}
                            <div className="panel-card">
                                <div className="panel-header">
                                    <h3>📈 User Growth Highlight</h3>
                                    <div className="chart-controls">
                                        <button
                                            className={`chart-btn ${chartMode === 'cumulative' ? 'active' : ''}`}
                                            onClick={() => setChartMode('cumulative')}
                                        >
                                            Cumulative
                                        </button>
                                        <button
                                            className={`chart-btn ${chartMode === 'daily' ? 'active' : ''}`}
                                            onClick={() => setChartMode('daily')}
                                        >
                                            Daily Signups
                                        </button>
                                    </div>
                                </div>

                                <div className="chart-container-div">
                                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
                                        <defs>
                                            <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#e94560" />
                                                <stop offset="100%" stopColor="#ff6b00" />
                                            </linearGradient>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#e94560" stopOpacity="0.4" />
                                                <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Chart Grid Lines */}
                                        {Array.from({ length: 4 }).map((_, i) => {
                                            const y = paddingTop + (i * graphHeight) / 3;
                                            const val = Math.round(maxVal - (i * (maxVal - minVal)) / 3);
                                            return (
                                                <g key={i}>
                                                    <line
                                                        x1={paddingLeft}
                                                        y1={y}
                                                        x2={chartWidth - paddingRight}
                                                        y2={y}
                                                        className="chart-grid-line"
                                                    />
                                                    <text
                                                        x={paddingLeft - 8}
                                                        y={y + 4}
                                                        fill="rgba(240, 240, 240, 0.4)"
                                                        fontSize="10"
                                                        textAnchor="end"
                                                    >
                                                        {val}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Area under the line */}
                                        <path d={areaString} className="chart-area" />

                                        {/* Line Path */}
                                        <path d={pathString} className="chart-line" />

                                        {/* X Axis labels */}
                                        {coordinates.map((c, i) => (
                                            <g key={i}>
                                                <text
                                                    x={c.x}
                                                    y={chartHeight - 10}
                                                    className="chart-label"
                                                >
                                                    {c.label}
                                                </text>
                                                <circle
                                                    cx={c.x}
                                                    cy={c.y}
                                                    r={hoveredDataPoint?.index === i ? 6 : 4}
                                                    className="chart-dot"
                                                    onMouseEnter={() => {
                                                        setHoveredDataPoint({
                                                            index: i,
                                                            x: c.x,
                                                            y: c.y
                                                        });
                                                    }}
                                                    onMouseLeave={() => setHoveredDataPoint(null)}
                                                />
                                            </g>
                                        ))}

                                        {/* Axis borders */}
                                        <line
                                            x1={paddingLeft}
                                            y1={chartHeight - paddingBottom}
                                            x2={chartWidth - paddingRight}
                                            y2={chartHeight - paddingBottom}
                                            className="chart-axis-line"
                                        />
                                        <line
                                            x1={paddingLeft}
                                            y1={paddingTop}
                                            x2={paddingLeft}
                                            y2={chartHeight - paddingBottom}
                                            className="chart-axis-line"
                                        />
                                    </svg>

                                    {/* SVG Interactive Tooltip overlay */}
                                    {hoveredDataPoint !== null && (
                                        <div
                                            className="chart-tooltip"
                                            style={{
                                                left: `${hoveredDataPoint.x}px`,
                                                top: `${hoveredDataPoint.y}px`,
                                                opacity: 1
                                            }}
                                        >
                                            <div><strong>Day:</strong> {activeDataPoints[hoveredDataPoint.index].label}</div>
                                            <div><strong>Users:</strong> {activeDataPoints[hoveredDataPoint.index].value}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Prompts list for selected user */}
                            <div className="panel-card">
                                <div className="panel-header">
                                    <h3>💬 Highlighted User Prompts</h3>
                                </div>
                                <div className="prompt-list-area">
                                    {highlightedUserObj ? (
                                        <>
                                            <div className="selected-user-header">
                                                <div>
                                                    Selected: <span className="selected-user-name">{highlightedUserObj.name}</span> ({highlightedUserObj.role})
                                                </div>
                                                <span className="role-badge mortal">ID: {highlightedUserObj.id}</span>
                                            </div>

                                            <div className="prompt-list-scroll">
                                                {selectedUserPrompts.length > 0 ? (
                                                    selectedUserPrompts.slice(0, 3).map(p => (
                                                        <div className="prompt-item-card" key={p.id}>
                                                            <div className="prompt-item-top">
                                                                <span className="prompt-category">{p.category}</span>
                                                                <button
                                                                    className="action-btn delete"
                                                                    onClick={() => handleDeletePrompt(p.id)}
                                                                    style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                            <div className="prompt-text-content">"{p.text}"</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-user-selected-prompt" style={{ padding: '16px' }}>
                                                        No custom prompts created for this user yet.
                                                    </div>
                                                )}
                                            </div>


                                        </>
                                    ) : (
                                        <div className="no-user-selected-prompt">
                                            Highlight a user in the table below to configure their prompts.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User List Table */}
                        <div className="dashboard-row-two">
                            <div className="panel-card">
                                <div className="panel-header">
                                    <h3>👥 Quick User Listing</h3>
                                    <button className="add-user-btn" onClick={openCreateModal}>
                                        + Add Celestial Citizen
                                    </button>
                                </div>

                                <div className="search-bar-row">
                                    <div className="search-input-wrapper">
                                        <span className="search-icon-svg">🔍</span>
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search by name, email, or role..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                        Click a row to load its customized prompt workspace
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Date Joined</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => (
                                                <tr
                                                    key={user.id}
                                                    className={selectedUserId === user.id ? 'highlighted' : ''}
                                                    onClick={() => setSelectedUserId(user.id)}
                                                >
                                                    <td>
                                                        <div className="user-avatar-info">
                                                            <div className="user-avatar">{user.avatar}</div>
                                                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.role}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{user.joinedDate}</td>
                                                    <td>
                                                        <span className="status-indicator">
                                                            <span className={`status-dot ${user.status}`}></span>
                                                            <span style={{ textTransform: 'capitalize' }}>{user.status}</span>
                                                        </span>
                                                    </td>
                                                    <td onClick={e => e.stopPropagation()}>
                                                        <div className="action-buttons-cell">
                                                            <button className="action-btn view" onClick={() => openViewModal(user)}>View</button>
                                                            <button className="action-btn edit" onClick={() => openEditModal(user)}>Update</button>
                                                            <button className="action-btn delete" onClick={() => handleDeleteUser(user.id, user.name)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>
                                                        No cosmic entities matched your search query.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Recent logs stream monitor */}
                        <div className="dashboard-row-two" style={{ marginTop: '12px' }}>
                            <div className="panel-card">
                                <div className="panel-header">
                                    <h3>📡 Telemetry Log Feed</h3>
                                </div>
                                <div className="logs-monitor-wrapper" style={{ maxHeight: '300px' }}>
                                    {logs.map(log => (
                                        <div
                                            key={log.id}
                                            className={`log-item-line ${
                                                log.level === 'success' ? 'success-log' :
                                                log.level === 'error' ? 'error-log' : ''
                                            }`}
                                        >
                                            <div className="log-meta">
                                                <span>[{log.level.toUpperCase()}] {log.timestamp}</span>
                                                {log.latency && <span className="log-stat">Latency: {log.latency}</span>}
                                            </div>
                                            <div className="log-text">{log.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Users Directory Tab */}
                {activeTab === 'users' && (
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3> Celestial Directory List</h3>
                            <button className="add-user-btn" onClick={openCreateModal}>
                                + Add New Celestial Entity
                            </button>
                        </div>
                        <div className="search-bar-row">
                            <div className="search-input-wrapper">
                                <span className="search-icon-svg">🔍</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Filter cosmic citizens..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User Avatar & Name</th>
                                        <th>Email Address</th>
                                        <th>Role</th>
                                        <th>Date Created</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-avatar-info">
                                                    <div className="user-avatar">{user.avatar}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>ID: {user.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.joinedDate}</td>
                                            <td>
                                                <span className="status-indicator">
                                                    <span className={`status-dot ${user.status}`}></span>
                                                    <span style={{ textTransform: 'capitalize' }}>{user.status}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-cell">
                                                    <button className="action-btn view" onClick={() => openViewModal(user)}>View Details</button>
                                                    <button className="action-btn edit" onClick={() => openEditModal(user)}>Modify</button>
                                                    <button className="action-btn delete" onClick={() => handleDeleteUser(user.id, user.name)}>Exile</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>
                                                No matches.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Health & Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="dashboard-row-one">
                        <div className="panel-card" style={{ gridColumn: '1 / -1' }}>
                            <div className="panel-header">
                                <h3>📊 LLM Response Rates & Memory Consumptions</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: '#ff6b00', marginBottom: '12px' }}>AI Latency Matrix</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Gemini 2.5 Flash Lite (Average)</span>
                                            <span style={{ color: '#00ffcc' }}>180ms</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Web speech synthesis engine</span>
                                            <span style={{ color: '#00ffcc' }}>45ms</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>ElevenLabs voice synthesis</span>
                                            <span style={{ color: '#ff3366' }}>324ms</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: '#e94560', marginBottom: '12px' }}>Chat Gateways Telemetry</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Total inbound messages today</span>
                                            <span>3,842</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Active cosmic socket connections</span>
                                            <span>18</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Daily token quota left</span>
                                            <span>89.2%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View User Dialog */}
            {modalMode === 'view' && activeUser && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>Citizen Details</h3>
                            <button className="modal-close-btn" onClick={() => setModalMode('none')}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px' }}>
                                <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.8rem' }}>{activeUser.avatar}</div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{activeUser.name}</h4>
                                    <span className={`role-badge ${activeUser.role}`}>{activeUser.role}</span>
                                </div>
                            </div>
                            <div className="view-detail-row">
                                <span className="view-detail-label">ID Code</span>
                                <span className="view-detail-value">{activeUser.id}</span>
                            </div>
                            <div className="view-detail-row">
                                <span className="view-detail-label">Email</span>
                                <span className="view-detail-value">{activeUser.email}</span>
                            </div>
                            <div className="view-detail-row">
                                <span className="view-detail-label">Joined Kingdom</span>
                                <span className="view-detail-value">{activeUser.joinedDate}</span>
                            </div>
                            <div className="view-detail-row">
                                <span className="view-detail-label">Status</span>
                                <span className="view-detail-value">{activeUser.status.toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel" onClick={() => setModalMode('none')}>Close</button>
                            <button className="modal-btn submit" onClick={() => openEditModal(activeUser)}>Modify Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create & Edit User Dialog */}
            {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? 'Summon New Citizen' : 'Alter Citizen Settings'}</h3>
                            <button className="modal-close-btn" onClick={() => setModalMode('none')}>✕</button>
                        </div>
                        <form onSubmit={modalMode === 'create' ? handleCreateUser : handleUpdateUser} noValidate>
                                                            <div className="modal-body">
                                                                <div className="form-group">
                                                                    <label className="form-label">Citizen Avatar</label>
                                                                    <select className="form-select" value={formAvatar} onChange={e => setFormAvatar(e.target.value)}>
                                                                        <option value="🐱">🐱 Feline Prime</option>
                                                                        <option value="👽">👽 Star Alien</option>
                                                                        <option value="🤖">🤖 Android Bot</option>
                                                                        <option value="🐯">🐯 Cosmic Tiger</option>
                                                                        <option value="🦁">🦁 Space Lion</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">Full Name</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        value={formName}
                                                                        onChange={e => {
                                                                            setFormName(e.target.value);
                                                                            if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                                                                        }}
                                                                        placeholder="e.g. Stardust Explorer"
                                                                    />
                                                                    {formErrors.name && (
                                                                        <span className="validation-error" style={{ color: '#ff3366', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                                                            ⚠️ {formErrors.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">Email Address</label>
                                                                    <input
                                                                        type="email"
                                                                        className="form-input"
                                                                        value={formEmail}
                                                                        onChange={e => {
                                                                            setFormEmail(e.target.value);
                                                                            if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                                                                        }}
                                                                        placeholder="e.g. pilot@nebula.com"
                                                                    />
                                                                    {formErrors.email && (
                                                                        <span className="validation-error" style={{ color: '#ff3366', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                                                            ⚠️ {formErrors.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">Role Privilege</label>
                                                                    <select className="form-select" value={formRole} onChange={e => setFormRole(e.target.value as any)}>
                                                                        <option value="mortal">Mortal (Standard Chat limits)</option>
                                                                        <option value="cosmic">Cosmic (High-capacity VIP)</option>
                                                                        <option value="admin">Admin (Global Control)</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">Status</label>
                                                                    <select className="form-select" value={formStatus} onChange={e => setFormStatus(e.target.value as any)}>
                                                                        <option value="active">Active (Access Allowed)</option>
                                                                        <option value="suspended">Suspended (Banned from portal)</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="modal-btn cancel" onClick={() => setModalMode('none')}>Cancel</button>
                                                                <button type="submit" className="modal-btn submit">
                                                                    {modalMode === 'create' ? 'Summon Citizen' : 'Apply Alterations'}
                                                                </button>
                                                            </div>
                                                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;