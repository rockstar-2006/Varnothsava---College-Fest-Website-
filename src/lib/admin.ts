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

export const ADMIN_BLACKLIST = [
    'tejas.23cs173@sode-edu.in',
    'chitkala.22cs043@sode-edu.in',
    'bhagyashree.22cs038@sode-edu.in',
    'shreya.22cs146@sode-edu.in',
    'chirashree.23cs031@sode-edu.in',
    'dheeraj.23ec020@sode-edu.in',
    'sadhana.23ec058@sode-edu.in',
    'sathwik.23ad039@sode-edu.in',
    'advaith.23cs005@sode-edu.in',
    'kaushik.23ec030@sode-edu.in',
    'fathimath.23cs038@sode-edu.in',
    'afeefa.23cs006@sode-edu.in',
    'pratiksha.23ec038@sode-edu.in',
    'maansi.23ec034@sode-edu.in',
    'abhishek.23cs001@sode-edu.in',
    'suraj.23ad055@sode-edu.in',
    'ananya.23ai006@sode-edu.in',
    'yathika.23ad062@sode-edu.in',
    'sneha.23cs161@sode-edu.in',
    'amrutha.23ad002@sode-edu.in',
    'chethan.23ai016@sode-edu.in',
    'avani.22cs107@sode-edu.in',
    'bhushan.23ad026@sode-edu.in',
    'deepa.23cs034@sode-edu.in',
    'sanjana.23ec063@sode-edu.in',
    'shreekiran.23ad044@sode-edu.in',
    'riston.23ad035@sode-edu.in',
    'samarth.22cs133@sode-edu.in',
    'nishanth.22ai027@sode-edu.in',
    'akash.23ai002@sode-edu.in',
    'vaishnavi.22ai054@sode-edu.in',
    'roylene.22cs131@sode-edu.in',
    'reynol.23cs119@sode-edu.in',
    'srinidhisrinibhat@gmail.com',
    'prerana.23ec051@sode-edu.in',
    'nishmitha.23ec039@sode-edu.in',
    'arwin.24ba007@sode-edu.in',
    'shravya.24ba044@sode-edu.in',
    'sannidhi.24ba040@sode-edu.in',
    'shruthi.24ba047@sode-edu.in',
    'krithika.24ba022@sode-edu.in',
    'rashmitha.24ba038@sode-edu.in',
    'kamath.23cs054@sode-edu.in',
    'shivaprasad.23ad043@sode-edu.in',
    'pragathi.23ad028@sode-edu.in',
    'viraj.23ai059@sode-edu.in'
];

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

