import React, { useState, useEffect, useRef } from 'react';
import { Survey } from 'survey-react-ui';
import { Chart } from 'chart.js/auto';
import 'survey-core/defaultV2.min.css';
import './App.css';
import { Model } from 'survey-core';
import { surveyJson } from './json.js';

const chartLabels = ["Esportivo", "Elegante", "Romântico", "Sexy", "Dramático", "Tradicional", "Criativo"];
const chartColors = ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236", "#166a8f", "#00a950"];

function App() {
  const survey = useRef(new Model(surveyJson)).current;
  const [surveyResults, setSurveyResults] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Load Chart.js library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup Chart.js library
      document.body.removeChild(script);
    };
  }, []);

  survey.onComplete.add((sender, options) => {
    console.log(JSON.stringify(sender.data, null, 3));
    setSurveyResults(survey.data);
  });

  useEffect(() => {
    if (surveyResults) {
      const chartData = {
        labels: chartLabels,
        datasets: [
          {
            label: 'Dados das Respostas',
            data: chartLabels.map((label, index) => {
              let count = 0;
              for (let questionName in surveyResults) {
                const value = surveyResults[questionName];
                if (Array.isArray(value) && value.includes(label)) {
                  count++;
                } else if (value === label) {
                  count++;
                }
              }
              return count;
            }),
            backgroundColor: chartColors,
            borderColor: chartColors,
            borderWidth: 1,
          },
        ],
      };      
      setChartData({ labels: chartLabels, ...chartData });
    }
  }, [surveyResults]);  

  useEffect(() => {
    if (chartData) {
      const ctx = document.getElementById('survey-results-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              stepSize: 1,
              precision: 0
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = chartData.datasets[context.datasetIndex].label;
                  var value = context.dataset.data[context.dataIndex];
                  var count = value + ' resposta' + (value !== 1 ? 's' : '');
                  return label + ': ' + count;
                }
              }
            }
          }
        }
      });
    }
  }, [chartData]);  

  const onComplete = (survey, options) => {
    setSurveyResults(survey.data);
  };

  return (
    <>
      <Survey model={survey} onComplete={onComplete} />
      {chartData && (
        <div className="chart-container">
          <canvas id="survey-results-chart"></canvas>
        </div>
      )}
    </>
  );
}

export default App;
