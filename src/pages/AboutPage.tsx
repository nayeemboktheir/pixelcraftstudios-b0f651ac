import { motion } from 'framer-motion';
import { BookOpen, Brain, Sparkles, Target, Shield, Users, Zap, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import pcsLogo from '@/assets/pcs-logo.png';

const AboutPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI প্রম্পট এক্সপার্ট',
      description: 'ChatGPT, Midjourney, এবং অন্যান্য AI টুল সঠিকভাবে ব্যবহার করতে শেখায়।'
    },
    {
      icon: Sparkles,
      title: 'প্র্যাক্টিক্যাল গাইড',
      description: 'থিওরি নয়, সরাসরি কাজে লাগানো যায় এমন প্রম্পট ও টেকনিক।'
    },
    {
      icon: Target,
      title: 'ফ্রিল্যান্সিং ফোকাস',
      description: 'AI দিয়ে কীভাবে আয় করা যায় সেটা হাতে-কলমে শেখানো হয়।'
    },
    {
      icon: Shield,
      title: 'বাংলায় সম্পূর্ণ',
      description: 'বাংলা ভাষায় সহজবোধ্য ব্যাখ্যা ও উদাহরণ সহ।'
    }
  ];

  const goals = [
    {
      icon: Users,
      title: 'সবার জন্য AI শেখা সহজ করা',
      description: 'টেকনিক্যাল ব্যাকগ্রাউন্ড ছাড়াই যেকেউ AI ব্যবহার শিখতে পারবে।'
    },
    {
      icon: Zap,
      title: 'প্রোডাক্টিভিটি বাড়ানো',
      description: 'AI টুলস দিয়ে কাজের গতি ও মান দুটোই বাড়ানো।'
    },
    {
      icon: BookOpen,
      title: 'ডিজিটাল আয়ের পথ দেখানো',
      description: 'AI স্কিল দিয়ে ফ্রিল্যান্সিং ও অনলাইন আয়ের সুযোগ তৈরি করা।'
    }
  ];

  return (
    <>
      <Header />
      <div className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20"
              >
                ✨ আমাদের সম্পর্কে
              </motion.span>
              
              <div className="flex justify-center mb-6">
                <img src={pcsLogo} alt="Pixelcraft Studio" className="h-16 w-auto rounded-xl" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-8 leading-tight">
                Pixelcraft Studio
                <span className="block text-primary mt-2">AI শেখার নতুন অভিজ্ঞতা</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                আমরা বিশ্বাস করি, AI সবার জন্য। তাই বাংলায় সহজ ভাষায় AI শেখার কন্টেন্ট তৈরি করি।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Story Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                  আমাদের গল্প
                </h2>
                
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    <span className="text-primary font-semibold">Pixelcraft Studio</span> হলো একটি ডিজিটাল এডুকেশন প্ল্যাটফর্ম যেখানে আমরা <span className="text-foreground font-medium">AI, প্রম্পট ইঞ্জিনিয়ারিং, এবং ডিজিটাল স্কিল</span> নিয়ে বাংলায় কন্টেন্ট তৈরি করি।
                  </p>
                  
                  <p>
                    আমাদের প্রথম প্রোডাক্ট <span className="text-primary font-semibold">"AI Prompt Mastery"</span> ইবুক—যেখানে ChatGPT, ইমেজ জেনারেশন, ভিডিও তৈরি, এবং AI দিয়ে ফ্রিল্যান্সিং এর সম্পূর্ণ গাইড দেওয়া হয়েছে।
                  </p>
                </div>
              </motion.div>

              {/* Highlight Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12 border border-primary/10 mb-16"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                    AI Prompt Mastery ইবুক
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                    ৫০০+ পেজের বাংলা ইবুক যেখানে AI এর A টু Z শেখানো হয়েছে
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-5 py-3 bg-primary text-primary-foreground rounded-full font-medium">
                      ১৮টি অধ্যায়
                    </span>
                    <span className="px-5 py-3 bg-accent text-accent-foreground rounded-full font-medium">
                      ৫০০+ প্রম্পট
                    </span>
                    <span className="px-5 py-3 bg-secondary text-secondary-foreground rounded-full font-medium">
                      লাইফটাইম আপডেট
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                🌟 কেন আমরা বিশেষ?
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                আমাদের বৈশিষ্ট্য
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border group hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium mb-4">
                🎯 আমাদের লক্ষ্য
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                আমরা যা করতে চাই
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {goals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <goal.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {goal.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {goal.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                AI শেখার যাত্রা শুরু করুন আজই
              </h2>
              <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
                "AI Prompt Mastery" ইবুক দিয়ে শুরু করুন আপনার AI শেখার যাত্রা। যেকোনো প্রশ্নে আমাদের সাথে যোগাযোগ করুন।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">যেকোনো প্রশ্নে Facebook এ মেসেজ করুন</span>
                </div>
              </div>
              
              <div className="inline-block px-8 py-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                <p className="text-xl font-display">
                  🚀 Pixelcraft Studio — <span className="font-bold">AI শেখা এখন সহজ</span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
