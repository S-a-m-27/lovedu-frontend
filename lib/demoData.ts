// Demo data for the chat interface
export const demoMessages = [
  {
    id: '1',
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    role: 'assistant' as const,
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    source: 'internal' as const
  },
  {
    id: '2',
    content: 'I need help with my research paper on artificial intelligence in education.',
    role: 'user' as const,
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
  },
  {
    id: '3',
    content: 'I\'d be happy to help you with your research paper on AI in education! I can assist you with:\n\n• Literature review and finding relevant sources\n• Structuring your paper and organizing arguments\n• Writing assistance and proofreading\n• Citation formatting and academic writing standards\n\nWhat specific aspect would you like to start with?',
    role: 'assistant' as const,
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    source: 'internal' as const
  },
  {
    id: '4',
    content: 'Can you help me find recent studies on AI chatbots in university settings?',
    role: 'user' as const,
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
  },
  {
    id: '5',
    content: 'Based on my search, here are some recent studies on AI chatbots in university settings:\n\n1. "Chatbot Integration in Higher Education: A Systematic Review" (2023) - Found that 78% of students reported improved learning outcomes\n\n2. "AI-Powered Academic Support Systems" (2023) - Demonstrated 40% reduction in administrative queries\n\n3. "Personalized Learning with Conversational AI" (2024) - Showed significant improvement in student engagement\n\nWould you like me to provide more details on any of these studies or help you incorporate them into your paper?',
    role: 'assistant' as const,
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    source: 'web' as const
  }
]

export const demoAssistants = [
  {
    id: 'typeX',
    name: 'KU Advisor',
    description: 'Kuwait University advisor for all majors - academic regulations, registration, GPA, graduation requirements, and official procedures',
    icon: '⚖️'
  },
  {
    id: 'references',
    name: 'Student Rights Advisor',
    description: 'Protect and clarify student academic rights at Kuwait University - grades, GPA, appeals, complaints, and grievance pathways',
    icon: '📚'
  },
  {
    id: 'academicReferences',
    name: 'References',
    description: 'APA 7th edition referencing expert for Kuwait University thesis - format references and in-text citations according to KU requirements',
    icon: '📖'
  },
  {
    id: 'therapyGPT',
    name: 'Success Stories',
    description: 'Real success stories of KU students who overcame academic, psychological, or institutional challenges',
    icon: '💙'
  },
  {
    id: 'whatsTrendy',
    name: "What's Trendy",
    description: 'Discover upcoming trends and events relevant to university life, career development, innovation, and student engagement',
    icon: '🔥'
  }
]

