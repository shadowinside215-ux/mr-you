import { Translation } from './types';

export const BUSINESS_INFO = {
  name: 'Mr You',
  phone: '05 30 18 98 22',
  phoneRaw: '+212530189822',
  address: 'IMM 3, RESIDENCE SALIMA II RDC MAG N 1, Sala Al Jadida 11100, Morocco',
  mapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.348622153344!2d-6.7554!3d33.9845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7694949494949%3A0x949494949494949!2sSala%20Al%20Jadida!5e0!3m2!1sen!2sma!4v1710189822000!5m2!1sen!2sma',
  googleMapsDirect: 'https://www.google.com/maps/search/?api=1&query=Mr+You+Barber+Hammam+Sala+Al+Jadida',
  instagram: 'https://www.instagram.com/mryou.spa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  rating: 4.0,
  reviewCount: 25,
  openingHours: '10:00 AM - 10:00 PM',
};

export const TRANSLATIONS: Record<string, Translation> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      whyUs: 'Why Us',
      reviews: 'Reviews',
      gallery: 'Gallery',
      location: 'Location',
      book: 'Book Now',
    },
    hero: {
      title: 'Mr You: Professional Barber',
      subtitle: 'Experience the best grooming in Sala Al Jadida. Trust our experts for your perfect look.',
      callNow: 'Call Now',
      bookNow: 'Book Appointment',
    },
    services: {
      title: 'Our Services',
      haircut: { name: 'Haircut', desc: 'Modern and classic styles tailored to your face shape.' },
      beard: { name: 'Beard Trimming', desc: 'Precise shaping and grooming for a sharp look.' },
      grooming: { name: 'Full Grooming', desc: 'The complete package for the modern gentleman.' },
    },
    whyUs: {
      title: 'Why Choose Mr You',
      items: [
        { title: 'Experienced Barbers', desc: 'Our team has years of expertise in men\'s grooming.' },
        { title: 'Clean Environment', desc: 'We maintain the highest standards of hygiene and comfort.' },
        { title: 'Quality Services', desc: 'Premium products and attention to every detail.' },
        { title: 'Local Trusted Business', desc: 'Proudly serving the Sala Al Jadida community.' },
      ],
    },
    reviews: {
      title: 'Customer Reviews',
      rating: '4.0 Rating',
      items: [
        { name: 'Mohammed Atbuosh', text: 'Excellent salon, clean, and artistic young men. Hussein, God bless, has golden fingers.', rating: 5 },
        { name: 'Med Anas Mrabti', text: 'The guys working there are great, but the service management needs attention.', rating: 3 },
      ],
    },
    gallery: {
      title: 'Our Gallery',
    },
    location: {
      title: 'Find Us',
      address: 'Address',
      hours: 'Opening Hours',
      phone: 'Phone',
      openNow: 'Open Now',
    },
    form: {
      title: 'Book an Appointment',
      name: 'Full Name',
      phone: 'Phone Number',
      service: 'Select Service',
      time: 'Preferred Time',
      submit: 'Send Request',
      success: 'Thank you! We will contact you shortly.',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      whyUs: 'Pourquoi Nous',
      reviews: 'Avis',
      gallery: 'Galerie',
      location: 'Emplacement',
      book: 'Réserver',
    },
    hero: {
      title: 'Mr You: Coiffeur Professionnel',
      subtitle: 'Découvrez le meilleur du toilettage à Sala Al Jadida. Faites confiance à nos experts.',
      callNow: 'Appeler',
      bookNow: 'Preندre RDV',
    },
    services: {
      title: 'Nos Services',
      haircut: { name: 'Coupe de cheveux', desc: 'Styles modernes et classiques adaptés à votre visage.' },
      beard: { name: 'Taille de barbe', desc: 'Façonnage précis pour un look impeccable.' },
      grooming: { name: 'Soins Complets', desc: 'Le forfait complet pour l\'homme moderne.' },
    },
    whyUs: {
      title: 'Pourquoi Choisir Mr You',
      items: [
        { title: 'Barbiers Expérimentés', desc: 'Notre équipe a des années d\'expertise.' },
        { title: 'Environnement Propre', desc: 'Nous maintenons les plus hauts standards d\'hygiène.' },
        { title: 'Services de Qualité', desc: 'Produits premium et attention aux détails.' },
        { title: 'Confiance Locale', desc: 'Fier de servir la communauté de Sala Al Jadida.' },
      ],
    },
    reviews: {
      title: 'Avis Clients',
      rating: 'Note 4.0',
      items: [
        { name: 'Mohammed Atbuosh', text: 'Salon excellent, propre, et jeunes artistes. Hussein, que Dieu le bénisse, a des doigts en or.', rating: 5 },
        { name: 'Med Anas Mrabti', text: 'Les gars qui y travaillent sont super, mais la gestion du service a besoin d\'attention.', rating: 3 },
      ],
    },
    gallery: {
      title: 'Notre Galerie',
    },
    location: {
      title: 'Nous Trouver',
      address: 'Adresse',
      hours: 'Horaires d\'ouverture',
      phone: 'Téléphone',
      openNow: 'Ouvert Maintenant',
    },
    form: {
      title: 'Prendre Rendez-vous',
      name: 'Nom Complet',
      phone: 'Numéro de Téléphone',
      service: 'Choisir un Service',
      time: 'Heure Souhaitée',
      submit: 'Envoyer la Demande',
      success: 'Merci ! Nous vous contacterons bientôt.',
    },
    footer: {
      rights: 'Tous droits réservés.',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      services: 'خدماتنا',
      whyUs: 'لماذا نحن',
      reviews: 'آراء العملاء',
      gallery: 'المعرض',
      location: 'موقعنا',
      book: 'احجز الآن',
    },
    hero: {
      title: 'Mr You: حلاقة احترافية',
      subtitle: 'استمتع بأفضل خدمات الحلاقة في سلا الجديدة. ثق بخبرائنا للحصول على مظهر مثالي.',
      callNow: 'اتصل الآن',
      bookNow: 'حجز موعد',
    },
    services: {
      title: 'خدماتنا',
      haircut: { name: 'حلاقة الشعر', desc: 'قصات عصرية وكلاسيكية تناسب شكل وجهك.' },
      beard: { name: 'تشذيب اللحية', desc: 'تحديد وتشذيب دقيق لمظهر جذاب.' },
      grooming: { name: 'عناية كاملة', desc: 'الباقة الكاملة للرجل العصري.' },
    },
    whyUs: {
      title: 'لماذا تختار Mr You',
      items: [
        { title: 'حلاقون ذوو خبرة', desc: 'فريقنا لديه سنوات من الخبرة في الحلاقة.' },
        { title: 'بيئة نظيفة', desc: 'نحافظ على أعلى معايير النظافة والراحة.' },
        { title: 'خدمات عالية الجودة', desc: 'منتجات فاخرة واهتمام بكل التفاصيل.' },
        { title: 'عمل محلي موثوق', desc: 'نخدم مجتمع سلا الجديدة بكل فخر.' },
      ],
    },
    reviews: {
      title: 'آراء العملاء',
      rating: 'تقييم 4.0',
      items: [
        { name: 'Mohammed Atbuosh', text: 'صالون ممتاز، نظيف، وشباب فنانين. حسين تبارك الله أصابع ذهبية.', rating: 5 },
        { name: 'Med Anas Mrabti', text: 'الدراري لي خدامين عند الله إعمرها دار ولاكين التسيير يحتاج اهتمام.', rating: 3 },
      ],
    },
    gallery: {
      title: 'معرضنا',
    },
    location: {
      title: 'موقعنا',
      address: 'العنوان',
      hours: 'ساعات العمل',
      phone: 'الهاتف',
      openNow: 'مفتوح الآن',
    },
    form: {
      title: 'حجز موعد',
      name: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      service: 'اختر الخدمة',
      time: 'الوقت المفضل',
      submit: 'إرسال الطلب',
      success: 'شكراً لك! سنتصل بك قريباً.',
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.',
    },
  },
};
