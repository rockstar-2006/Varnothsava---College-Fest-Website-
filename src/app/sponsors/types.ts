import { LucideIcon } from 'lucide-react';
export type TierName = 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Well Wisher';

export interface TierConfig {
  icon: LucideIcon;
  glowColor: string;
  textColor: string;
}

export interface Sponsor {
  index?: number;
  tier: TierName;
  amount: number;
  sponsorName: string;
  sponsorLogoUrl: string;
  websiteUrl: string;
  tagline?: string;
}

export interface SponsorCardProps extends Sponsor {
  index: number;
}