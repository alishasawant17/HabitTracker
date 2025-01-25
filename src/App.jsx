import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash, FiCheck, FiX, FiTag } from 'react-icons/fi';

function App() {
  const [habits, setHabits] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tags: '',
    editingId: null
  });
  const [filters, setFilters] = useState({ category: '', tag: '' });
  const [currentMotivation, setCurrentMotivation] = useState(0);
  const [typedText, setTypedText] = useState('');

  const API_URL = 'http://localhost:5001/api/habits';
  const motivations = [
    "Consistency builds character",
    "Small steps, big changes",
    "Progress over perfection",
    "Every habit matters",
    "You're shaping your future",
    "Routine creates freedom"
  ];

  // Fetch habits
  const fetchHabits = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setHabits(data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  // Typing effect for motivations
  useEffect(() => {
    let currentIndex = 0;
    let timeout;
    
    const typeMessage = () => {
      if (currentIndex < motivations[currentMotivation].length) {
        setTypedText(motivations[currentMotivation].slice(0, currentIndex + 1));
        currentIndex++;
        timeout = setTimeout(typeMessage, 50);
      } else {
        timeout = setTimeout(() => {
          setCurrentMotivation((prev) => (prev + 1) % motivations.length);
          setTypedText('');
        }, 2000);
      }
    };

    typeMessage();
    return () => clearTimeout(timeout);
  }, [currentMotivation]);

  // Form handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    try {
      const habitData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (formData.editingId) {
        await axios.put(`${API_URL}/${formData.editingId}`, habitData);
      } else {
        await axios.post(API_URL, habitData);
      }
      
      await fetchHabits();
      setFormData({ name: '', category: '', tags: '', editingId: null });
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit permanently?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchHabits();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Filtered habits
  const filteredHabits = useMemo(() => 
    habits.filter(h => 
      (!filters.category || h.category === filters.category) &&
      (!filters.tag || h.tags?.includes(filters.tag))
    ), [habits, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent mb-2">
            HabiTracker
          </h1>
          <div className="text-sm text-teal-300/80 font-mono h-6">
            {typedText}<span className="ml-1 animate-blink">|</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 backdrop-blur-lg">
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="space-y-3">
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Habit name"
                  className="w-full px-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder-slate-400"
                />
                <input
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category"
                  className="w-full px-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder-slate-400"
                />
                <div className="relative">
                  <FiTag className="absolute top-4 left-3 text-slate-400" />
                  <input
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Tags (comma separated)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder-slate-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-600/90 hover:bg-teal-500/90 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                {formData.editingId ? <FiEdit /> : <FiPlus />}
                {formData.editingId ? 'Update Habit' : 'Add Habit'}
              </button>
            </form>

            {/* Filters */}
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none appearance-none"
                >
                  <option value="">All Categories</option>
                  {[...new Set(habits.map(h => h.category))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <FiTag className="absolute top-3 left-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Habits Grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredHabits.map(habit => (
                <div 
                  key={habit._id}
                  className="relative p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-teal-400/20 transition-all"
                >
                  <div className={`absolute top-4 right-4 p-2 rounded-lg ${
                    habit.isCompleted 
                      ? 'bg-teal-500/20 text-teal-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {habit.isCompleted ? <FiCheck /> : <FiX />}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-teal-50">{habit.name}</h3>
                    
                    <div className="flex items-center gap-2 text-indigo-300 text-sm">
                      <FiTag className="flex-shrink-0" />
                      <span>{habit.category}</span>
                    </div>

                    {habit.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {habit.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setFormData({
                          name: habit.name,
                          category: habit.category,
                          tags: habit.tags?.join(', ') || '',
                          editingId: habit._id
                        })}
                        className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center gap-1"
                      >
                        <FiEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="px-3 py-1.5 text-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg flex items-center gap-1"
                      >
                        <FiTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}

export default App;