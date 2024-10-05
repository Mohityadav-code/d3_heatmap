// src/App.js
import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import HeatmapTable from "./HeatMap";

const App = () => {
  const [people, setPeople] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('heatmap');

  useEffect(() => {
    const fetchPeopleAndDetails = async () => {
      try {
        const response = await fetch("https://forinterview.onrender.com/people");
        if (!response.ok) {
          throw new Error(`Error fetching people: ${response.statusText}`);
        }
        const data = await response.json();
        setLoadingPeople(false);

        // Fetch details for each person
        const peopleWithDetails = await Promise.all(
          data.map(async (person) => {
            const detailResponse = await fetch(`https://forinterview.onrender.com/people/${person.id}`);
            if (!detailResponse.ok) {
              throw new Error(`Error fetching details for ${person.name}: ${detailResponse.statusText}`);
            }
            const detailData = await detailResponse.json();
            return {
              ...person,
              ...detailData,
              totalScore: calculateTotalScore(detailData) // Changed from consensusScore to totalScore
            };
          })
        );

        console.log("peopleWithDetails", peopleWithDetails);
        
        // Create a copy before sorting to avoid mutating the original array
        const sortedPeople = [...peopleWithDetails].sort((a, b) => b.totalScore - a.totalScore);
        console.log("sortedPeople", sortedPeople);
        
        setPeople(sortedPeople);
        setLoadingDetails(false);
      } catch (err) {
        setError(err.message);
        setLoadingPeople(false);
        setLoadingDetails(false);
      }
    };

    fetchPeopleAndDetails();
  }, []);

  // Updated function to calculate total score
  const calculateTotalScore = (detailData) => {
    let totalScore = 0;
    detailData.data?.data?.skillset?.forEach(skillset => {
      skillset.skills?.forEach(skill => {
        skill.pos?.forEach(po => {
          if (po.consensus_score) {
            totalScore += po.consensus_score;
          }
        });
      });
    });
    return totalScore;
  };

  const toggleStudent = (student) => {
    setSelectedStudents(prev => 
      prev.find(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Back to my jobs button */}
      <div className="flex items-center mb-8">
        <ArrowLeft className="text-[#919191] h-6 w-6" />
        <button className="text-[#919191] text-lg ml-2 hover:underline">Back to my jobs</button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl text-[#919191] font-bold mb-4 md:mb-0">Posk_UXdesigner_sr001</h1>
        <h2 className="text-2xl text-[#575757] font-semibold">{selectedStudents.length} Candidate{selectedStudents.length !== 1 ? 's' : ''}</h2>
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Most Recommended Section */}
        <section className="lg:w-1/3 w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <h2 className="text-2xl font-normal border-b border-gray-200 text-center py-4 bg-gray-50">Most Recommended</h2>
          {loadingPeople || loadingDetails ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#38A164]" />
              <p className="text-gray-600">Loading candidates...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {people.map((person, index) => {
                const isSelected = selectedStudents.some(s => s.id === person.id);
                const isTopFive = index < 5;

                return (
                  <React.Fragment key={person.id}>
                    {/* Insert separator after top 5 users */}
                    {index === 5 && (
                      <li className="p-4 bg-blue-50 text-center text-sm text-gray-700">
                        Recommendations are based on your skill requirements and candidates' performance.
                      </li>
                    )}
                    
                    <li
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-300 ${
                        isSelected
                          ? "bg-[#F6F6EF] border-l-4 border-[#38A164]"
                          : isTopFive
                          ? "bg-white hover:bg-gray-50"
                          : "hover:bg-gray-50 border-0"
                      }`}
                      onClick={() => toggleStudent(person)}
                    >
                      <span className={`${isSelected ? "font-semibold text-[#38A164]" : "text-gray-700"}`}>
                        {person.name}
                      </span>
                      {isSelected ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : (
                        <Plus className="w-5 h-5 text-blue-500" />
                      )}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </section>

        {/* Heatmap and Tabs Section */}
        <section className="lg:w-2/3 w-full">
          {/* Tabs */}
          <div className="flex justify-start mb-6">
            <div className="flex space-x-4">
              <button
                className={`px-6 py-2 border border-gray-700 rounded-t-md font-medium transition-colors duration-300 ${
                  activeTab === 'heatmap'
                    ? 'bg-[#38A164] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('heatmap')}
              >
                Compare View
              </button>
              <button
                disabled
                className={`px-6 py-2 border border-gray-700 rounded-t-md font-medium cursor-not-allowed opacity-50 ${
                  activeTab === 'table'
                    ? 'bg-[#38A164] text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                Individual View
              </button>
              <button
                disabled
                className={`px-6 py-2 border border-gray-700 rounded-t-md font-medium cursor-not-allowed opacity-50 ${
                  activeTab === 'graph'
                    ? 'bg-[#38A164] text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                Shortlisted Candidates
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {
            activeTab === 'heatmap' ? (
              <HeatmapTable
                students={selectedStudents}
                removeStudent={toggleStudent}
              />
            ) : (
              <div className="text-center text-gray-500 mt-10">This view is under development.</div>
            )
          }
        </section>
      </div>
    </div>
  );
};

export default App;
