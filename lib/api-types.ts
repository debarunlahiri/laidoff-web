export type ApiCompany = { id: string; name: string };
export type ApiPost = {
  following: number | boolean;
  note?: string;
  noteSource?: string;
  id: string;
  authorId: string | null;
  name: string;
  role: string;
  text: string;
  topic: string;
  company: string;
  companyId: string | null;
  image: string | null;
  createdAt: string;
  anonymous: number | boolean;
  openToWork: number | boolean;
  own: number | boolean;
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  reaction: "like" | "dislike" | null;
  saved: number | boolean;
  reposted: number | boolean;
};
export type ApiComment = {
  id: string;
  text: string;
  name: string;
  authorId: string;
  createdAt: string;
};
export type ApiPerson = {
  id: string;
  name: string;
  role: string;
  openToWork: number | boolean;
  following: number | boolean;
};
export type ApiConnection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted";
  name: string;
  role: string;
};
export type ApiReferral = {
  id: string;
  companyId: string;
  company: string;
  authorId: string;
  person: string;
  title: string;
  location: string;
  skills: string;
  description: string;
  status: "open" | "closed";
  own: number | boolean;
  requestStatus: "pending" | "accepted" | "declined" | null;
};
export type ApiReferralRequest = {
  userId: string;
  name: string;
  role: string;
  status: string;
};
export type ApiConversation = {
  id: string;
  userId: string;
  name: string;
  role: string;
  preview: string | null;
  lastMessageAt: string | null;
  unread: number;
};
export type ApiMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
};
export type ApiNotification = {
  id: string;
  type: string;
  resourceId: string | null;
  text: string;
  createdAt: string;
  readAt: string | null;
};
export type ApiInsights = {
  year: number;
  notice: string;
  monthly: { month: number; rolesAffected: number; reports: number }[];
  companies: {
    id: string;
    name: string;
    rolesAffected: number;
    headcount: number | null;
    hires: number | null;
    reports: number;
  }[];
};
