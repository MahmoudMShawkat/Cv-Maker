import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import type { IconProps } from './Icon';

interface Command {
  id: string;
  title: string;
  action: () => void;
  icon: IconProps['name'];
}

interface CommandPaletteProps {
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase())
  );
  
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : filteredCommands.length - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < filteredCommands.length - 1 ? i + 1 : 0));
    } else if (e.key === 'Enter') {
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in-slide-down"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a command or search..."
          className="w-full p-4 text-lg bg-transparent border-b border-[var(--border-primary)] focus:outline-none"
        />
        <ul className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`p-3 flex items-center gap-3 rounded-md cursor-pointer text-sm ${
                  index === activeIndex ? 'bg-[var(--accent-primary)] text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <Icon name={command.icon} className="w-5 h-5 opacity-80" />
                <span>{command.title}</span>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-sm text-[var(--text-secondary)]">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};