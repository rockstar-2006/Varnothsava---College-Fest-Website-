export type AdminRole = 'SUPER_ADMIN' | 'COORDINATOR' | 'FINANCE' | 'VOLUNTEER';

export const SUPER_ADMINS = [
    'admin@varnothsava.in',
    'abhishree621@gmail.com',
    'rockstarsouza@gmail.com'
];

export const COORDINATOR_MAP: Record<string, string> = {
    'algorithmroulette.coord@varnothsava.in': 'TECH-001',
    'prompttoproduct.coord@varnothsava.in': 'TECH-002',
    'electrodetectives.coord@varnothsava.in': 'TECH-003',
    'fastestlinefollower.coord@varnothsava.in': 'TECH-004',
    'hackhunt.coord@varnothsava.in': 'TECH-005',
    'pitchathon.coord@varnothsava.in': 'TECH-006',
    'wrightbrothers.coord@varnothsava.in': 'TECH-007',
    'robosoccer.coord@varnothsava.in': 'TECH-008',
    'clashofradiants.coord@varnothsava.in': 'GAME-001',
    'bgmi.coord@varnothsava.in': 'GAME-002',
    'moneymatters.coord@varnothsava.in': 'MBA-001',
    'visionaryventures.coord@varnothsava.in': 'MBA-002',
    'ultimatebizteam.coord@varnothsava.in': 'MBA-003',
    'bhavataranga.coord@varnothsava.in': 'Solo-Singing',
    'janapadanada.coord@varnothsava.in': 'Group-Singing',
    'thakadhimitha.coord@varnothsava.in': 'Solo-Classical-Dance',
    'groovegala.coord@varnothsava.in': 'Group-Western-Dance',
    'speechofsmiles.coord@varnothsava.in': 'Stand-Up-Comedy',
    'whoami.coord@varnothsava.in': 'Who Am I',
    'facepainting.coord@varnothsava.in': 'Face-Painting',
    'handsofart.coord@varnothsava.in': 'Mehandi',
    'animearena.coord@varnothsava.in': 'Anime-Quiz',
    'musicalmarathon.coord@varnothsava.in': 'Antakshari',
    'naturespalette.coord@varnothsava.in': 'Flower-arrangement-vegetable-carving',
    'kalasangama.coord@varnothsava.in': 'Variety-Act',
    'slientsymphony.coord@varnothsava.in': 'MIME',
    'bannadaprapancha.coord@varnothsava.in': 'Rangoli',
    'artoftune.coord@varnothsava.in': 'Drawing',
    'sketchchronicles.coord@varnothsava.in': 'Pencil-Sketch',
    'jam.coord@varnothsava.in': 'Pick-and-Speech',
    'shutterverse.coord@varnothsava.in': 'Photography',
    'cinecapture.coord@varnothsava.in': 'Videography',
    'coordinator@varnothsava.in': 'all'
};

export const ADMIN_BLACKLIST: string[] = [];

export function getAdminRole(email: string): { role: AdminRole | null, eventId: string | null } {
    const normalizedEmail = (email || "").toLowerCase();

    // Strictly Block Blacklisted Users
    if (ADMIN_BLACKLIST.includes(normalizedEmail)) {
        return { role: null, eventId: null };
    }

    if (SUPER_ADMINS.includes(normalizedEmail)) {
        return { role: 'SUPER_ADMIN', eventId: 'all' };
    }
    if (COORDINATOR_MAP[normalizedEmail]) {
        return { role: 'COORDINATOR', eventId: COORDINATOR_MAP[normalizedEmail] };
    }
    return { role: null, eventId: null };
}

