import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={`divide-y divide-border border-y border-border ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="py-1">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="w-full py-4 px-1 flex items-center justify-between text-start font-medium text-sm sm:text-base text-near-black hover:text-gold-dark transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  {item.icon && <span className="text-gold-dark shrink-0">{item.icon}</span>}
                  <span>{item.title}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 stroke-[1.5] text-muted transition-transform duration-300 shrink-0 motion-reduce:transition-none ${
                    isOpen ? 'rotate-180 text-gold-dark' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={`text-xs sm:text-sm text-muted/90 font-light leading-relaxed pb-5 pt-1 animate-in fade-in duration-200 ${
                !isOpen ? 'hidden' : 'block'
              }`}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
