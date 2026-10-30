export type Post = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
  time: string;
  topic: string;
  company: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  following?: boolean;
  open?: boolean;
  note?: string;
  referral?: boolean;
};
export type Person = {
  name: string;
  role: string;
  initials: string;
  color: string;
  detail: string;
};
export type ReferralOpportunity = {
  id?: string;
  own?: boolean;
  description?: string;
  company: string;
  letter: string;
  title: string;
  location: string;
  skills: string;
  person: string;
  color: string;
};
