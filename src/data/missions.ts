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
    tags?: string[]
    videoUrl?: string
    brochureUrl?: string
    minTeamSize?: number
    maxTeamSize?: number
    rounds?: {
        round1?: string[]
        round2?: string[]
    };
    location?: string
    teamFormate?: string
}

export const missions: Event[] = [
    // --- TECHNICAL EVENTS ---
    {
        id: 't-algo',
        title: 'Algorithm Roulette',
        type: 'Technical',
        description: 'A team-based machine learning challenge where participants spin a wheel to receive a random algorithm, preprocess datasets, and build models within a time limit',
        rules: [
            "Teams spin a wheel to receive a random machine learning algorithm at the start",
            "Teams must preprocess the provided dataset and apply the assigned algorithm",
            "Participants must submit their predictions within the given time limits",
            "Teams must present their solutions to the judges in the final round",
            "Use of the internet is restricted except for documentation purposes"
        ],

        regulations: []
        ,
        rounds: {
            round1: [
                "Spin the wheel to receive a random machine learning algorithm",
                "Teams preprocess and apply the assigned algorithm to the dataset within 30 minutes",
                "Top-performing teams are shortlisted based on accuracy and initial insights"
            ],
            round2: [
                "Refine the models and prepare a short presentation",
                "Present to judges, answer rapid-fire questions, and demonstrate creativity"
            ]
        }
        ,
        evaluation: [
            "Model Accuracy and Insights",
            "Creativity in Problem-Solving",
            "Clarity in Presentation and Explanation"
        ],

        prizePool: '₹20,000+',
        coordinators: ['Ms.Shalaka', 'Ananya Bhat', 'Yathika P Amin'],
        coordinatorsContact: ['+91 9739118147', '+91 94831 46270', '+91 77950 62567'],
        fee: 200,
        visual: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
        date: '11 MAR',
        tags: ['ML', 'Coding', 'Python'],
        videoUrl: 'https://cdn.pixabay.com/video/2019/10/05/27538-364402636_tiny.mp4',
        brochureUrl: '/brochures/algorithm_roulette.pdf',
        minTeamSize: 2,
        maxTeamSize: 2
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
        videoUrl: 'https://cdn.pixabay.com/video/2023/11/04/187747-880905973_tiny.mp4',
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['AI', 'Product', 'Gen-AI'],
        minTeamSize: 1,
        maxTeamSize: 2
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
        tags: ['Robotics', 'Hardware', 'Sensors'],
        minTeamSize: 1,
        maxTeamSize: 2
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
        tags: ['Robotics', 'Sports', 'Mechanics'],
        minTeamSize: 2,
        maxTeamSize: 3
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
        tags: ['Aero', 'Design', 'Physics'],
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['Electronics', 'Circuit', 'Logic'],
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['Robotics', 'Maze', 'Coding'],
        minTeamSize: 1,
        maxTeamSize: 2
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
        tags: ['Startup', 'Business', 'Idea'],
        minTeamSize: 1,
        maxTeamSize: 4
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
        tags: ['5v5', 'FPS', 'Valorant'],
        minTeamSize: 5,
        maxTeamSize: 5
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
        tags: ['Squad', 'Mobile', 'BGMI'],
        minTeamSize: 4,
        maxTeamSize: 4
    },

    // --- CULTURAL EVENTS ---
    {
        id: 'Solo-Singing',
        title: 'BHAVA TARANGA',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'A soulful solo singing event showcasing the beauty and depth of Bhavageethe.Participants mesmerize the audience using pure vocals with emotion and expression.',
        rules: [
            "No accompanying instruments are allowed",
            "Only Bhavageethe is allowed",
            "Shruti is allowed",
            "Karaoke is not allowed",
            "Participants must report 15 minutes prior to the event"
        ]
        ,
        prizePool: '₹15,000',
        coordinators: ['Unknown', 'Abhishek kini', 'Shreerama'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
        date: '11-MARCH',
        location: 'Admin Block Seminar Hall',
        tags: ['Singing', 'Music', 'Live'],
        // minTeamSize: 1,
        // maxTeamSize: 3,
        teamFormate: 'Solo'
    },
    {
        id: 'Group-Singing',
        title: 'Janapada nada',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'A vibrant group singing competition celebrating the spirit of folk music.Teams bring traditional rhythms to life with harmony, energy, and culture.',
        rules: [
            "Accompanying instruments are allowed (maximum 2)",
            "Maximum 7 participants including instrumentalists",
            "Shruti is allowed",
            "Karaoke is not allowed",
            "Participants must report 15 minutes prior to the event",
            "Each participant will get 5+1 minutes",
        ]
        ,
        prizePool: '₹10,000',
        coordinators: ['Unknown', 'Akash', 'Vaishnavi'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
        date: '11-MARCH',
        // tags: ['Dance', 'Group', 'Grooxe'],
        videoUrl: 'https://cdn.pixabay.com/video/2021/08/04/83949-584736183_tiny.mp4',
        location: 'Admin Block Seminar Hall',
        minTeamSize: 1,
        maxTeamSize: 1,
        teamFormate: 'Group'
    },
    {
        id: 'Solo-Classical-Dance',
        title: 'Thaka  Dhimi Tha',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'A graceful platform for classical dancers to express rhythm, devotion, and storytelling.Any Indian classical dance form is welcome with elegance and precision.',
        rules: [
            "Participants will get 5+1 minutes each",
            "Recorded music is allowed",
            "Any Indian pure classical dance form may be performed",
            "The song must be submitted to the organizers one day prior to the competition",
            "Film songs based on classical music may be used",
            "Props are allowed",
            "Use of water, colour, gas, and fire is strictly prohibited",
            "Participants must report 15 minutes prior to the event"
        ]
        ,
        prizePool: '₹12,000',
        coordinators: ['Unknown', 'Sneha', 'Amrutha'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
        location: 'Library block,Seminar hall',
        date: '11-MARCH',
        // tags: ['Drama', 'Silent', 'Acting'],
        // minTeamSize: 4,
        // maxTeamSize: 8
        teamFormate: 'Solo'
    },
    {
        id: 'Group-Western-Dance',
        title: 'Groove Gala',
        type: 'Cultural',
        category: 'Hobby Club',
        description: 'A high-energy western dance battle packed with synchronization and style.Teams set the stage on fire with creativity, coordination, and powerful moves.',
        rules: [
            "Each can have minimum of 4 and maximum 10 members ",
            "Each team will get 5+6 minutes ",
            "Recorded music is allowed",
            "Props may be used",
            "Western dance forms can be performed",
            "The song must be submitted to the organizers one day prior to the competition",
            "Obscene dressing, presentation, and vulgarity are strictly not allowed",
            "Use of water, colour, gas, and fire is prohibited",
            "Participants must report 15 minutes prior to the event"
        ]
        ,
        prizePool: '₹5,000',
        coordinators: ['Unknown','Ananya Salian','Dharthi'],
        fee: 150,
        visual: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80',
        location: 'Open Air Auditorium ',
        date: '11-MARCH',
        // tags: ['Sketching', '3D Art', 'Creative'],
        minTeamSize: 4,
        maxTeamSize: 10,
        teamFormate:'Group'
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
        tags: ['Photo', 'Camera', 'Capture'],
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['Video', 'Reels', 'Social'],
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['Anime', 'Quiz', 'Trivia'],
        minTeamSize: 2,
        maxTeamSize: 2
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
        tags: ['Writing', 'Poetry', 'Words'],
        minTeamSize: 1,
        maxTeamSize: 1
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
        tags: ['Art', 'Design', 'Henna'],
        minTeamSize: 1,
        maxTeamSize: 1
    }
]
