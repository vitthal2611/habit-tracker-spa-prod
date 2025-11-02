import { useState } from "react";
import { CheckCircle, Clock, BookOpen, AlertTriangle, Plus, Link, Timer, Sparkles, Smile, Zap, PlusCircle } from "lucide-react";

export default function MultiHabitTracker() {
  const [habits, setHabits] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [newOption, setNewOption] = useState("");
  const [newHabit, setNewHabit] = useState({
    identity: "",
    currentHabit: "",
    newHabit: "",
    location: "",
    time: "",
    completionTime: "",
    environmentTips: "",
    makeAttractive: "",
    makeEasy: "",
    makeSatisfying: "",
  });

  const [identityOptions, setIdentityOptions] = useState([]);
  const [habitOptions, setHabitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleAddOption = () => {
    const value = newOption.trim();
    if (!value) return;

    if (dialogType === "identity" && !identityOptions.includes(value)) {
      setIdentityOptions((prev) => [...prev, value]);
      setNewHabit((h) => ({ ...h, identity: value }));
    }

    if (dialogType === "habit" && !habitOptions.includes(value)) {
      setHabitOptions((prev) => [...prev, value]);
      setNewHabit((h) => ({ ...h, currentHabit: value }));
    }

    if (dialogType === "location" && !locationOptions.includes(value)) {
      setLocationOptions((prev) => [...prev, value]);
      setNewHabit((h) => ({ ...h, location: value }));
    }

    setNewOption("");
    setShowDialog(false);
  };

  const renderDynamicSelect = (label, options, value, setValue, type) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <select
        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value || ""}
        onChange={(e) => {
          if (e.target.value === "add_new") {
            setDialogType(type);
            setShowDialog(true);
          } else {
            setValue(e.target.value);
          }
        }}
      >
        <option value="">Select or add {label.toLowerCase()}</option>
        {options.map((opt, index) => (
          <option key={`${label}-${index}`} value={opt}>
            {opt}
          </option>
        ))}
        <option value="add_new">+ Add new {label}</option>
      </select>
    </div>
  );

  const handleAddHabit = () => {
    if (!newHabit.newHabit || newHabit.newHabit.trim() === "") {
      alert("Please enter the 'I will...' new habit statement.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...newHabit,
      progress: Object.fromEntries(days.map((d) => [d, false])),
    };

    setHabits((prev) => [...prev, newEntry]);

    if (newEntry.identity && !identityOptions.includes(newEntry.identity)) 
      setIdentityOptions([...identityOptions, newEntry.identity]);
    if (newEntry.currentHabit && !habitOptions.includes(newEntry.currentHabit)) 
      setHabitOptions([...habitOptions, newEntry.currentHabit]);
    if (newEntry.location && !locationOptions.includes(newEntry.location)) 
      setLocationOptions([...locationOptions, newEntry.location]);

    setNewHabit({
      identity: "",
      currentHabit: "",
      newHabit: "",
      location: "",
      time: "",
      completionTime: "",
      environmentTips: "",
      makeAttractive: "",
      makeEasy: "",
      makeSatisfying: "",
    });

    setFormVisible(false);
  };

  const toggleDay = (habitId, day) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, progress: { ...habit.progress, [day]: !habit.progress[day] } } : habit
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-4 text-slate-800 tracking-tight">🌱 Build Better Habits</h1>
      <p className="text-slate-600 mb-8 text-center max-w-2xl">Design habits around who you want to become. Make it simple, attractive, and easy to repeat.</p>

      {!formVisible ? (
        <button 
          onClick={() => setFormVisible(true)} 
          className="mb-6 flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 text-lg text-white rounded-xl font-semibold transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Habit
        </button>
      ) : (
        <div className="w-full max-w-4xl p-6 mb-6 shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">✨ Create a New Habit</h2>

            <div className="grid grid-cols-2 gap-4">
              {renderDynamicSelect("Identity", identityOptions, newHabit.identity, (val) => setNewHabit({ ...newHabit, identity: val }), "identity")}
              {renderDynamicSelect("Current Habit", habitOptions, newHabit.currentHabit, (val) => setNewHabit({ ...newHabit, currentHabit: val }), "habit")}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">I will... (New Habit)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., read for 10 minutes"
                  value={newHabit.newHabit}
                  onChange={(e) => setNewHabit({ ...newHabit, newHabit: e.target.value })}
                />
              </div>

              {renderDynamicSelect("Location", locationOptions, newHabit.location, (val) => setNewHabit({ ...newHabit, location: val }), "location")}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 7:00 AM"
                  value={newHabit.time}
                  onChange={(e) => setNewHabit({ ...newHabit, time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Completion Time</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10 minutes"
                  value={newHabit.completionTime}
                  onChange={(e) => setNewHabit({ ...newHabit, completionTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Environment Tips</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How to set up your environment"
                  value={newHabit.environmentTips}
                  onChange={(e) => setNewHabit({ ...newHabit, environmentTips: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Make it Attractive</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How to make this habit appealing"
                  value={newHabit.makeAttractive}
                  onChange={(e) => setNewHabit({ ...newHabit, makeAttractive: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Make it Easy</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How to make this habit simple"
                  value={newHabit.makeEasy}
                  onChange={(e) => setNewHabit({ ...newHabit, makeEasy: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Make it Satisfying</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How to make this habit rewarding"
                  value={newHabit.makeSatisfying}
                  onChange={(e) => setNewHabit({ ...newHabit, makeSatisfying: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddHabit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              >
                Add Habit
              </button>
              <button
                onClick={() => setFormVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for adding new options */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New {dialogType}</h3>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder={`Enter new ${dialogType}`}
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddOption}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowDialog(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="w-full max-w-4xl space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{habit.newHabit}</h3>
                {habit.identity && <p className="text-sm text-blue-600">Identity: {habit.identity}</p>}
                {habit.time && <p className="text-sm text-slate-600">⏰ {habit.time}</p>}
                {habit.location && <p className="text-sm text-slate-600">📍 {habit.location}</p>}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(habit.id, day)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    habit.progress[day]
                      ? "bg-green-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {(habit.makeAttractive || habit.makeEasy || habit.makeSatisfying) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {habit.makeAttractive && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-pink-700">Attractive</span>
                    </div>
                    <p className="text-pink-600">{habit.makeAttractive}</p>
                  </div>
                )}
                {habit.makeEasy && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-700">Easy</span>
                    </div>
                    <p className="text-blue-600">{habit.makeEasy}</p>
                  </div>
                )}
                {habit.makeSatisfying && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Smile className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700">Satisfying</span>
                    </div>
                    <p className="text-green-600">{habit.makeSatisfying}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}