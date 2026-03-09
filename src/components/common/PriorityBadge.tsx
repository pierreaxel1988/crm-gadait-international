import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

const getPriorityLevel = (score: number) => {
  if (score >= 700) return { emoji: '🔴', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' };
  if (score >= 500) return { emoji: '🟠', label: 'Haute', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  if (score >= 300) return { emoji: '🟡', label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { emoji: '🟢', label: 'Normale', color: 'bg-green-100 text-green-700 border-green-200' };
};

export const getLeadPriorityScore = (lead: { status?: string; tags?: string[]; nextFollowUpDate?: string }): number => {
  let score = 0;

  // Stage score
  switch (lead.status) {
    case 'Deposit': score += 500; break;
    case 'Visit': case 'Offre': score += 400; break;
    case 'Qualified': case 'Proposal': score += 300; break;
    case 'New': case 'Contacted': score += 200; break;
    case 'Gagné': case 'Perdu': score += 100; break;
    default: score += 150;
  }

  // Tag score
  const tags = lead.tags || [];
  let maxTagScore = 0;
  tags.forEach(tag => {
    const t = tag.toLowerCase();
    if (t.includes('vip')) maxTagScore = Math.max(maxTagScore, 300);
    else if (t.includes('hot')) maxTagScore = Math.max(maxTagScore, 250);
    else if (t.includes('serious')) maxTagScore = Math.max(maxTagScore, 200);
    else if (t.includes('cold')) maxTagScore = Math.max(maxTagScore, 150);
  });
  score += maxTagScore;

  // Action date score
  if (lead.nextFollowUpDate) {
    const d = new Date(lead.nextFollowUpDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    if (dateOnly < today) score += 30;
    else if (dateOnly.getTime() === today.getTime()) score += 20;
    else {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      if (d <= weekFromNow) score += 10;
      else score += 5;
    }
  }

  return score;
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ score, className, showLabel = false }) => {
  const priority = getPriorityLevel(score);

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs rounded-full border px-1.5 py-0.5',
      priority.color,
      className
    )}>
      <span>{priority.emoji}</span>
      {showLabel && <span className="font-medium">{priority.label}</span>}
    </span>
  );
};

export default PriorityBadge;
