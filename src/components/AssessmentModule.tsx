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
      id: 'depression',
      title: 'Depression Screening',
      description: 'Assess your current mood and emotional well-being',
      icon: Heart,
      color: 'from-blue-500 to-indigo-600',
      duration: '5-7 min',
    },
    {
      id: 'anxiety',
      title: 'Anxiety Assessment',
      description: 'Evaluate anxiety levels and triggers in your daily life',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      duration: '6-8 min',
    },
    {
      id: 'peer-pressure',
      title: 'Peer Pressure Scale',
      description: 'Understand how social influences affect your decisions',
      icon: Users,
      color: 'from-green-500 to-teal-600',
      duration: '4-6 min',
    },
    {
      id: 'adhd',
      title: 'ADHD Screening',
      description: 'Screen for attention and focus challenges',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      duration: '7-10 min',
    },
    {
      id: 'ocd',
      title: 'OCD Assessment',
      description: 'Evaluate obsessive-compulsive patterns and behaviors',
      icon: Target,
      color: 'from-red-500 to-pink-600',
      duration: '8-12 min',
    },
    {
      id: 'stress',
      title: 'Stress Level Check',
      description: 'Measure current stress levels and coping mechanisms',
      icon: Eye,
      color: 'from-indigo-500 to-purple-600',
      duration: '5-8 min',
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
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mental Health Assessments</h1>
        <p className="text-gray-600">
          Take personalized psychological evaluations to better understand your mental wellness. 
          All assessments are confidential and designed to provide actionable insights.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="glass border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
            <span className="text-sm text-gray-600">{completedCount} of {assessments.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
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
                glass border-0 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105
                ${completed ? 'ring-2 ring-green-200' : ''}
              `}
              onClick={() => setSelectedAssessment(assessment.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${assessment.color} rounded-xl flex items-center justify-center`}>
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {assessment.duration}
                  </span>
                  <Button 
                    size="sm" 
                    className={`${completed ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'}`}
                  >
                    {completed ? 'View Results' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Card */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Recent Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(userAssessments).length === 0 && (
              <div className="bg-gradient-to-r from-gray-100 to-blue-100 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">No assessments completed yet</h4>
                <p className="text-gray-700 text-sm">
                  Complete an assessment to see personalized insights here.
                </p>
              </div>
            )}
            {Object.entries(userAssessments).map(([id, result]) => (
              <div key={id} className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">{assessments.find(a => a.id === id)?.title || id} Results</h4>
                <p className="text-gray-700 text-sm">
                  {result && result.summary ? result.summary : 'Assessment completed. View details for more.'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Assessment Detail Component
const AssessmentDetail = ({ assessment, onBack, user }: { assessment: any, onBack: () => void, user: any }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const sampleQuestions = [
    "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
    "How often do you have trouble falling or staying asleep, or sleeping too much?",
    "How often do you feel tired or have little energy?",
    "How often do you have trouble concentrating on things?",
    "How often do you feel bad about yourself or that you're a failure?"
  ];

  const options = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    // Simple summary logic (can be improved)
    const total = answers.reduce((a, b) => a + b, 0);
    let summary = '';
    if (total < 5) summary = 'Your results are within a healthy range.';
    else if (total < 10) summary = 'Mild symptoms detected. Consider monitoring your mood.';
    else summary = 'Moderate to severe symptoms detected. Consider seeking professional help.';
    await setDoc(doc(db, `users/${user.uid}/assessments/${assessment.id}`), {
      answers,
      completedAt: new Date().toISOString(),
      summary
    });
    setCompleted(true);
    setSaving(false);
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  if (completed) {
    return (
      <div className="space-y-8 animate-slide-up">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <div>
            <h2 className="text-2xl font-bold text-green-700">Assessment Completed!</h2>
            <p className="text-gray-700 mt-2">Your results have been saved. You can view your insights on the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{assessment.title}</h2>
          <p className="text-gray-600">{assessment.description}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4">
          <div className="text-gray-700 font-semibold mb-2">Question {currentQuestion + 1} of {sampleQuestions.length}</div>
          <div className="text-lg text-gray-800 mb-4">{sampleQuestions[currentQuestion]}</div>
          <div className="space-y-2">
            {options.map(opt => (
              <Button key={opt.value} className="w-full" onClick={() => handleAnswer(opt.value)}>{opt.label}</Button>
            ))}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        {answers.length === sampleQuestions.length && (
          <Button className="mt-6 w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Finish & Save'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssessmentModule;
