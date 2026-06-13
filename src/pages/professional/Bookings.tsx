import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';

export default function ProBookings() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Manage Bookings</h1>
          <p className="text-gray-500">Incoming session requests from learners.</p>
        </motion.div>
        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <CalendarCheck size={36} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No bookings yet
          </h2>
          <p className="text-sm text-gray-500">Add your skills so learners can find and book you.</p>
        </div>
      </div>
    </div>
  );
}
