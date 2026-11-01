import React from 'react';
import { navigationItems } from '../data/homeData.js';

export default function Sidebar({ activeItem, onSelect, messageCount = 0 }) {
    return (
        <aside className="home-sidebar">
            <nav aria-label="Main navigation">
                {navigationItems.map((item) => (
                    <button
                        className={
                            activeItem === item.label ? 'nav-active' : ''
                        }
                        key={item.label}
                        type="button"
                        onClick={() => onSelect(item.label)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        {(item.label === 'Messages' ? messageCount : item.count) > 0 && (
                            <span className="nav-count">{item.label === 'Messages' ? messageCount : item.count}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-message">
                <b>Build</b>
                <b>Share</b>
                <b>Learn</b>
                <strong>Together</strong>
                <span>A community for developers, by developers.</span>
            </div>
        </aside>
    );
}
