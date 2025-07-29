import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes';
import { initializeQueue } from './services/queueService';

// Load environment variables
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeQueue();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Configure CORS
    const corsOptions = {
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204
    };
    
    this.app.use(cors(corsOptions));
  }

  private async connectToDatabase(): Promise<void> {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // In production, you might want to implement a retry mechanism
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Add any additional middleware here
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api', fileRoutes);

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const status = {
        status: 'ok',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      };
      res.status(200).json(status);
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ 
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}` 
      });
    });

    // Global error handler
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', err);
      
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  private initializeQueue(): void {
    try {
      initializeQueue();
      console.log('In-memory queue initialized');
    } catch (error) {
      console.error('Error initializing queue:', error);
      // Since we're using in-memory queue, we'll continue even if there's an error
    }
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

export default App;