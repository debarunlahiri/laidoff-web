export type ChatMessage = {
  id: string;
  text: string;
  outgoing: boolean;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  unread: number;
  messages: ChatMessage[];
};

export const initialConversations: Conversation[] = [
  {
    id: "marcus",
    name: "Marcus Johnson",
    initials: "MJ",
    color: "blue",
    role: "Frontend Engineer at Orbit",
    unread: 0,
    messages: [
      {
        id: "m1",
        text: "Hi Jamie! Thanks for connecting. Happy to share more about the frontend roles at Orbit.",
        outgoing: false,
        time: "10:24 AM",
      },
      {
        id: "m2",
        text: "That would be great, Marcus. I’d love to learn more about the team.",
        outgoing: true,
        time: "10:26 AM",
      },
      {
        id: "m3",
        text: "Of course! We’re a small team working with React and TypeScript. Send over your portfolio and I can help you find a role that fits.",
        outgoing: false,
        time: "10:28 AM",
      },
    ],
  },
  {
    id: "emily",
    name: "Emily Wilson",
    initials: "EW",
    color: "peach",
    role: "Talent Partner at Bloom",
    unread: 1,
    messages: [
      {
        id: "e1",
        text: "Hi Jamie, I came across your profile through our community. Are you open to frontend opportunities?",
        outgoing: false,
        time: "9:15 AM",
      },
      {
        id: "e2",
        text: "Hi Emily! Yes, I’m exploring my next opportunity. I’d love to hear more.",
        outgoing: true,
        time: "9:22 AM",
      },
      {
        id: "e3",
        text: "Wonderful! We have a remote role that could be a good match. Would you be free for a quick chat this week?",
        outgoing: false,
        time: "9:30 AM",
      },
    ],
  },
  {
    id: "aisha",
    name: "Aisha Patel",
    initials: "AP",
    color: "lavender",
    role: "Senior Product Manager",
    unread: 1,
    messages: [
      {
        id: "a1",
        text: "Your post about starting a new chapter really resonated with me. Thanks for sharing it.",
        outgoing: false,
        time: "8:40 AM",
      },
      {
        id: "a2",
        text: "Thank you, Aisha. It helps to know we’re not figuring this out alone.",
        outgoing: true,
        time: "8:46 AM",
      },
      {
        id: "a3",
        text: "Absolutely. Happy to look over your portfolio if you’d like a fresh perspective!",
        outgoing: false,
        time: "8:50 AM",
      },
    ],
  },
];
