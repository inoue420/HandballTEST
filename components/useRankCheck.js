// useRankCheck.js
import { useRank } from './RankContext';

const useRankCheck = () => {
  const { rank } = useRank();
  
  // ランクチェックのロジック
  return rank;
};

export default useRankCheck;
