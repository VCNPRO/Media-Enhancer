import React from 'react';

interface Tab {
    id: string;
    label: string;
    disabled?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabClick: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && onTabClick(tab.id)}
                        className={`
                            ${tab.id === activeTab
                                ? 'border-red-500 text-red-500'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            }
                            ${tab.disabled ? 'cursor-not-allowed text-gray-600' : ''}
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        `}
                        aria-current={tab.id === activeTab ? 'page' : undefined}
                        disabled={tab.disabled}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};
