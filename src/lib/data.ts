import type { Platform, Genre, Game } from './types';

export const platforms: Platform[] = [
  { id: 'ps5', name: 'PlayStation 5' },
  { id: 'xbox', name: 'Xbox Series X' },
  { id: 'switch', name: 'Nintendo Switch' },
  { id: 'pc', name: 'PC' },
  { id: 'multi', name: 'Multiplataforma' }, // Nueva opción agregada
];

export const genres: Genre[] = [
  { id: 'action', name: 'Action' },
  { id: 'rpg', name: 'RPG' },
  { id: 'strategy', name: 'Strategy' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'sports', name: 'Sports' },
  { id: 'puzzle', name: 'Puzzle' },
  { id: 'racing', name: 'Racing' },
];

// La lista de juegos 'allGames' se mantiene igual, pero ahora podrías usar
// platforms[4] para asignar 'Multiplataforma' a nuevos juegos si quisieras.
export const allGames: Game[] = [
  {
    id: '1',
    name: 'Cyber Odyssey',
    description: 'Explore a vast, dystopian metropolis in this open-world RPG. Your choices shape the story.',
    price: 59.99,
    platform: platforms[0], // PS5
    genre: genres[1], // RPG
    type: 'Digital',
    releaseDate: '2023-10-20',
    developer: 'Neon Dreams Studios',
    imageId: 'cyber-odyssey',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Fantasy Quest XI',
    description: 'Embark on an epic journey to save the world from an ancient evil. A classic fantasy adventure.',
    price: 49.99,
    platform: platforms[2], // Switch
    genre: genres[1], // RPG
    type: 'Physical',
    releaseDate: '2023-08-15',
    developer: 'Mythic Realms',
    imageId: 'fantasy-quest',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Star Explorer',
    description: 'Chart the unknown galaxies, discover new planets, and build your own fleet in this space simulation.',
    price: 39.99,
    platform: platforms[3], // PC
    genre: genres[2], // Strategy
    type: 'Digital',
    releaseDate: '2023-11-01',
    developer: 'Cosmic Interactive',
    imageId: 'star-explorer',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Racing Fever 3',
    description: 'Experience hyper-realistic racing with stunning graphics and a wide range of customizable cars.',
    price: 69.99,
    platform: platforms[1], // Xbox
    genre: genres[6], // Racing
    type: 'Physical',
    releaseDate: '2023-09-05',
    developer: 'Adrenaline Rush Games',
    imageId: 'racing-fever',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Soccer Pro 2024',
    description: 'The most realistic soccer simulation is back with new features and improved gameplay.',
    price: 59.99,
    platform: platforms[0], // PS5
    genre: genres[4], // Sports
    type: 'Digital',
    releaseDate: '2023-09-28',
    developer: 'KickOff Studios',
    imageId: 'soccer-pro',
    rating: 4.1,
  },
  {
    id: '6',
    name: 'Jungle Adventure',
    description: 'Solve ancient puzzles and uncover hidden treasures in this thrilling action-adventure game.',
    price: 29.99,
    platform: platforms[2], // Switch
    genre: genres[3], // Adventure
    type: 'Digital',
    releaseDate: '2023-07-12',
    developer: 'Lost World Games',
    imageId: 'jungle-adventure',
    rating: 4.4,
  },
  {
    id: '7',
    name: 'Puzzle Minds',
    description: 'Challenge your brain with hundreds of mind-bending puzzles in this innovative puzzle game.',
    price: 19.99,
    platform: platforms[3], // PC
    genre: genres[5], // Puzzle
    type: 'Digital',
    releaseDate: '2023-06-22',
    developer: 'Logic Leap',
    imageId: 'puzzle-minds',
    rating: 4.7,
  },
  {
    id: '8',
    name: 'Wild West Redemption',
    description: 'Live the life of an outlaw in a vast, open-world American frontier. A story of honor and betrayal.',
    price: 59.99,
    platform: platforms[1], // Xbox
    genre: genres[0], // Action
    type: 'Physical',
    releaseDate: '2023-05-18',
    developer: 'Frontier Stories',
    imageId: 'wild-west',
    rating: 4.9,
  },
   {
    id: '9',
    name: 'Galactic Wars',
    description: 'Lead your faction to victory in a massive-scale strategy game set in a war-torn galaxy.',
    price: 49.99,
    platform: platforms[3], // PC
    genre: genres[2], // Strategy
    type: 'Digital',
    releaseDate: '2024-01-10',
    developer: 'Stellar Tactics',
    imageId: 'galactic-wars',
    rating: 4.5,
  },
  {
    id: '10',
    name: 'Mystic Legends',
    description: 'A dark fantasy action-RPG with challenging combat and a deep, branching narrative.',
    price: 69.99,
    platform: platforms[0], // PS5
    genre: genres[1], // RPG
    type: 'Digital',
    releaseDate: '2024-02-22',
    developer: 'Shadow Forge',
    imageId: 'mystic-legends',
    rating: 4.8,
  },
  {
    id: '11',
    name: 'City Builder Ultimate',
    description: 'Design and manage the city of your dreams in this comprehensive city-building simulation.',
    price: 39.99,
    platform: platforms[3], // PC
    genre: genres[2], // Strategy
    type: 'Digital',
    releaseDate: '2023-12-05',
    developer: 'Urban Dynamics',
    imageId: 'city-builder',
    rating: 4.3,
  },
  {
    id: '12',
    name: 'Heist Crew',
    description: 'Assemble your team and pull off the most daring heists in this cooperative action game.',
    price: 39.99,
    platform: platforms[1], // Xbox
    genre: genres[0], // Action
    type: 'Digital',
    releaseDate: '2024-03-15',
    developer: 'Lockpick Interactive',
    imageId: 'heist-crew',
    rating: 4.6,
  },
];