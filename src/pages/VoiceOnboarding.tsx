import { motion } from 'framer-motion';
import { Mic, Volume2, CheckCircle, ArrowRight, Headphones } from 'lucide-react';

const steps = [
  { icon: Mic,          title: 'Speak your skill',   desc: 'Tell us what you want to learn in your own language — Hindi, Tamil, Kannada or English.' },
  { icon: Volume2,      title: 'We understand you',  desc: 'Our voice AI maps your words to relevant local teachers and skills near you.' },
  { icon: CheckCircle,  title: 'Start learning',     desc: 'Pick your teacher, book a session and get started. No forms, no fuss.' },
];

export default function VoiceOnboarding() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Headphones size={13} /> Voice First
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Onboard with your <span className="gradient-text">voice</span>
          </h1>
          <p className="text-gray-500 text-lg">No typing. No forms. Just speak — and we'll find the perfect teacher for you.</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center mb-16">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 24px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-28 h-28 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          <Mic size={44} strokeWidth={1.5} />
        </motion.button>
      </motion.div>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div key={step.title}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 card-shadow text-center"
            style={{ border: '1px solid #F3F4F6' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F0FDF4' }}>
              <step.icon size={22} color="#22C55E" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          Try Voice Search <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
