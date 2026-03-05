"use client";
import React from "react";
import {
  PlatinumCard,
  GoldCard,
  SilverCard,
  BronzeCard,
  SectionHead,
  WellWisherRow,
} from "./SponsorCards";
import { motion } from "framer-motion";
import { Orbitron } from "next/font/google";

interface Sponsor {
  tier: string;
  amount?: number;
  sponsorName: string;
  sponsorLogoUrl?: string;
  websiteUrl?: string;
  tagline?: string;
}

interface SponsorData {
  platinumSponsor: Sponsor;
  goldSponsors: Sponsor[];
  silverSponsors: Sponsor[];
  bronzeSponsors: Sponsor[];
  wellWishers: Partial<Sponsor>[];
}

const sponsorData: SponsorData = {
  platinumSponsor: {
    tier: "Platinum",
    amount: 200000,
    sponsorName: "Leap Frog",
    sponsorLogoUrl: "sponsor-logos/leapfrog_logo_transparent.png",
    websiteUrl: "https://www.lesgroup.in/",
  },
  goldSponsors: [],
  silverSponsors: [
    {
      tier: "Silver",
      amount: 50000,
      sponsorName: "Mr. Prakash Shettigar",
      tagline: "Proprietor • SMVITM Cafeteria",
    },
  ],
  bronzeSponsors: [],
  wellWishers: [
    { sponsorName: "SBC Store", websiteUrl: "https://sbcstore.in" },
  ],
};

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-orbitron",
});

const SponsorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050805] text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-950/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-950/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-28 space-y-6">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`${orbitron.className} text-hero font-black tracking-tighter uppercase leading-[1.1] whitespace-normal text-white drop-shadow-lg`}
          >
            VARNOTHSAVA <br className="block md:hidden" /> 2K26
          </motion.h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-orbitron tracking-widest uppercase opacity-80">
            Visionary Partners
          </p>
        </header>

        {/* Platinum Section */}
        <div className="mb-32">
          <SectionHead label="🏆 Platinum Sponsor" color="#c49a2a" />
          <PlatinumCard
            sponsorName={sponsorData.platinumSponsor.sponsorName}
            sponsorLogoUrl={sponsorData.platinumSponsor.sponsorLogoUrl || ""}
            tagline={sponsorData.platinumSponsor.tagline}
            websiteUrl={sponsorData.platinumSponsor.websiteUrl || "#"}
            index={0}
          />
        </div>

        {/* Gold Grid */}
        <div className="mb-32">
          <SectionHead label="🥇 Gold Sponsors" color="#FBBF24" />
          <div className="flex flex-wrap gap-12 lg:gap-16 justify-center items-center">
            {sponsorData.goldSponsors.length > 0 ? (
              sponsorData.goldSponsors.map((sponsor, index) => (
                <GoldCard
                  key={sponsor.sponsorName}
                  sponsorName={sponsor.sponsorName}
                  sponsorLogoUrl={sponsor.sponsorLogoUrl || ""}
                  tagline={sponsor.tagline}
                  websiteUrl={sponsor.websiteUrl || "#"}
                  index={index + 1}
                />
              ))
            ) : (
              <>
                <GoldCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={1}
                />
                <GoldCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={2}
                />
                <GoldCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={3}
                />
              </>
            )}
          </div>
        </div>

        {/* Silver Grid */}
        <div className="mb-32">
          <SectionHead label="🥈 Silver Sponsors" color="#CBD5E1" />
          <div className="flex flex-wrap gap-12 lg:gap-16 justify-center items-center">
            {sponsorData.silverSponsors.length > 0 ? (
              sponsorData.silverSponsors.map((sponsor, index) => (
                <SilverCard
                  key={sponsor.sponsorName}
                  sponsorName={sponsor.sponsorName}
                  sponsorLogoUrl={sponsor.sponsorLogoUrl || ""}
                  tagline={sponsor.tagline}
                  websiteUrl={sponsor.websiteUrl || "#"}
                  index={index + 4}
                />
              ))
            ) : (
              <>
                <SilverCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={4}
                />
                <SilverCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={5}
                />
                <SilverCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={6}
                />
                <SilverCard
                  sponsorName="Coming Soon"
                  sponsorLogoUrl=""
                  websiteUrl="#"
                  index={7}
                />
              </>
            )}
          </div>
        </div>

        {/* Bronze Section - Logo Wall */}
        <div className="mb-32">
          <SectionHead label="🥉 Bronze Sponsors" color="#C2773B" />
          <div className="flex flex-wrap gap-12 lg:gap-16 justify-center items-center">
            {sponsorData.bronzeSponsors.length > 0 ? (
              sponsorData.bronzeSponsors.map((sponsor, index) => (
                <motion.a
                  key={sponsor.sponsorName}
                  href={sponsor.websiteUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group relative aspect-square flex items-center justify-center p-3 rounded-lg border border-orange-900/30 bg-orange-950/10 hover:bg-orange-900/20 hover:border-orange-600/50 transition-all duration-300"
                >
                  {sponsor.sponsorLogoUrl ? (
                    <img
                      src={sponsor.sponsorLogoUrl}
                      alt={sponsor.sponsorName}
                      className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:drop-shadow-xl transition-all"
                    />
                  ) : (
                    <span className="text-xs font-bold text-center text-orange-600/70">
                      {sponsor.sponsorName}
                    </span>
                  )}
                </motion.a>
              ))
            ) : (
              <>
                {[1, 2, 3].map((_, idx) => (
                  <BronzeCard
                    key={idx}
                    sponsorName="Coming Soon"
                    sponsorLogoUrl=""
                    websiteUrl="#"
                    index={idx}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* --- Well Wishers Section --- */}
        <div className="mt-40 mb-20 max-w-6xl mx-auto px-4">
          <SectionHead label="🤝 Community Well Wishers" color="#10b981" />

          <div className="flex flex-wrap gap-12 lg:gap-16 justify-center items-center">
            {sponsorData.wellWishers.length > 0 ? (
              sponsorData.wellWishers.map((wisher, idx) => (
                <WellWisherRow
                  key={idx}
                  sponsorName={wisher.sponsorName || "Anonymous"}
                  websiteUrl={wisher.websiteUrl || "#"}
                  index={idx}
                  sponsorLogoUrl="sponsor-logos/sbc_logo.png"
                />
              ))
            ) : (
              <div className="col-span-full flex justify-center py-8 text-gray-500 text-sm">
                Coming soon
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsPage;
