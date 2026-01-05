export interface Event {
    id: string
    title: string
    type: 'Technical' | 'Cultural' | 'Gaming'
    category?: string
    description: string
    rules: string[]
    regulations?: string[]
    evaluation?: string[]
    prizePool: string
    coordinators: string[]
    coordinatorsContact?: string[]
    fee: number
    visual: string
    date: string
    tags: string[]
    videoUrl?: string
    brochureUrl?: string
}

export const missions: Event[] = [
    // --- TECHNICAL EVENTS ---
    {
        id: 't-algo',
        title: 'Algorithm Roulette',
        type: 'Technical',
        description: 'A thrilling team-based machine learning challenge where teams are assigned random algorithms and must build working models on the spot.',
        rules: ['Team of 2', '2-hour implementation window', 'No pre-trained models allowed', 'Spin for algorithm at start'],
        regulations: [
            'Participants must bring their own laptops with necessary environments installed.',
            'Use of internet is strictly prohibited during the implementation phase.',
            'Code must be written from scratch during the session.',
            'Organizers decision is final.'
        ],
        evaluation: [
            'Model Accuracy: 40%',
            'Code Quality and Efficiency: 30%',
            'Adaptability to the assigned algorithm: 20%',
            'Presentation: 10%'
        ],
        prizePool: '₹20,000+',
        coordinators: ['Ananya Bhat', 'Yathika P Amin'],
        coordinatorsContact: ['+91 9876543210', '+91 8765432109'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
        date: '11 MAR',
        tags: ['ML', 'Coding', 'Python'],
        videoUrl: 'https://cdn.pixabay.com/video/2019/10/05/27538-364402636_tiny.mp4',
        brochureUrl: '/brochures/algorithm_roulette.pdf'
    },
    {
        id: 't-hunt',
        title: 'Hack Hunt',
        type: 'Technical',
        description: 'The ultimate coding treasure hunt. Solve multi-layered algorithmic puzzles and find hidden solutions in a race against time.',
        rules: ['Individual participation', '90 min preliminary round', '2 hr final round', 'No external internet allowed'],
        regulations: [
            'Late entries will not be entertained.',
            'System provided environment must be used.',
            'Any form of malpractice will lead to immediate disqualification.'
        ],
        evaluation: [
            'Number of challenges solved',
            'Time taken for each solution',
            'Algorithmic efficiency'
        ],
        prizePool: '₹15,000+',
        coordinators: ['Ramachandra Udupa', 'Anurag R Rao'],
        coordinatorsContact: ['+91 7654321098', '+91 6543210987'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
        date: '12 MAR',
        tags: ['Cyber', 'Logic', 'Coding'],
        videoUrl: 'https://cdn.pixabay.com/video/2023/11/04/187747-880905973_tiny.mp4'
    },
    {
        id: 't-prompt',
        title: 'Prompt to Product',
        type: 'Technical',
        description: 'AI-powered product engineering. Use modern AI tools to transform a simple prompt into a fully functional technical product.',
        rules: ['Individual/Team of 2', 'Must document AI prompts used', 'Live product demo required', 'Judged on innovation'],
        prizePool: '₹12,000+',
        coordinators: ['Bhushan Poojary', 'Suraj Bhagwat'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
        date: '21 MAR',
        tags: ['AI', 'Product', 'Gen-AI']
    },
    {
        id: 't-line',
        title: 'Fastest Line Follower',
        type: 'Technical',
        description: 'Autonomous robotics racing. Design a high-speed robot capable of navigating complex circuit paths with speed and precision.',
        rules: ['Autonomous bots only', '3-minute run limit', 'Points for speed and path accuracy', 'Max dimensions: 20x20cm'],
        prizePool: '₹10,000',
        coordinators: ['Kaushik A', 'Raveesha Padmashali'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
        date: '20 MAR',
        tags: ['Robotics', 'Hardware', 'Sensors']
    },
    {
        id: 't-soccer',
        title: 'Robo Soccer',
        type: 'Technical',
        description: 'A tactical robot soccer tournament where technical precision meets high-speed sports in an exciting knockout format.',
        rules: ['Team of 2-3', 'Knockout format', '5-minute match duration', 'Tactical timeouts allowed'],
        prizePool: '₹12,000',
        coordinators: ['Pavan R Gond', 'Vishwas Bhat'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80',
        date: '21 MAR',
        tags: ['Robotics', 'Sports', 'Mechanics']
    },
    {
        id: 't-wright',
        title: 'Wright Brothers',
        type: 'Technical',
        description: 'Aeronautical design challenge. Construct and launch a non-powered glider to see who can achieve the longest flight time.',
        rules: ['Build at venue (3 hrs)', 'Hand-launched only', 'Max weight: 500g', 'No chemical propulsion'],
        prizePool: '₹8,000',
        coordinators: ['Pavan R Gond', 'Vishwas Bhat'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200&q=80',
        date: '21 MAR',
        tags: ['Aero', 'Design', 'Physics']
    },
    {
        id: 't-electro',
        title: 'Electro Detectives',
        type: 'Technical',
        description: 'Hardware debugging and circuit analysis. Identify and fix errors in complex electronic circuits to save the day.',
        rules: ['Solo entry', 'No external books', 'Standard lab equipment provided', 'Time-attack format'],
        prizePool: '₹6,000',
        coordinators: ['Prerana Shetty', 'Nishmitha'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
        date: '20 MAR',
        tags: ['Electronics', 'Circuit', 'Logic']
    },
    {
        id: 't-route',
        title: 'Route Rush',
        type: 'Technical',
        description: 'Intelligent maze navigation. Program your micro-bot to map and solve a complex maze in record time.',
        rules: ['Autonomous code only', 'Max size: 15x15cm', '3 attempts per team', 'Maze revealed at start'],
        prizePool: '₹10,000',
        coordinators: ['Athula A Bhat', 'G Rahul Rao'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=1200&q=80',
        date: '21 MAR',
        tags: ['Robotics', 'Maze', 'Coding']
    },
    {
        id: 't-pitch',
        title: 'Pitch-a-thon',
        type: 'Technical',
        description: 'Present your innovative startup ideas to a panel of experts and win exciting prizes to kickstart your journey.',
        rules: ['5-7 minute pitch', '3 minute Q&A', 'Problem statement needed', 'Pitch deck mandatory'],
        prizePool: '₹25,000+',
        coordinators: ['Pai Avani', 'Bhushan Poojary'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
        date: '12 MAR',
        tags: ['Startup', 'Business', 'Idea']
    },

    // --- GAMING EVENTS ---
    {
        id: 'g-val',
        title: 'Valorant Clash',
        type: 'Gaming',
        description: 'Join the 5v5 Valorant Tactical Tournament. High-stakes competition on dedicated ultra-low latency servers.',
        rules: ['Team of 5', 'Standard competitive rules', 'Double elimination', 'Bring own peripherals'],
        prizePool: '₹40,000',
        coordinators: ['U Pradyumna', 'Sathwik S Bhat'],
        fee: 500,
        visual: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
        date: 'MAR 24-25',
        tags: ['5v5', 'FPS', 'Valorant']
    },
    {
        id: 'g-bgmi',
        title: 'BGMI Battlegrounds',
        type: 'Gaming',
        description: 'Battle Royale combat. Drop into Erangel and see if your squad has what it takes to be the last one standing.',
        rules: ['Squad of 4', 'Mobile platform only', 'Competitive settings', 'No emulators/triggers'],
        prizePool: '₹30,000',
        coordinators: ['U Pradyumna', 'Sathwik S Bhat'],
        fee: 400,
        visual: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&q=80',
        date: 'MAR 24-25',
        tags: ['Squad', 'Mobile', 'BGMI']
    },

    // --- CULTURAL EVENTS ---
    {
        id: 'cm-marathon',
        title: 'Musical Marathon',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'A competitive singing championship showcasing vocal talent across classical and modern music styles.',
        rules: ['Max 3 per group', 'No auto-tune allowed', '5 min time limit', 'Live instruments permitted'],
        prizePool: '₹15,000',
        coordinators: ['Chitkala', 'Akash'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
        date: '21 MAR',
        tags: ['Singing', 'Music', 'Live']
    },
    {
        id: 'cd-groove',
        title: 'Groove Gala',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'High-energy solo dance battle fusing modern street-style with traditional dance forms.',
        rules: ['Solo participation', 'Original choreography', 'Props allowed', '3 min performance'],
        prizePool: '₹10,000',
        coordinators: ['Rachana', 'Ananya'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
        date: '22 MAR',
        tags: ['Dance', 'Solo', 'Grooxe'],
        videoUrl: 'https://cdn.pixabay.com/video/2021/08/04/83949-584736183_tiny.mp4'
    },
    {
        id: 'cd-mime',
        title: 'Neon Mime',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'The art of silent storytelling. Express detailed themes and stories without using a single word.',
        rules: ['Group performance (4-8)', 'No background vocals', 'White face-paint mandatory', '10 min maximum'],
        prizePool: '₹12,000',
        coordinators: ['Surabhi', 'Viraj'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
        date: '21 MAR',
        tags: ['Drama', 'Silent', 'Acting']
    },
    {
        id: 'cf-3d',
        title: '3D Art Challenge',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'Perspective-based drawing competition where students create amazing optical illusions on paper.',
        rules: ['Solo entry', 'Canvas provided', 'Dry media only', '3 hour duration'],
        prizePool: '₹5,000',
        coordinators: ['Fine Arts Unit'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80',
        date: '20 MAR',
        tags: ['Sketching', '3D Art', 'Creative']
    },
    {
        id: 'cm-pixel',
        title: 'Pixel Perfect',
        type: 'Cultural',
        category: 'Promotional',
        description: 'On-spot photography competition. Capture the best moments of the festival through your lens.',
        rules: ['On-spot registration', 'Edit within phone only', 'Max 3 submissions', 'Theme-based'],
        prizePool: '₹8,000',
        coordinators: ['Media Club'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=1200&q=80',
        date: 'Festival Duration',
        tags: ['Photo', 'Camera', 'Capture']
    },
    {
        id: 'cm-reels',
        title: 'Reel Flow',
        type: 'Cultural',
        category: 'Promotional',
        description: 'Short-form video storytelling. Create engaging Reels that capture the vibrant energy of Varnothsava.',
        rules: ['Duration: 15-60s', 'Original music/audio', 'Must include fest branding', 'Judged on creativity'],
        prizePool: '₹5,000',
        coordinators: ['Media Club'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80',
        date: 'Festival Duration',
        tags: ['Video', 'Reels', 'Social']
    },
    {
        id: 'cg-anime',
        title: 'Anime Quiz',
        type: 'Cultural',
        category: 'General',
        description: 'Test your knowledge on anime and pop culture in this fun and interactive trivia session.',
        rules: ['Team of 2', '3 rounds of trivia', 'Visual & Audio rounds', 'No mobile usage'],
        prizePool: '₹3,000',
        coordinators: ['Advaith'],
        fee: 100,
        visual: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1200&q=80',
        date: '22 MAR',
        tags: ['Anime', 'Quiz', 'Trivia']
    },
    {
        id: 'cg-ink',
        title: 'Ink & Imagination',
        type: 'Cultural',
        category: 'General',
        description: 'Creative writing and poetry slam. Express your thoughts and stories through beautiful words and verses.',
        rules: ['Solo entry', 'Theme given on spot', 'Multi-language support', 'Original pieces only'],
        prizePool: 'TBA',
        coordinators: ['Advaith'],
        fee: 100,
        visual: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
        date: '21 MAR',
        tags: ['Writing', 'Poetry', 'Words']
    },
    {
        id: 'cg-mehandi',
        title: 'Traditional Mehandi',
        type: 'Cultural',
        category: 'General',
        description: 'Express your artistic talent through traditional and modern Mehandi designs.',
        rules: ['Solo participation', 'Traditional & Modern mix', '2 hour limit', 'Judged on detail'],
        prizePool: '₹2,500',
        coordinators: ['Cultural Unit'],
        fee: 100,
        visual: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
        date: '20 MAR',
        tags: ['Art', 'Design', 'Henna']
    }
]
