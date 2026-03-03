export type AdminRole = 'SUPER_ADMIN' | 'COORDINATOR' | 'FINANCE' | 'VOLUNTEER';

export const SUPER_ADMINS = [
    'admin@varnothsava.in',
    'abhishree621@gmail.com',
    'rockstarsouza@gmail.com'
];

export const COORDINATOR_MAP: Record<string, string> = {
    'tejas.23cs173@sode-edu.in': 'TECH-005', // HackHunt
    'chitkala.22cs043@sode-edu.in': 'Antakshari', // Musical Marathon
    'bhagyashree.22cs038@sode-edu.in': 'Antakshari',
    'shreya.22cs146@sode-edu.in': 'Variety-Act', // Kalasangama
    'chirashree.23cs031@sode-edu.in': 'Variety-Act',
    'dheeraj.23ec020@sode-edu.in': 'Stand-Up-Comedy', // Speech of Smiles
    'sadhana.23ec058@sode-edu.in': 'Stand-Up-Comedy',
    'sathwik.23ad039@sode-edu.in': 'GAME-001', // Clash of Radiants
    'advaith.23cs005@sode-edu.in': 'Drawing', // Art of Tune
    'kaushik.23ec030@sode-edu.in': 'TECH-004', // Fastest Line Follower
    'fathimath.23cs038@sode-edu.in': 'Mehandi', // Hands of art
    'afeefa.23cs006@sode-edu.in': 'Mehandi',
    'pratiksha.23ec038@sode-edu.in': 'Flower-arrangement-vegetable-carving', // Nature's Pallette
    'maansi.23ec034@sode-edu.in': 'Flower-arrangement-vegetable-carving',
    'abhishek.23cs001@sode-edu.in': 'Solo-Singing', // Bhava Taranga
    'suraj.23ad055@sode-edu.in': 'TECH-002', // Prompt To Product
    'ananya.23ai006@sode-edu.in': 'TECH-001', // Algorithm Roulette
    'yathika.23ad062@sode-edu.in': 'TECH-001',
    'sneha.23cs161@sode-edu.in': 'Solo-Classical-Dance', // Thaka Dhimi Tha
    'amrutha.23ad002@sode-edu.in': 'Solo-Classical-Dance',
    'chethan.23ai016@sode-edu.in': 'Photography,Videography', // Shutterverse / Cinecapture
    'avani.22cs107@sode-edu.in': 'TECH-006', // Pichathon
    'bhushan.23ad026@sode-edu.in': 'TECH-006',
    'deepa.23cs034@sode-edu.in': 'Rangoli', // Bannada Prapancha
    'sanjana.23ec063@sode-edu.in': 'Rangoli',
    'shreekiran.23ad044@sode-edu.in': 'TECH-008', // Robo Soccer
    'riston.23ad035@sode-edu.in': 'TECH-008',
    'samarth.22cs133@sode-edu.in': 'Face-Painting', // Who Am I?
    'nishanth.22ai027@sode-edu.in': 'Face-Painting',
    'akash.23ai002@sode-edu.in': 'Group-Singing', // Janapada Nada
    'vaishnavi.22ai054@sode-edu.in': 'Group-Singing',
    'roylene.22cs131@sode-edu.in': 'Anime-Quiz', // Anime Arena
    'reynol.23cs119@sode-edu.in': 'Anime-Quiz',
    'srinidhisrinibhat@gmail.com': 'GAME-002', // BGMI
    'prerana.23ec051@sode-edu.in': 'TECH-003', // Electro Detectives
    'nishmitha.23ec039@sode-edu.in': 'TECH-003',
    'arwin.24ba007@sode-edu.in': 'MBA-001', // Money Matters
    'shravya.24ba044@sode-edu.in': 'MBA-001',
    'sannidhi.24ba040@sode-edu.in': 'MBA-003', // Ultimate Biz Team
    'shruthi.24ba047@sode-edu.in': 'MBA-003',
    'krithika.24ba022@sode-edu.in': 'MBA-002', // Visionary ventures
    'rashmitha.24ba038@sode-edu.in': 'MBA-002',
    'kamath.23cs054@sode-edu.in': 'Pick-and-Speech', // JAM
    'shivaprasad.23ad043@sode-edu.in': 'Pencil-Sketch', // Sketch chronicles
    'pragathi.23ad028@sode-edu.in': 'Pencil-Sketch',
    'viraj.23ai059@sode-edu.in': 'MIME', // Silent symphony
    'coordinator@varnothsava.in': 'all'
};

export function getAdminRole(email: string): { role: AdminRole | null, eventId: string | null } {
    const normalizedEmail = (email || "").toLowerCase();
    if (SUPER_ADMINS.includes(normalizedEmail)) {
        return { role: 'SUPER_ADMIN', eventId: 'all' };
    }
    if (COORDINATOR_MAP[normalizedEmail]) {
        return { role: 'COORDINATOR', eventId: COORDINATOR_MAP[normalizedEmail] };
    }
    return { role: null, eventId: null };
}
