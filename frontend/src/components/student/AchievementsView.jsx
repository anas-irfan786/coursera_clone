import React from 'react';
import { Trophy, Star, Target, Zap } from 'lucide-react';

const AchievementsView = () => {
  const achievements = [
    {
      id: 1,
      title: "Week Warrior",
      description: "Complete 5 hours of learning in a week",
      icon: <Trophy className="text-yellow-500" size={32} />,
      earned: true,
      progress: 100,
      earnedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Course Completer",
      description: "Complete your first course",
      icon: <Star className="text-blue-500" size={32} />,
      earned: true,
      progress: 100,
      earnedDate: "2024-01-12"
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Maintain a 30-day learning streak",
      icon: <Zap className="text-orange-500" size={32} />,
      earned: false,
      progress: 40
    },
    {
      id: 4,
      title: "Goal Crusher",
      description: "Achieve your monthly learning goal",
      icon: <Target className="text-green-500" size={32} />,
      earned: false,
      progress: 75
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Achievements</h1>
        <p className="text-indigo-100">Track your learning milestones and unlock badges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 ${
              achievement.earned 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                {achievement.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                {achievement.earned && (
                  <p className="text-sm text-green-600">
                    Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
            
            {!achievement.earned && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{achievement.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;