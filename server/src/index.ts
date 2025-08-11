import express from 'express';
import path from 'path';
import userRoutes from './routes/userRoutes';
import pronunciationRoutes from './routes/pronunciationRoutes';
import geminiRoutes from './routes/geminiRoutes';
import genImageRoutes from './routes/genImageRoutes';
import gameRoutes from './routes/gameRoutes';

const app = express();
app.use(express.json());

app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

app.use('/api/users', userRoutes);
app.use('/api/pronunciations', pronunciationRoutes);
app.use('/api/geminis', geminiRoutes);
app.use('/api/images', genImageRoutes);
app.use('/api/games', gameRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
