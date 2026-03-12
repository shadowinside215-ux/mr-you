/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  Scissors, 
  Waves, 
  User, 
  CheckCircle, 
  ChevronRight, 
  Menu, 
  X,
  Globe,
  Calendar,
  Instagram,
  Plus,
  Trash2,
  LogOut,
  LogIn,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from './types';
import { BUSINESS_INFO, TRANSLATIONS } from './constants';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc,
  setDoc,
  serverTimestamp,
  updateDoc
} from './firebase';

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Golden Hat */}
    <path d="M25 35 L75 35 L70 15 L30 15 Z" fill="#FFD700" />
    <rect x="20" y="35" width="60" height="4" rx="2" fill="#FFD700" />
    {/* Sunglasses */}
    <rect x="30" y="45" width="18" height="12" rx="4" fill="#FFD700" />
    <rect x="52" y="45" width="18" height="12" rx="4" fill="#FFD700" />
    <path d="M48 51 L52 51" stroke="#FFD700" strokeWidth="2" />
    {/* Big Beard (Bread typo) */}
    <path d="M30 60 Q30 95 50 95 Q70 95 70 60 Q60 75 50 75 Q40 75 30 60" fill="#FFD700" />
  </svg>
);

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [serviceImages, setServiceImages] = useState<Record<string, string>>({});
  const [stagedImages, setStagedImages] = useState<{ url: string, type: 'gallery' | 'service', id?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [showUrlInput, setShowUrlInput] = useState<{ type: 'gallery' | 'service', id?: string } | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const t = TRANSLATIONS[lang];

  const ADMIN_NAME = "sam";
  const ADMIN_PASS = "sam123";
  const ADMIN_EMAIL = "sam@mryou.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL || currentUser?.email === "dragonballsam86@gmail.com");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(images);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const services: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        services[doc.id] = doc.data().url;
      });
      setServiceImages(services);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = `${BUSINESS_INFO.name} | ${t.hero.title}`;
    
    // Update meta description and social tags
    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name')) {
          el.setAttribute('name', selector.split('"')[1]);
        } else if (selector.startsWith('meta[property')) {
          el.setAttribute('property', selector.split('"')[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', 'content', t.hero.subtitle);
    updateMeta('meta[property="og:title"]', 'content', `${BUSINESS_INFO.name} | ${t.hero.title}`);
    updateMeta('meta[property="og:description"]', 'content', t.hero.subtitle);
    updateMeta('meta[property="twitter:title"]', 'content', `${BUSINESS_INFO.name} | ${t.hero.title}`);
    updateMeta('meta[property="twitter:description"]', 'content', t.hero.subtitle);
  }, [lang, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.name === ADMIN_NAME && loginData.password === ADMIN_PASS) {
      try {
        // We use a consistent email for the 'sam' user
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
        setShowLoginModal(false);
        setLoginData({ name: '', password: '' });
      } catch (error: any) {
        // Newer Firebase versions use 'auth/invalid-credential' for both wrong password and missing user
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          // Try to create the user if it's the first time
          try {
            await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
            setShowLoginModal(false);
            setLoginData({ name: '', password: '' });
          } catch (createError: any) {
            if (createError.code === 'auth/operation-not-allowed') {
              alert("CRITICAL: Email/Password login is disabled in your Firebase Console. Please enable it in Authentication > Sign-in method.");
            } else {
              console.error("Auth creation failed", createError);
              alert("Login failed: " + createError.message);
            }
          }
        } else if (error.code === 'auth/operation-not-allowed') {
          alert("CRITICAL: Email/Password login is disabled in your Firebase Console. Please enable it in Authentication > Sign-in method.");
        } else {
          console.error("Login failed", error);
          alert("Login failed: " + error.message);
        }
      }
    } else {
      alert("Invalid name or password");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'gallery' | 'service', serviceId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("File is too large. Please use images smaller than 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setStagedImages(prev => [...prev, { url: base64String, type, id: serviceId }]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddByUrl = () => {
    if (!imageUrlInput || !showUrlInput) return;
    setStagedImages(prev => [...prev, { url: imageUrlInput, type: showUrlInput.type, id: showUrlInput.id }]);
    setImageUrlInput('');
    setShowUrlInput(null);
  };

  const saveAllStagedImages = async () => {
    if (stagedImages.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const img of stagedImages) {
        if (img.type === 'gallery') {
          await addDoc(collection(db, 'gallery'), {
            url: img.url,
            createdAt: serverTimestamp()
          });
        } else if (img.id) {
          await setDoc(doc(db, 'services', img.id), {
            url: img.url,
            updatedAt: serverTimestamp()
          });
        }
      }
      setStagedImages([]);
      alert("All pictures have been saved successfully to the website!");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save some pictures. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const deleteServiceImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('success');
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  const navLinks = [
    { id: 'services', label: t.nav.services },
    { id: 'why-us', label: t.nav.whyUs },
    { id: 'reviews', label: t.nav.reviews },
    { id: 'gallery', label: t.nav.gallery },
    { id: 'location', label: t.nav.location },
  ];

  return (
    <div className={`min-h-screen font-sans bg-primary text-yellow-400 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-primary/90 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <span className="font-bold text-2xl tracking-tight text-yellow-400 hidden sm:block uppercase">MR YOU</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.id} href={`#${link.id}`} className="font-medium text-yellow-400 hover:text-secondary transition-colors">
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 border-l border-white/10 pl-6 ml-2">
              <a href={BUSINESS_INFO.instagram} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-secondary transition-colors mr-2">
                <Instagram size={20} />
              </a>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded text-xs font-bold ${lang === 'en' ? 'bg-secondary text-primary' : 'text-yellow-400 hover:text-white'}`}>EN</button>
              <button onClick={() => setLang('fr')} className={`px-2 py-1 rounded text-xs font-bold ${lang === 'fr' ? 'bg-secondary text-primary' : 'text-yellow-400 hover:text-white'}`}>FR</button>
              <button onClick={() => setLang('ar')} className={`px-2 py-1 rounded text-xs font-bold ${lang === 'ar' ? 'bg-secondary text-primary' : 'text-yellow-400 hover:text-white'}`}>AR</button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <a href={BUSINESS_INFO.instagram} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-secondary transition-colors">
              <Instagram size={20} />
            </a>
            <div className="flex items-center gap-1">
              <button onClick={() => setLang('en')} className={`w-8 h-8 rounded text-[10px] font-bold ${lang === 'en' ? 'bg-secondary text-primary' : 'bg-white/5 text-yellow-400'}`}>EN</button>
              <button onClick={() => setLang('fr')} className={`w-8 h-8 rounded text-[10px] font-bold ${lang === 'fr' ? 'bg-secondary text-primary' : 'bg-white/5 text-yellow-400'}`}>FR</button>
              <button onClick={() => setLang('ar')} className={`w-8 h-8 rounded text-[10px] font-bold ${lang === 'ar' ? 'bg-secondary text-primary' : 'bg-white/5 text-yellow-400'}`}>AR</button>
            </div>
            <button onClick={toggleMenu} className="p-2 text-gold">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-primary shadow-2xl border-t border-white/5 md:hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navLinks.map(link => (
                  <a 
                    key={link.id} 
                    href={`#${link.id}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-semibold py-2 border-b border-white/5 text-yellow-400"
                  >
                    {link.label}
                  </a>
                ))}
                <a 
                  href={`tel:${BUSINESS_INFO.phoneRaw}`}
                  className="btn-secondary mt-4"
                >
                  <Phone size={20} /> {t.hero.callNow}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 transform translate-x-1/4 -z-10" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-secondary/20">
              <Star size={16} fill="currentColor" />
              {BUSINESS_INFO.rating} {t.reviews.rating}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-yellow-400">
              {t.hero.title}
            </h1>
            <p className="text-lg text-yellow-400 mb-10 max-w-lg">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="btn-secondary">
                <Phone size={20} /> {t.hero.callNow}
              </a>
              <a href="#appointment" className="btn-primary border border-white/10 hover:bg-white/5">
                <Calendar size={20} /> {t.hero.bookNow}
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900 flex items-center justify-center">
              {(() => {
                const stagedHero = stagedImages.find(img => img.type === 'service' && img.id === 'hero');
                const displayUrl = stagedHero ? stagedHero.url : serviceImages['hero'];
                
                if (displayUrl) {
                  return (
                    <div className="relative w-full h-full">
                      <img 
                        src={displayUrl} 
                        alt="Mr You Barbershop" 
                        className={`w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ${stagedHero ? 'opacity-40' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      {stagedHero && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-yellow-400 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">Pending Save</span>
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <div className="text-center p-6">
                    <ImageIcon size={48} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 text-sm">No Hero Image</p>
                    {isAdmin && (
                      <div className="mt-4 flex flex-col gap-2">
                        <label className="inline-block cursor-pointer bg-secondary text-primary px-4 py-2 rounded-lg font-bold text-xs">
                          Upload Hero File
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'service', 'hero')} accept="image/*" />
                        </label>
                        <button 
                          onClick={() => setShowUrlInput({ type: 'service', id: 'hero' })}
                          className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-white/20 transition-all"
                        >
                          Add by URL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
              {isAdmin && (serviceImages['hero'] || stagedImages.some(img => img.id === 'hero')) && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <label className="cursor-pointer bg-secondary/80 backdrop-blur-md text-primary p-2 rounded-full shadow-lg">
                    <Upload size={16} />
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'service', 'hero')} accept="image/*" />
                  </label>
                  <button 
                    onClick={() => setShowUrlInput({ type: 'service', id: 'hero' })}
                    className="bg-white/80 backdrop-blur-md text-primary p-2 rounded-full shadow-lg"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => deleteServiceImage('hero')}
                    className="bg-red-500/80 backdrop-blur-md text-white p-2 rounded-full shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl hidden sm:block shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-full flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-secondary font-bold uppercase tracking-wider">{t.location.openNow}</p>
                  <p className="font-bold text-yellow-400">{BUSINESS_INFO.openingHours}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="section-padding bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">{t.services.title}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'haircut', icon: <Scissors />, ...t.services.haircut },
              { id: 'beard', icon: <User />, ...t.services.beard },
              { id: 'grooming', icon: <CheckCircle />, ...t.services.grooming },
            ].map((service, idx) => {
              const stagedImg = stagedImages.find(img => img.type === 'service' && img.id === service.id);
              const displayUrl = stagedImg ? stagedImg.url : serviceImages[service.id];
              
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="bg-primary rounded-3xl shadow-xl border border-white/5 text-center group overflow-hidden"
                >
                  <div className="aspect-video bg-slate-900 relative">
                    {displayUrl ? (
                      <>
                        <img src={displayUrl} alt={service.name} className={`w-full h-full object-cover ${stagedImg ? 'opacity-40' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} referrerPolicy="no-referrer" />
                        {stagedImg && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-yellow-400 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">Pending Save</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {isAdmin && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <label className="cursor-pointer bg-secondary text-primary p-2 rounded-full">
                        <Upload size={20} />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'service', service.id)} accept="image/*" />
                      </label>
                      <button 
                        onClick={() => setShowUrlInput({ type: 'service', id: service.id })}
                        className="bg-white text-primary p-2 rounded-full"
                      >
                        <Plus size={20} />
                      </button>
                      <button 
                        onClick={() => deleteServiceImage(service.id)}
                        className="bg-red-500 text-white p-2 rounded-full"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                    {React.cloneElement(service.icon as React.ReactElement, { size: 32 })}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-yellow-400">{service.name}</h3>
                  <p className="text-yellow-400 text-sm leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="section-padding bg-primary">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative group">
                {(() => {
                  const staged = stagedImages.find(img => img.type === 'service' && img.id === 'why1');
                  const url = staged ? staged.url : serviceImages['why1'];
                  if (url) return (
                    <div className="relative w-full h-full">
                      <img src={url} className={`w-full h-full object-cover ${staged ? 'opacity-40' : ''}`} referrerPolicy="no-referrer" />
                      {staged && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-yellow-400 text-primary px-2 py-1 rounded-full text-[8px] font-bold uppercase animate-pulse">Pending</span></div>}
                    </div>
                  );
                  return <div className="w-full h-full flex items-center justify-center text-slate-800"><ImageIcon /></div>;
                })()}
                {isAdmin && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <label className="cursor-pointer bg-secondary text-primary p-2 rounded-full">
                      <Upload size={16} />
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'service', 'why1')} accept="image/*" />
                    </label>
                    <button onClick={() => setShowUrlInput({ type: 'service', id: 'why1' })} className="bg-white text-primary p-2 rounded-full">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => deleteServiceImage('why1')} className="bg-red-500 text-white p-2 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="aspect-[2/3] rounded-2xl bg-slate-900 border border-white/5 overflow-hidden mt-8 relative group">
                {(() => {
                  const staged = stagedImages.find(img => img.type === 'service' && img.id === 'why2');
                  const url = staged ? staged.url : serviceImages['why2'];
                  if (url) return (
                    <div className="relative w-full h-full">
                      <img src={url} className={`w-full h-full object-cover ${staged ? 'opacity-40' : ''}`} referrerPolicy="no-referrer" />
                      {staged && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-yellow-400 text-primary px-2 py-1 rounded-full text-[8px] font-bold uppercase animate-pulse">Pending</span></div>}
                    </div>
                  );
                  return <div className="w-full h-full flex items-center justify-center text-slate-800"><ImageIcon /></div>;
                })()}
                {isAdmin && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <label className="cursor-pointer bg-secondary text-primary p-2 rounded-full">
                      <Upload size={16} />
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'service', 'why2')} accept="image/*" />
                    </label>
                    <button onClick={() => setShowUrlInput({ type: 'service', id: 'why2' })} className="bg-white text-primary p-2 rounded-full">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => deleteServiceImage('why2')} className="bg-red-500 text-white p-2 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">{t.whyUs.title}</h2>
            <div className="space-y-8">
              {t.whyUs.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center border border-secondary/20">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1 text-yellow-400">{item.title}</h4>
                    <p className="text-yellow-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section-padding bg-slate-950 text-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.reviews.title}</h2>
              <div className="flex items-center gap-2 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < 4 ? "currentColor" : "none"} />
                ))}
                <span className="font-bold ml-2 text-yellow-400">{BUSINESS_INFO.rating} / 5.0</span>
              </div>
            </div>
            <p className="text-yellow-400 max-w-md">
              {BUSINESS_INFO.reviewCount}+ reviews on Google Maps. We take pride in our service quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.reviews.items.map((review, idx) => (
              <div key={idx} className="bg-primary p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex gap-1 text-secondary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="italic mb-6 text-yellow-400">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary text-primary rounded-full flex items-center justify-center font-bold">
                    {review.name[0]}
                  </div>
                  <span className="font-bold text-yellow-400">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="section-padding bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">{t.gallery.title}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Staged Gallery Images */}
            {isAdmin && stagedImages.filter(img => img.type === 'gallery').map((img, idx) => (
              <div key={`staged-${idx}`} className="relative group rounded-2xl overflow-hidden aspect-[3/4] border-2 border-yellow-400/50">
                <img src={img.url} alt="Staged Gallery" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-yellow-400 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">Pending Save</span>
                </div>
                <button 
                  onClick={() => setStagedImages(prev => prev.filter((_, i) => i !== stagedImages.indexOf(img)))}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {galleryImages.length > 0 || stagedImages.some(img => img.type === 'gallery') ? (
              galleryImages.map((img) => (
                <div key={img.id} className="relative group rounded-2xl overflow-hidden aspect-[3/4]">
                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {isAdmin && (
                    <button 
                      onClick={() => deleteGalleryImage(img.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
                <ImageIcon size={48} className="mx-auto mb-4 text-slate-700" />
                <p className="text-slate-500">No images in gallery yet.</p>
              </div>
            )}
            
            {isAdmin && (
              <div className="aspect-[3/4] flex flex-col gap-2">
                <label className="flex-1 border-2 border-dashed border-secondary/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/5 transition-colors">
                  <Plus className="text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase">Upload File</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'gallery')} accept="image/*" />
                </label>
                <button 
                  onClick={() => setShowUrlInput({ type: 'gallery' })}
                  className="border-2 border-dashed border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors"
                >
                  <Globe size={16} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Add by URL</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Appointment Form */}
      <section id="appointment" className="section-padding bg-slate-950">
        <div className="max-w-3xl mx-auto bg-primary p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/5">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 text-yellow-400">{t.form.title}</h2>
            <p className="text-yellow-400">{t.hero.subtitle}</p>
          </div>

          {formStatus === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/10 text-secondary p-8 rounded-2xl text-center border border-secondary/20"
            >
              <CheckCircle size={48} className="mx-auto mb-4" />
              <p className="text-xl font-bold">{t.form.success}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-400">{t.form.name}</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-yellow-400 focus:ring-2 focus:ring-secondary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-400">{t.form.phone}</label>
                  <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-yellow-400 focus:ring-2 focus:ring-secondary outline-none" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-400">{t.form.service}</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-yellow-400 focus:ring-2 focus:ring-secondary outline-none">
                    <option>{t.services.haircut.name}</option>
                    <option>{t.services.beard.name}</option>
                    <option>{t.services.grooming.name}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-400">{t.form.time}</label>
                  <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-yellow-400 focus:ring-2 focus:ring-secondary outline-none" />
                </div>
              </div>
              <button type="submit" className="btn-secondary w-full py-4 text-lg font-bold">
                {t.form.submit}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="section-padding bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">{t.location.title}</h2>
              <div className="space-y-6">
                <a 
                  href={BUSINESS_INFO.googleMapsDirect} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0 border border-secondary/20 group-hover:bg-secondary group-hover:text-primary transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-secondary uppercase text-xs tracking-widest mb-1">{t.location.address}</h5>
                    <p className="font-medium text-yellow-400 group-hover:text-secondary transition-colors">{BUSINESS_INFO.address}</p>
                  </div>
                </a>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0 border border-secondary/20">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-secondary uppercase text-xs tracking-widest mb-1">{t.location.hours}</h5>
                    <p className="font-medium text-yellow-400">{BUSINESS_INFO.openingHours}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0 border border-secondary/20">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-secondary uppercase text-xs tracking-widest mb-1">{t.location.phone}</h5>
                    <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="font-medium text-yellow-400 hover:text-secondary transition-colors">{BUSINESS_INFO.phone}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              <iframe 
                src={BUSINESS_INFO.mapsUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Admin Image Manager */}
      {isAdmin && (
        <section className="section-padding bg-slate-900 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">Admin Image Manager</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {galleryImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square border border-white/5">
                  <img src={img.url} alt="Admin Gallery" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => deleteGalleryImage(img.id)}
                    className="absolute inset-0 flex items-center justify-center bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              {Object.entries(serviceImages).map(([id, url]) => (
                <div key={id} className="relative group rounded-lg overflow-hidden aspect-square border border-white/5">
                  <img src={url} alt={`Service ${id}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/50 px-2 py-0.5 rounded text-[10px] text-yellow-400 uppercase font-bold">
                    {id}
                  </div>
                  <button 
                    onClick={() => deleteServiceImage(id)}
                    className="absolute inset-0 flex items-center justify-center bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-yellow-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 text-yellow-400 mb-6">
              <Logo className="w-10 h-10" />
              <span className="font-bold text-xl tracking-tight text-yellow-400 uppercase">MR YOU</span>
            </div>
            <p className="max-w-sm mb-6 text-yellow-400">
              {t.hero.subtitle}
            </p>
            <div className="flex gap-4">
              <a href={BUSINESS_INFO.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-yellow-400 hover:bg-secondary hover:text-primary transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          <div>
            <h6 className="text-yellow-400 font-bold mb-6 uppercase text-xs tracking-widest">{t.nav.services}</h6>
            <ul className="space-y-3 text-sm">
              <li><a href="#services" className="hover:text-secondary transition-colors">{t.services.haircut.name}</a></li>
              <li><a href="#services" className="hover:text-secondary transition-colors">{t.services.beard.name}</a></li>
              <li><a href="#services" className="hover:text-secondary transition-colors">{t.services.grooming.name}</a></li>
            </ul>
          </div>
          <div>
            <h6 className="text-yellow-400 font-bold mb-6 uppercase text-xs tracking-widest">Admin</h6>
            {user ? (
              <div className="space-y-4">
                <p className="text-xs text-yellow-400">Logged in as {user.email}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <LogIn size={16} /> Admin Login
              </button>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-xs">
          <p>© {new Date().getFullYear()} Mr You Barber & Hammam. {t.footer.rights}</p>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-primary border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl"
            >
              <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-white">Admin Login</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Name</label>
                  <input 
                    type="text" 
                    value={loginData.name}
                    onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <button type="submit" className="btn-secondary w-full py-4 font-bold">
                  Login
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Save Button */}
      {isAdmin && stagedImages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-6">
          <motion.button 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={saveAllStagedImages}
            disabled={isUploading}
            className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold shadow-[0_20px_50px_rgba(22,163,74,0.4)] flex items-center justify-center gap-3 hover:bg-green-500 transition-all disabled:opacity-50 border-2 border-white/20"
          >
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={24} />
            )}
            <span className="text-lg uppercase tracking-wider">
              {isUploading ? 'Saving to Website...' : `SAVE ${stagedImages.length} PICTURES`}
            </span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {showUrlInput && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUrlInput(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-primary border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl"
            >
              <button onClick={() => setShowUrlInput(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-white">Add Image by URL</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <button 
                  onClick={handleAddByUrl}
                  disabled={isUploading}
                  className="btn-secondary w-full py-4 font-bold disabled:opacity-50"
                >
                  {isUploading ? 'Adding...' : 'Add Image'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Call Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:hidden z-50 pointer-events-none">
        <motion.a 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          href={`tel:${BUSINESS_INFO.phoneRaw}`}
          className="btn-secondary w-full shadow-2xl pointer-events-auto py-4 text-lg font-bold"
        >
          <Phone size={24} /> {t.hero.callNow}
        </motion.a>
      </div>

      {/* Spacer for sticky button on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
