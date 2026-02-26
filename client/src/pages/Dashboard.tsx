import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { useUser, useTeams } from "@/hooks/use-local-store";
import { User, Users, Plus, ShieldAlert, Award } from "lucide-react";
import type { Team, TeamMember } from "@shared/schema";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { teams, saveTeam, updateTeam, isLoading: teamsLoading } = useTeams();

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || teamsLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center font-display text-4xl">LOADING HQ...</div>;
  }

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      members: [{ name: user.name, role: "Captain" }] // Creator is captain
    };

    saveTeam(newTeam);
    setNewTeamName("");
    setIsCreatingTeam(false);
  };

  const handleAddMember = (e: React.FormEvent, team: Team) => {
    e.preventDefault();
    if (!newMemberName) return;

    const member: TeamMember = { name: newMemberName, role: "Member" };
    updateTeam({ ...team, members: [...team.members, member] });
    setNewMemberName("");
    setSelectedTeamId(null);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-6xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <ComicCard bgVariant="primary" tiltAmount={0} className="text-center relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white comic-border rounded-full flex items-center justify-center comic-shadow">
                <User size={40} strokeWidth={3} />
              </div>
              <div className="mt-8">
                <h2 className="font-display text-4xl uppercase">{user.name}</h2>
                <p className="font-bold text-lg bg-white/50 inline-block px-3 py-1 rounded-lg border-2 border-black mt-2">
                  {user.college}
                </p>
                <div className="mt-6 bg-black text-white p-3 rounded-xl">
                  <p className="text-sm font-bold text-gray-400 uppercase">Clearance Code</p>
                  <p className="font-display text-2xl tracking-widest text-[hsl(var(--accent))]">
                    {user.entryId || "NO PASS YET"}
                  </p>
                </div>
                {!user.entryId && (
                  <ComicButton variant="accent" size="sm" className="mt-4 w-full" onClick={() => setLocation('/fest-pass')}>
                    Get Pass Now
                  </ComicButton>
                )}
              </div>
            </ComicCard>
          </motion.div>
        </div>

        {/* Main Content - Teams */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center bg-white comic-border comic-shadow-sm p-4 rounded-xl">
            <h2 className="font-display text-4xl text-[hsl(var(--tertiary))] text-comic-stroke m-0 flex items-center gap-3">
              <Users size={32} className="text-black" /> SQUAD ROSTER
            </h2>
            <ComicButton variant="secondary" size="sm" onClick={() => setIsCreatingTeam(!isCreatingTeam)}>
              {isCreatingTeam ? "CANCEL" : <><Plus size={20} className="inline mr-1" /> NEW SQUAD</>}
            </ComicButton>
          </motion.div>

          <AnimatePresence>
            {isCreatingTeam && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ComicCard bgVariant="accent" className="mb-6">
                  <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full">
                      <label className="font-display text-xl uppercase block mb-2">Squad Name</label>
                      <input 
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full p-3 border-4 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-white bg-white"
                        placeholder="e.g. The Avengers"
                      />
                    </div>
                    <ComicButton type="submit" variant="white" className="w-full sm:w-auto whitespace-nowrap">
                      ASSEMBLE!
                    </ComicButton>
                  </form>
                </ComicCard>
              </motion.div>
            )}
          </AnimatePresence>

          {teams.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-gray-100 comic-border rounded-xl border-dashed border-4">
              <ShieldAlert size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="font-display text-3xl text-gray-500">LONE WOLF DETECTED</h3>
              <p className="font-bold text-gray-500 mt-2">You haven't joined or created any squads yet.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {teams.map((team, index) => (
                <motion.div 
                  key={team.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ComicCard bgVariant="white" tiltAmount={0} className="overflow-hidden p-0">
                    <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                      <h3 className="font-display text-3xl text-[hsl(var(--primary))] tracking-wider">{team.name}</h3>
                      <span className="font-bold bg-white text-black px-3 py-1 rounded-full text-sm">
                        {team.members.length} Members
                      </span>
                    </div>
                    
                    <div className="p-4">
                      <ul className="space-y-2 mb-6">
                        {team.members.map((member, i) => (
                          <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg comic-border">
                            <span className="font-bold text-lg">{member.name}</span>
                            {member.role === 'Captain' && <Award className="text-[hsl(var(--secondary))]" size={24} />}
                          </li>
                        ))}
                      </ul>

                      {selectedTeamId === team.id ? (
                        <form onSubmit={(e) => handleAddMember(e, team)} className="flex gap-2">
                          <input 
                            required
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="flex-grow p-2 border-2 border-black rounded-lg font-bold"
                            placeholder="Ally's Name"
                            autoFocus
                          />
                          <ComicButton type="submit" variant="accent" size="sm">Add</ComicButton>
                          <button type="button" onClick={() => setSelectedTeamId(null)} className="font-bold underline px-2 hover:text-red-500">Cancel</button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setSelectedTeamId(team.id)}
                          className="font-bold text-[hsl(var(--tertiary))] underline hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Plus size={16}/> Recruit Ally
                        </button>
                      )}
                    </div>
                  </ComicCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
