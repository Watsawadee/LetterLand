import { CardProps } from '../types/gametypes';
import { Game, GameTemplate } from '../types/gametypes';

export function mapRecentGameToCard(game: Game): CardProps {
  const topic = game.gameTemplate.gameTopic;
  return {
    id: game.id.toString(),
    image: `https://placehold.co/200x100?text=${encodeURIComponent(topic)}`, // Replace later
    title: topic,
    subtitle: game.gameTemplate.gameType === 'crossword' ? 'Crossword Search' : 'Word Search',
    level: game.gameTemplate.difficulty,
    onPress: () => console.log(`Navigate to recent game ${game.id}`),
  };
}

export function mapPublicGameToCard(template: GameTemplate): CardProps {
  return {
    id: template.id.toString(),
    image: `https://placehold.co/200x100?text=${encodeURIComponent(template.gameTopic)}`, // Replace later
    title: template.gameTopic,
    subtitle: 'Created by community',
    level: template.difficulty,
    onPress: () => console.log(`Navigate to public game ${template.id}`),
  };
}
