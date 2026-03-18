export type Language = 'en' | 'fr' | 'ar';

export interface Translation {
  nav: {
    home: string;
    services: string;
    whyUs: string;
    reviews: string;
    gallery: string;
    location: string;
    book: string;
  };
  hero: {
    title: string;
    subtitle: string;
    callNow: string;
    bookNow: string;
  };
  services: {
    title: string;
    haircut: { name: string; desc: string };
    beard: { name: string; desc: string };
    grooming: { name: string; desc: string };
    hammam: { name: string; desc: string };
  };
  whyUs: {
    title: string;
    items: { title: string; desc: string }[];
  };
  reviews: {
    title: string;
    rating: string;
    items: { name: string; text: string; rating: number }[];
  };
  gallery: {
    title: string;
  };
  location: {
    title: string;
    address: string;
    hours: string;
    phone: string;
    openNow: string;
  };
  form: {
    title: string;
    name: string;
    phone: string;
    service: string;
    time: string;
    submit: string;
    success: string;
  };
  footer: {
    rights: string;
  };
}
