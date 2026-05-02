import { useState } from 'react';
import { mockScenarios, type MockScenario } from '../services/mockData';
import { mockApi } from '../services/mockApi';

interface MockScenarioSelectorProps {
  onScenarioSelect?: (scenario: MockScenario) => void;
}

export function MockScenarioSelector({ onScenarioSelect }: MockScenarioSelectorProps) {
  const [selectedScenario, setSelectedScenario] = useState<MockScenario | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  const handleScenarioClick = (scenario: MockScenario) => {
    setSelectedScenario(scenario);
    mockApi.setScenario(scenario.id);
    onScenarioSelect?.(scenario);
  };

  const handleTestAnswer = () => {
    if (!selectedScenario) return;
    
    const correctAnswer = selectedScenario.annotations[0].object;
    mockApi.evaluateAnswer('test-session', correctAnswer).then(result => {
      setTestResult(result.feedback);
    });
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>🎭 Mock 场景选择器</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>
        点击场景卡片来预览 Mock 数据（仅开发环境可见）
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        marginTop: '16px'
      }}>
        {mockScenarios.map(scenario => (
          <div
            key={scenario.id}
            onClick={() => handleScenarioClick(scenario)}
            style={{
              padding: '12px',
              backgroundColor: selectedScenario?.id === scenario.id ? '#e3f2fd' : 'white',
              border: selectedScenario?.id === scenario.id ? '2px solid #2196f3' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {scenario.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {scenario.description}
            </div>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#1976d2' }}>
              <strong>{scenario.annotations[0].object}</strong> = {scenario.annotations[0].label}
            </div>
          </div>
        ))}
      </div>

      {selectedScenario && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <h4 style={{ marginTop: 0 }}>📝 场景详情</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <strong>标注：</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                {selectedScenario.annotations.map((ann, idx) => (
                  <li key={idx}>
                    {ann.object} ({ann.label}) - 新词汇: {ann.new_words.map(w => w.word).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong>描述：</strong> {selectedScenario.caption}
            </div>
            <div>
              <strong>练习题：</strong> {selectedScenario.outputTask}
            </div>
            <div>
              <strong>正确答案：</strong> {selectedScenario.annotations[0].object}
            </div>
            <div>
              <strong>正确反馈：</strong> {selectedScenario.feedback.correct}
            </div>
            <div>
              <strong>错误反馈：</strong> {selectedScenario.feedback.incorrect}
            </div>
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={handleTestAnswer}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                测试正确答案
              </button>
              {testResult && (
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                  {testResult}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
