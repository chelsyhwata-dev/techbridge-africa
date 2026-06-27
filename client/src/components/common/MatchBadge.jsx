import { getMatchColor } from '../../utils/helpers';

export default function MatchBadge({ score }) {
  return (
    <div className={`match-score border-2 ${getMatchColor(score)}`}>
      {score}%
    </div>
  );
}
