import { HistoryQuestion } from './types';

// Level 1 Tutorial Question (Hardcoded to ensure consistency)
export const TUTORIAL_QUESTION: HistoryQuestion = {
  id: 'tutorial-1',
  topic: '秦始皇巩固统一的措施',
  description: '请找出5项秦始皇为了巩固统一而实施的关键举措。',
  correctItems: ['统一文字', '统一货币', '统一度量衡', '修筑长城', '焚书坑儒'],
  distractorItems: ['罢黜百家', '推恩令', '开凿大运河', '杯酒释兵权', '设立军机处']
};

export const INITIAL_LEADERBOARD = [
  { username: "司马迁", score: 99 },
  { username: "班固", score: 88 },
  { username: "司马光", score: 76 },
];
