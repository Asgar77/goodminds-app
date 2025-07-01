import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Users, Zap, Target, Eye } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { useUserData } from './GoogleAuth';

const AssessmentModule = () => {
  const user = auth.currentUser;
  const userData = useUserData(user?.uid);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [userAssessments, setUserAssessments] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const assessments = [
    {
      id: 'academic-stress',
      title: 'Academic Stress Assessment',
      description: 'Evaluate stress levels related to studies, exams, and academic pressure',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'social-anxiety',
      title: 'Social Anxiety Scale',
      description: 'Assess comfort levels in social situations and peer interactions',
      icon: Users,
      color: 'from-green-500 to-teal-600',
    },
    {
      id: 'mood-wellness',
      title: 'Mood & Wellness Check',
      description: 'Understand your emotional well-being and daily mood patterns',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'focus-attention',
      title: 'Focus & Attention Assessment',
      description: 'Evaluate concentration abilities and attention challenges in studies',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'perfectionism',
      title: 'Perfectionism Scale',
      description: 'Assess perfectionist tendencies and their impact on mental health',
      icon: Target,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'sleep-wellness',
      title: 'Sleep & Wellness Check',
      description: 'Evaluate sleep patterns and their effect on academic performance',
      icon: Eye,
      color: 'from-indigo-500 to-blue-600',
    }
  ];

  // Fetch user assessment results from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = onSnapshot(collection(db, `users/${user.uid}/assessments`), (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setUserAssessments(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (selectedAssessment) {
    return <AssessmentDetail 
      assessment={assessments.find(a => a.id === selectedAssessment)!} 
      onBack={() => setSelectedAssessment(null)} 
      user={user} 
    />;
  }

  const completedCount = Object.keys(userAssessments).length;
  const progressPercent = (completedCount / assessments.length) * 100;

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Mental Health Assessments</h1>
        <p className="text-gray-600">
          Take personalized psychological evaluations designed specifically for students. 
          All assessments are confidential and provide actionable insights for your academic and personal well-being.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
            <span className="text-sm text-gray-600">{completedCount} of {assessments.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const completed = !!userAssessments[assessment.id];
          return (
            <Card 
              key={assessment.id} 
              className={`
                card-modern cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group
                ${completed ? 'ring-2 ring-green-200' : ''}
              `}
              onClick={() => setSelectedAssessment(assessment.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${assessment.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <assessment.icon className="w-6 h-6 text-white" />
                  </div>
                  {completed && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg text-gray-800 mt-3">{assessment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{assessment.description}</p>
                <div className="flex items-center justify-end">
                  <Button 
                    size="sm" 
                    className={`${completed ? 'bg-green-500 hover:bg-green-600' : 'btn-goodmind'} rounded-xl`}
                  >
                    {completed ? 'View Results' : 'Start Assessment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Card */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Recent Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(userAssessments).length === 0 && (
              <div className="bg-gradient-to-r from-gray-100 to-blue-100 p-6 rounded-2xl text-center">
                <h4 className="font-semibold text-gray-800 mb-2">No assessments completed yet</h4>
                <p className="text-gray-700 text-sm">
                  Complete an assessment to see personalized insights about your mental wellness and academic stress levels.
                </p>
              </div>
            )}
            {Object.entries(userAssessments).map(([id, result]) => (
              <div key={id} className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-2xl">
                <h4 className="font-semibold text-gray-800 mb-2">{assessments.find(a => a.id === id)?.title || id} Results</h4>
                <p className="text-gray-700 text-sm">
                  {result && result.summary ? result.summary : 'Assessment completed. View details for personalized recommendations.'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Assessment Detail Component with Student-Focused Questions
const AssessmentDetail = ({ assessment, onBack, user }: { assessment: any, onBack: () => void, user: any }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student-focused questions for academic stress
  const studentQuestions = [
    "How often do you feel overwhelmed by your academic workload?",
    "How frequently do you worry about your grades or academic performance?",
    "How often do you have trouble sleeping due to academic stress?",
    "How frequently do you feel anxious before exams or important assignments?",
    "How often do you compare your academic performance to your peers?",
    "How frequently do you feel pressure from family or teachers about your studies?",
    "How often do you feel like you're not smart enough for your courses?",
    "How frequently do you procrastinate on important academic tasks?",
    "How often do you feel isolated or alone when dealing with academic challenges?",
    "How frequently do you feel confident about your ability to handle academic stress?"
  ];

  const options = [
    { value: 0, label: "Never" },
    { value: 1, label: "Rarely" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Often" },
    { value: 4, label: "Always" }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    if (currentQuestion < studentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    // Calculate score and provide student-specific feedback
    const total = answers.reduce((a, b) => a + b, 0);
    const maxScore = studentQuestions.length * 4;
    const percentage = (total / maxScore) * 100;
    
    let summary = '';
    let recommendations = [];
    
    if (percentage < 25) {
      summary = 'Your stress levels appear to be well-managed. Keep up the good work with your coping strategies!';
      recommendations = [
        'Continue your current stress management techniques',
        'Share your strategies with peers who might benefit',
        'Maintain a healthy study-life balance'
      ];
    } else if (percentage < 50) {
      summary = 'You\'re experiencing mild academic stress. Some targeted strategies could help improve your well-being.';
      recommendations = [
        'Try time management techniques like the Pomodoro method',
        'Practice deep breathing exercises before exams',
        'Consider joining a study group for peer support',
        'Establish a regular sleep schedule'
      ];
    } else if (percentage < 75) {
      summary = 'You\'re experiencing moderate academic stress. It would be beneficial to implement stress reduction strategies.';
      recommendations = [
        'Break large assignments into smaller, manageable tasks',
        'Practice mindfulness or meditation regularly',
        'Talk to a counselor or trusted adult about your stress',
        'Consider reducing extracurricular commitments temporarily',
        'Focus on progress rather than perfection'
      ];
    } else {
      summary = 'You\'re experiencing high levels of academic stress. Please consider seeking support from a counselor or mental health professional.';
      recommendations = [
        'Speak with a school counselor or therapist',
        'Consider talking to your teachers about your workload',
        'Practice self-compassion and avoid harsh self-criticism',
        'Prioritize self-care activities daily',
        'Remember that your worth isn\'t defined by your grades'
      ];
    }

    await setDoc(doc(db, `users/${user.uid}/assessments/${assessment.id}`), {
      answers,
      completedAt: new Date().toISOString(),
      summary,
      recommendations,
      score: percentage,
      type: 'student-focused'
    });
    
    setCompleted(true);
    setSaving(false);
  };

  const progress = ((currentQuestion + 1) / studentQuestions.length) * 100;

  if (completed) {
    return (
      <div className="space-y-8 animate-slide-up-smooth">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="rounded-2xl">← Back</Button>
          <div>
            <h2 className="text-2xl font-bold text-green-700">Assessment Completed!</h2>
            <p className="text-gray-700 mt-2">Your results have been saved. You can view your personalized insights and recommendations in your dashboard.</p>
          </div>
        </div>
        <Card className="card-modern">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank you for completing the assessment!</h3>
            <p className="text-gray-600">Your mental wellness journey is important, and taking this step shows great self-awareness.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="rounded-2xl">← Back</Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{assessment.title}</h2>
          <p className="text-gray-600">{assessment.description}</p>
        </div>
      </div>
      
      <Card className="card-modern">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 font-semibold">Question {currentQuestion + 1} of {studentQuestions.length}</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl text-gray-800 mb-6 leading-relaxed">{studentQuestions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map(opt => (
                <Button 
                  key={opt.value} 
                  variant="outline"
                  className="w-full justify-start text-left p-4 h-auto hover:bg-green-50 hover:border-green-300 rounded-2xl transition-all duration-200" 
                  onClick={() => handleAnswer(opt.value)}
                >
                  <span className="font-medium">{opt.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {answers.length === studentQuestions.length && (
            <div className="text-center">
              <Button 
                className="btn-goodmind px-12 py-4" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? 'Saving Results...' : 'Complete Assessment'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentModule;