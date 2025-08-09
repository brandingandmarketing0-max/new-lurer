'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { FileVideo, Download, Loader2, FileImage, Link as LinkIcon, BarChart3, Activity, Home, Video, Settings, LogOut } from 'lucide-react';

interface VideoFile {
  file: File;
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  convertedUrl?: string;
  convertedExtension?: string;
  currentStep?: string;
  timeRemaining?: string;
}

interface ImageFile {
  file: File;
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  convertedUrl?: string;
  convertedExtension?: string;
  currentStep?: string;
  timeRemaining?: string;
}

interface GifFile {
  file: File;
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  convertedUrl?: string;
  convertedExtension?: string;
  currentStep?: string;
  timeRemaining?: string;
}

interface ConversionProgress {
  total: number;
  completed: number;
  currentFile?: string;
  overallProgress: number;
}

type ConverterType = 'video' | 'gif' | 'image';

export default function VideoConverter() {
  const { signOut, user } = useAuth();
  const [activeConverter, setActiveConverter] = useState<ConverterType>('video');
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [gifFiles, setGifFiles] = useState<GifFile[]>([]);
  // Video encoding is auto-optimized: MP4 (H.264/AAC), CRF=20, preset=slow
  const [gifFps, setGifFps] = useState<number>(15);
  const [gifWidth, setGifWidth] = useState<number>(480);
  const [isConverting, setIsConverting] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress>({
    total: 0,
    completed: 0,
    currentFile: undefined,
    overallProgress: 0
  });
  const [ffmpegProgress, setFfmpegProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const gifFileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-load FFmpeg on mount so users don't have to press the button
  useEffect(() => {
    const autoInit = async () => {
      if (!isFfmpegLoaded && !isLoadingFFmpeg) {
        await initFFmpeg();
      }
    };
    autoInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  // Initialize FFmpeg with progress tracking
  const initFFmpeg = useCallback(async () => {
    if (ffmpeg) return;
    
    setIsLoadingFFmpeg(true);
    setFfmpegProgress(0);
    console.log('Initializing FFmpeg...');
    const ffmpegInstance = new FFmpeg();

    // Set up progress tracking
    ffmpegInstance.on('progress', ({ progress }) => {
      setFfmpegProgress(Math.round(progress * 100));
    });

    try {
      console.log('Loading FFmpeg core...');
      setFfmpegProgress(10);
      await ffmpegInstance.load();
      console.log('FFmpeg loaded successfully!');
      setFfmpeg(ffmpegInstance);
      setIsFfmpegLoaded(true);
      setFfmpegProgress(100);
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
    } finally {
      setIsLoadingFFmpeg(false);
      setFfmpegProgress(0);
    }
  }, [ffmpeg]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: VideoFile[] = acceptedFiles
      .filter(file => ['video/mp4', 'video/quicktime', 'video/x-matroska'].includes(file.type))
      .map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
        currentStep: 'Ready to convert'
      }));

    setVideoFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Handle file selection via click
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = () => {
    imageFileInputRef.current?.click();
  };

  const handleGifFileSelect = () => {
    gifFileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onDrop(Array.from(files));
    }
  };

  const handleImageFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: ImageFile[] = Array.from(files)
        .filter(file => ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type))
        .map(file => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'pending' as const,
          currentStep: 'Ready to convert'
        }));

      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleGifFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: GifFile[] = Array.from(files)
        .filter(file => ['video/mp4', 'video/quicktime', 'video/x-matroska'].includes(file.type))
        .map(file => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'pending' as const,
          currentStep: 'Ready to convert'
        }));

      setGifFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Handle image file drop
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImageFile[] = acceptedFiles
      .filter(file => ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type))
      .map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
        currentStep: 'Ready to convert'
      }));

    setImageFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-matroska': ['.mkv'],
    },
    multiple: true,
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: true,
  });

  const { getRootProps: getGifRootProps, getInputProps: getGifInputProps, isDragActive: isGifDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-matroska': ['.mkv'],
    },
    multiple: true,
  });

  // Simulate progress updates for better UX
  const startProgressSimulation = useCallback((file: VideoFile | ImageFile | GifFile) => {
    let progress = 0;
    const steps = [
      { name: 'Reading file...', duration: 500 },
      { name: 'Initializing conversion...', duration: 800 },
      { name: 'Converting...', duration: 1500 },
      { name: 'Optimizing output...', duration: 500 },
      { name: 'Finalizing...', duration: 200 }
    ];
    
    let currentStep = 0;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += 100;
      progress = Math.min((elapsed / totalDuration) * 100, 98); // Go to 98% instead of 95%
      
      // Update current step
      let stepElapsed = elapsed;
      for (let i = 0; i < steps.length; i++) {
        if (stepElapsed <= steps[i].duration) {
          currentStep = i;
          break;
        }
        stepElapsed -= steps[i].duration;
      }

      // Check if it's an image file by looking at the file type
      const isImageFile = file.file.type.startsWith('image/');
      const isGifFile = file.file.type.startsWith('video/');
      
      if (isImageFile) {
        setImageFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: Math.round(progress),
                  currentStep: steps[currentStep]?.name || 'Processing...',
                  timeRemaining: progress < 98 ? `${Math.max(0, Math.round((totalDuration - elapsed) / 1000))}s` : 'Almost done...'
                }
              : f
          )
        );
      } else if (isGifFile) {
        setGifFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: Math.round(progress),
                  currentStep: steps[currentStep]?.name || 'Processing...',
                  timeRemaining: progress < 98 ? `${Math.max(0, Math.round((totalDuration - elapsed) / 1000))}s` : 'Almost done...'
                }
              : f
          )
        );
      } else {
        setVideoFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: Math.round(progress),
                  currentStep: steps[currentStep]?.name || 'Processing...',
                  timeRemaining: progress < 98 ? `${Math.max(0, Math.round((totalDuration - elapsed) / 1000))}s` : 'Almost done...'
                }
              : f
          )
        );
      }
    }, 100);
  }, []);

  // Convert video to MP4 with enhanced progress tracking
  const convertVideo = async (videoFile: VideoFile) => {
    if (!ffmpeg) {
      await initFFmpeg();
    }

    try {
      // Update status to converting
      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { ...file, status: 'converting', progress: 0, currentStep: 'Starting conversion...' }
            : file
        )
      );

      // Start progress simulation
      startProgressSimulation(videoFile);

      // Write the input file to FFmpeg
      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { ...file, currentStep: 'Reading input file...' }
            : file
        )
      );
      const inputData = await fetchFile(videoFile.file);
      await ffmpeg.writeFile(videoFile.name, inputData);

      // Get file extension and create output name
      const nameWithoutExt = videoFile.name.replace(/\.[^/.]+$/, '');
      const outputExt = 'mp4';
      const outputName = `${nameWithoutExt}_converted.${outputExt}`;

      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { ...file, currentStep: 'Converting video stream...' }
            : file
        )
      );

      // Auto-optimized: H.264/AAC, CRF 20 (high quality) and preset slow (better compression)
      await ffmpeg.exec([
        '-i', videoFile.name,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'slow',
        '-crf', '20',
        '-movflags', '+faststart',
        '-y',
        outputName
      ]);

      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { ...file, currentStep: 'Reading output file...' }
            : file
        )
      );

      // Read the converted file
      const data = await ffmpeg.readFile(outputName);
      const mime = 'video/mp4';
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);

      // Clean up FFmpeg filesystem
      await ffmpeg.deleteFile(videoFile.name);
      await ffmpeg.deleteFile(outputName);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Update status to completed
      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { 
                ...file, 
                status: 'completed', 
                progress: 100, 
                convertedUrl: url,
                convertedExtension: outputExt,
                currentStep: 'Conversion completed!',
                timeRemaining: undefined
              }
            : file
        )
      );

    } catch (error) {
      console.error('Conversion error:', error);
      
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setVideoFiles(prev => 
        prev.map(file => 
          file.id === videoFile.id 
            ? { 
                ...file, 
                status: 'error', 
                progress: 0,
                currentStep: 'Conversion failed',
                timeRemaining: undefined
              }
            : file
        )
      );
    }
  };

  // Convert image: optimize while preserving original format (png/jpg/webp)
  const convertImage = async (imageFile: ImageFile) => {
    console.log('Starting image conversion for:', imageFile.name);
    
    if (!ffmpeg) {
      console.log('FFmpeg not loaded, initializing...');
      await initFFmpeg();
    }

    try {
      // Update status to converting
      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { ...file, status: 'converting', progress: 0, currentStep: 'Starting conversion...' }
            : file
        )
      );

      console.log('Starting progress simulation...');
      // Start progress simulation
      startProgressSimulation(imageFile);

      // Write the input file to FFmpeg
      console.log('Writing image file to FFmpeg...');
      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { ...file, currentStep: 'Reading input file...' }
            : file
        )
      );
      const inputData = await fetchFile(imageFile.file);
      await ffmpeg.writeFile(imageFile.name, inputData);
      console.log('Image file written to FFmpeg');

      // Get file extension and create output name (preserve original format)
      const nameWithoutExt = imageFile.name.replace(/\.[^/.]+$/, '');
      const originalExt = (imageFile.name.split('.').pop() || '').toLowerCase();
      const normalizedExt = originalExt === 'jpeg' ? 'jpg' : originalExt;
      const supportedExt = ['png', 'jpg', 'webp'];
      const outputExt = supportedExt.includes(normalizedExt) ? normalizedExt : 'jpg';
      const outputName = `${nameWithoutExt}_converted.${outputExt}`;
      console.log('Output name:', outputName);

      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { ...file, currentStep: 'Converting to JPEG...' }
            : file
        )
      );

      console.log('Executing FFmpeg command for image conversion...');
      // Choose optimization flags per format
      const flagsByExt: Record<string, string[]> = {
        jpg: ['-q:v', '2'],               // High visual quality, good compression
        png: ['-compression_level', '100'], // Max compression for PNG
        webp: ['-qscale', '4'],           // High visual quality for WEBP
      };
      const qualityFlags = flagsByExt[outputExt] || [];
      await ffmpeg.exec([
        '-i', imageFile.name,
        ...qualityFlags,
        outputName
      ]);
      console.log('FFmpeg command completed');

      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { ...file, currentStep: 'Reading output file...' }
            : file
        )
      );

      console.log('Reading converted file...');
      // Read the converted file
      const data = await ffmpeg.readFile(outputName);
      const mime = outputExt === 'png' ? 'image/png' : outputExt === 'webp' ? 'image/webp' : 'image/jpeg';
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      console.log('Converted file read, blob size:', blob.size);

      // Clean up FFmpeg filesystem
      await ffmpeg.deleteFile(imageFile.name);
      await ffmpeg.deleteFile(outputName);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.log('Updating status to completed...');
      // Update status to completed
      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { 
                ...file, 
                status: 'completed', 
                progress: 100, 
                convertedUrl: url,
                convertedExtension: outputExt,
                currentStep: 'Conversion completed!',
                timeRemaining: undefined
              }
            : file
        )
      );

      console.log('Image conversion completed successfully');

    } catch (error) {
      console.error('Image conversion error:', error);
      
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setImageFiles(prev => 
        prev.map(file => 
          file.id === imageFile.id 
            ? { 
                ...file, 
                status: 'error', 
                progress: 0,
                currentStep: 'Conversion failed',
                timeRemaining: undefined
              }
            : file
        )
      );
    }
  };

  // Convert GIF
  const convertGif = async (gifFile: GifFile) => {
    console.log('Starting GIF conversion for:', gifFile.name);
    
    if (!ffmpeg) {
      console.log('FFmpeg not loaded, initializing...');
      await initFFmpeg();
    }

    try {
      // Update status to converting
      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { ...file, status: 'converting', progress: 0, currentStep: 'Starting conversion...' }
            : file
        )
      );

      console.log('Starting progress simulation...');
      // Start progress simulation
      startProgressSimulation(gifFile);

      // Write the input file to FFmpeg
      console.log('Writing GIF file to FFmpeg...');
      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { ...file, currentStep: 'Reading input file...' }
            : file
        )
      );
      const inputData = await fetchFile(gifFile.file);
      await ffmpeg.writeFile(gifFile.name, inputData);
      console.log('GIF file written to FFmpeg');

      // Get file extension and create output name
      const nameWithoutExt = gifFile.name.replace(/\.[^/.]+$/, '');
      const outputName = `${nameWithoutExt}_converted.gif`;
      console.log('Output name:', outputName);

      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { ...file, currentStep: 'Converting to GIF...' }
            : file
        )
      );

      console.log('Executing FFmpeg command for GIF conversion...');
      // Run FFmpeg command for GIF conversion with high quality
      await ffmpeg.exec([
        '-i', gifFile.name,
        '-vf', `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos`,
        '-c:v', 'gif',
        outputName
      ]);
      console.log('FFmpeg command completed');

      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { ...file, currentStep: 'Reading output file...' }
            : file
        )
      );

      console.log('Reading converted file...');
      // Read the converted file
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      console.log('Converted file read, blob size:', blob.size);

      // Clean up FFmpeg filesystem
      await ffmpeg.deleteFile(gifFile.name);
      await ffmpeg.deleteFile(outputName);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.log('Updating status to completed...');
      // Update status to completed
      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { 
                ...file, 
                status: 'completed', 
                progress: 100, 
                convertedUrl: url,
                convertedExtension: 'gif',
                currentStep: 'Conversion completed!',
                timeRemaining: undefined
              }
            : file
        )
      );

      console.log('GIF conversion completed successfully');

    } catch (error) {
      console.error('GIF conversion error:', error);
      
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setGifFiles(prev => 
        prev.map(file => 
          file.id === gifFile.id 
            ? { 
                ...file, 
                status: 'error', 
                progress: 0,
                currentStep: 'Conversion failed',
                timeRemaining: undefined
              }
            : file
        )
      );
    }
  };

  // Load FFmpeg manually
  const handleLoadFFmpeg = async () => {
    if (!isFfmpegLoaded && !isLoadingFFmpeg) {
      await initFFmpeg();
    }
  };

  // Remove file from list
  const removeFile = (id: string) => {
    setVideoFiles(prev => prev.filter(file => file.id !== id));
    setImageFiles(prev => prev.filter(file => file.id !== id));
    setGifFiles(prev => prev.filter(file => file.id !== id));
  };

  // Download converted file
  const downloadFile = (file: VideoFile | ImageFile | GifFile) => {
    if (file.convertedUrl) {
      const link = document.createElement('a');
      link.href = file.convertedUrl;
      const fallbackExt = file.file.type.startsWith('image/') ? 'jpg' : (file.file.type.startsWith('video/') ? 'gif' : 'mp4');
      const extension = (file as any).convertedExtension || fallbackExt;
      link.download = file.name.replace(/\.[^/.]+$/, '') + `_converted.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Generate all files (videos and images)
  const handleGenerate = async () => {
    const pendingVideoFiles = videoFiles.filter(file => file.status === 'pending');
    const pendingImageFiles = imageFiles.filter(file => file.status === 'pending');
    const pendingGifFiles = gifFiles.filter(file => file.status === 'pending');
    const totalFiles = pendingVideoFiles.length + pendingImageFiles.length + pendingGifFiles.length;
    
    if (totalFiles === 0) return;
    
    setIsConverting(true);
    
    // Initialize FFmpeg if not already loaded
    if (!isFfmpegLoaded) {
      await initFFmpeg();
    }

    setConversionProgress({
      total: totalFiles,
      completed: 0,
      currentFile: pendingVideoFiles[0]?.name || pendingImageFiles[0]?.name || pendingGifFiles[0]?.name,
      overallProgress: 0
    });

    let completedCount = 0;

    // Convert all pending video files
    for (let i = 0; i < pendingVideoFiles.length; i++) {
      const videoFile = pendingVideoFiles[i];
      
      setConversionProgress(prev => ({
        ...prev,
        currentFile: videoFile.name,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));

      await convertVideo(videoFile);
      completedCount++;
      
      setConversionProgress(prev => ({
        ...prev,
        completed: completedCount,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));
    }

    // Convert all pending image files
    for (let i = 0; i < pendingImageFiles.length; i++) {
      const imageFile = pendingImageFiles[i];
      
      setConversionProgress(prev => ({
        ...prev,
        currentFile: imageFile.name,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));

      await convertImage(imageFile);
      completedCount++;
      
      setConversionProgress(prev => ({
        ...prev,
        completed: completedCount,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));
    }

    // Convert all pending GIF files
    for (let i = 0; i < pendingGifFiles.length; i++) {
      const gifFile = pendingGifFiles[i];
      
      setConversionProgress(prev => ({
        ...prev,
        currentFile: gifFile.name,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));

      await convertGif(gifFile);
      completedCount++;
      
      setConversionProgress(prev => ({
        ...prev,
        completed: completedCount,
        overallProgress: Math.round((completedCount / totalFiles) * 100)
      }));
    }
    
    setIsConverting(false);
    setConversionProgress({
      total: 0,
      completed: 0,
      currentFile: undefined,
      overallProgress: 0
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Render converter content based on active type
  const renderConverterContent = () => {
    switch (activeConverter) {
      case 'video':
        return (
          <div className="space-y-6">
            {/* Output Location removed */}

            {/* Overall Conversion Progress */}
            {isConverting && conversionProgress.total > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-gray-600">
                    {conversionProgress.completed}/{conversionProgress.total} files
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${conversionProgress.overallProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {conversionProgress.currentFile && `Converting: ${conversionProgress.currentFile}`}
                </p>
              </div>
            )}

             {/* Video Options removed – using auto-optimized settings (H.264/AAC, CRF 20, preset slow) */}

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              onClick={handleFileSelect}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input {...getInputProps()} />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <FileVideo size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Drag and drop or click to select files'}
              </p>
              <p className="text-gray-600">Supported files: mp4, mov, mkv</p>
            </div>

            {/* File List */}
            {videoFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Selected Files:</h3>
                {videoFiles.map((videoFile) => (
                  <div
                    key={videoFile.id}
                    className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileVideo size={20} className="text-[#B19272]" />
                        <div>
                          <p className="font-medium">{videoFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(videoFile.size)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      {videoFile.status === 'converting' && (
                        <div className="mt-3 space-y-2">
                           <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                               className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                              style={{ width: `${videoFile.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-[#B19272]">{videoFile.currentStep}</span>
                             <span className="text-gray-600">
                              {videoFile.progress}% {videoFile.timeRemaining && `• ${videoFile.timeRemaining}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Status */}
                      <div className="mt-2">
                        {videoFile.status === 'pending' && (
                           <span className="text-yellow-700 text-sm">Pending</span>
                        )}
                        {videoFile.status === 'converting' && (
                           <span className="text-[#B19272] text-sm flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Converting...
                          </span>
                        )}
                        {videoFile.status === 'completed' && (
                           <span className="text-green-700 text-sm">✓ Completed</span>
                        )}
                        {videoFile.status === 'error' && (
                           <span className="text-red-600 text-sm">✗ Error</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {videoFile.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(videoFile)}
                           className="flex items-center gap-1 bg-[#B19272] hover:bg-[#9A7B5F] px-3 py-1 rounded text-sm text-white transition-colors"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(videoFile.id)}
                         className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <div>
              <button
                onClick={handleGenerate}
                disabled={videoFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  videoFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#B19272] hover:bg-[#9A7B5F] text-white'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Converting... {conversionProgress.overallProgress}%
                  </span>
                ) : isLoadingFFmpeg ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Loading FFmpeg... {ffmpegProgress}%
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {/* FFmpeg Loading Status */}
            {videoFiles.length > 0 && (
              <div className="text-center">
                 {isLoadingFFmpeg && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                       <p className="text-gray-700">Loading FFmpeg...</p>
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                         className="bg-[#B19272] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ffmpegProgress}%` }}
                      />
                    </div>
                     <p className="text-xs text-gray-600">{ffmpegProgress}%</p>
                  </div>
                )}
                {!isFfmpegLoaded && !isLoadingFFmpeg && (
                  <div className="space-y-2">
                     <p className="text-yellow-700">
                      FFmpeg not loaded. Load FFmpeg first, then convert videos.
                    </p>
                    <button
                      onClick={handleLoadFFmpeg}
                       className="bg-[#B19272] hover:bg-[#9A7B5F] px-4 py-2 rounded text-sm text-white transition-colors"
                    >
                      Load FFmpeg
                    </button>
                  </div>
                )}
                {isFfmpegLoaded && (
                   <p className="text-green-700">
                    ✓ FFmpeg ready for conversion
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'gif':
        return (
          <div className="space-y-6">
            {/* Output Location removed */}

            {/* Overall Conversion Progress */}
            {isConverting && conversionProgress.total > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-gray-600">
                    {conversionProgress.completed}/{conversionProgress.total} files
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${conversionProgress.overallProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {conversionProgress.currentFile && `Converting: ${conversionProgress.currentFile}`}
                </p>
              </div>
            )}

              {/* Image options removed – using auto-optimized image compression */}

            {/* File Drop Zone */}
            <div
              {...getGifRootProps()}
              onClick={handleGifFileSelect}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isGifDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input {...getGifInputProps()} />
              <input
                ref={gifFileInputRef}
                type="file"
                multiple
                accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
                onChange={handleGifFileInputChange}
                className="hidden"
              />
              
              <FileVideo size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-medium mb-2">
                {isGifDragActive ? 'Drop files here' : 'Drag and drop or click to select files'}
              </p>
              <p className="text-gray-600">Supported files: mp4, mov, mkv</p>
            </div>

            {/* File List */}
            {gifFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Selected Files:</h3>
                {gifFiles.map((gifFile) => (
                  <div
                    key={gifFile.id}
                    className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileVideo size={20} className="text-[#B19272]" />
                        <div>
                          <p className="font-medium">{gifFile.name}</p>
                           <p className="text-sm text-gray-600">
                            {formatFileSize(gifFile.size)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      {gifFile.status === 'converting' && (
                        <div className="mt-3 space-y-2">
                           <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                               className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                              style={{ width: `${gifFile.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-[#B19272]">{gifFile.currentStep}</span>
                             <span className="text-gray-600">
                              {gifFile.progress}% {gifFile.timeRemaining && `• ${gifFile.timeRemaining}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Status */}
                      <div className="mt-2">
                        {gifFile.status === 'pending' && (
                           <span className="text-yellow-700 text-sm">Pending</span>
                        )}
                        {gifFile.status === 'converting' && (
                           <span className="text-[#B19272] text-sm flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Converting...
                          </span>
                        )}
                        {gifFile.status === 'completed' && (
                           <span className="text-green-700 text-sm">✓ Completed</span>
                        )}
                        {gifFile.status === 'error' && (
                           <span className="text-red-600 text-sm">✗ Error</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {gifFile.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(gifFile)}
                           className="flex items-center gap-1 bg-[#B19272] hover:bg-[#9A7B5F] px-3 py-1 rounded text-sm text-white transition-colors"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(gifFile.id)}
                         className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <div>
              <button
                onClick={handleGenerate}
                disabled={gifFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  gifFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#B19272] hover:bg-[#9A7B5F] text-white'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Converting... {conversionProgress.overallProgress}%
                  </span>
                ) : isLoadingFFmpeg ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Loading FFmpeg... {ffmpegProgress}%
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {/* FFmpeg Loading Status */}
            {gifFiles.length > 0 && (
              <div className="text-center">
                 {isLoadingFFmpeg && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                       <p className="text-gray-700">Loading FFmpeg...</p>
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                         className="bg-[#B19272] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ffmpegProgress}%` }}
                      />
                    </div>
                     <p className="text-xs text-gray-600">{ffmpegProgress}%</p>
                  </div>
                )}
                {!isFfmpegLoaded && !isLoadingFFmpeg && (
                  <div className="space-y-2">
                     <p className="text-yellow-700">
                      FFmpeg not loaded. Load FFmpeg first, then convert GIFs.
                    </p>
                    <button
                      onClick={handleLoadFFmpeg}
                       className="bg-[#B19272] hover:bg-[#9A7B5F] px-4 py-2 rounded text-sm text-white transition-colors"
                    >
                      Load FFmpeg
                    </button>
                  </div>
                )}
                {isFfmpegLoaded && (
                   <p className="text-green-700">
                    ✓ FFmpeg ready for conversion
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-6">
            {/* Output Location removed */}

            {/* Overall Conversion Progress */}
            {isConverting && conversionProgress.total > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-gray-600">
                    {conversionProgress.completed}/{conversionProgress.total} files
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${conversionProgress.overallProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {conversionProgress.currentFile && `Converting: ${conversionProgress.currentFile}`}
                </p>
              </div>
            )}

              {/* Image options removed – using auto-optimized compression */}

            {/* File Drop Zone */}
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isImageDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input {...getImageInputProps()} />
              <input
                ref={imageFileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
                onChange={handleImageFileInputChange}
                className="hidden"
              />
              
              <FileImage size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-medium mb-2">
                {isImageDragActive ? 'Drop files here' : 'Drag and drop or click to select files'}
              </p>
              <p className="text-gray-600">Supported files: png, jpg, jpeg, webp</p>
            </div>

            {/* File List */}
            {imageFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Selected Files:</h3>
                {imageFiles.map((imageFile) => (
                  <div
                    key={imageFile.id}
                    className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileImage size={20} className="text-[#B19272]" />
                        <div>
                          <p className="font-medium">{imageFile.name}</p>
                           <p className="text-sm text-gray-600">
                            {formatFileSize(imageFile.size)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      {imageFile.status === 'converting' && (
                        <div className="mt-3 space-y-2">
                           <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                               className="bg-[#B19272] h-3 rounded-full transition-all duration-300"
                              style={{ width: `${imageFile.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-[#B19272]">{imageFile.currentStep}</span>
                             <span className="text-gray-600">
                              {imageFile.progress}% {imageFile.timeRemaining && `• ${imageFile.timeRemaining}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Status */}
                      <div className="mt-2">
                        {imageFile.status === 'pending' && (
                           <span className="text-yellow-700 text-sm">Pending</span>
                        )}
                        {imageFile.status === 'converting' && (
                           <span className="text-[#B19272] text-sm flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Converting...
                          </span>
                        )}
                        {imageFile.status === 'completed' && (
                           <span className="text-green-700 text-sm">✓ Completed</span>
                        )}
                        {imageFile.status === 'error' && (
                           <span className="text-red-600 text-sm">✗ Error</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {imageFile.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(imageFile)}
                           className="flex items-center gap-1 bg-[#B19272] hover:bg-[#9A7B5F] px-3 py-1 rounded text-sm text-white transition-colors"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(imageFile.id)}
                         className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <div>
              <button
                onClick={handleGenerate}
                disabled={imageFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  imageFiles.length === 0 || isConverting || isLoadingFFmpeg || !isFfmpegLoaded
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#B19272] hover:bg-[#9A7B5F] text-white'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Converting... {conversionProgress.overallProgress}%
                  </span>
                ) : isLoadingFFmpeg ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Loading FFmpeg... {ffmpegProgress}%
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {/* FFmpeg Loading Status */}
            {imageFiles.length > 0 && (
              <div className="text-center">
                 {isLoadingFFmpeg && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                       <p className="text-gray-700">Loading FFmpeg...</p>
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                         className="bg-[#B19272] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ffmpegProgress}%` }}
                      />
                    </div>
                     <p className="text-xs text-gray-600">{ffmpegProgress}%</p>
                  </div>
                )}
                {!isFfmpegLoaded && !isLoadingFFmpeg && (
                  <div className="space-y-2">
                     <p className="text-yellow-700">
                      FFmpeg not loaded. Load FFmpeg first, then convert images.
                    </p>
                    <button
                      onClick={handleLoadFFmpeg}
                       className="bg-[#B19272] hover:bg-[#9A7B5F] px-4 py-2 rounded text-sm text-white transition-colors"
                    >
                      Load FFmpeg
                    </button>
                  </div>
                )}
                {isFfmpegLoaded && (
                   <p className="text-green-700">
                    ✓ FFmpeg ready for conversion
                  </p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen bg-white">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3 px-4">
                <div className="w-8 h-8 bg-[#B19272] rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900"> lure.bio</h2>
                  <p className="text-xs text-gray-500">Media Converter</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/">
                          <Home className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/deep-links">
                          <LinkIcon className="w-4 h-4" />
                          <span>Deep Links</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/analytics">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <Video className="w-4 h-4" />
                        <span>Converter</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile">
                          <Activity className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 pt-4">
              <div className="px-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-gray-300 text-red-600 hover:text-red-700"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset>
            <div className="flex flex-col h-full w-full">
              {/* Header */}
              <div className="relative flex items-center justify-center p-6 border-b border-gray-200">
                <SidebarTrigger className="absolute left-6" />
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Converter</h1>
                  <p className="text-gray-600">Convert videos, images and GIFs</p>
                </div>
              </div>

              <div className="flex-1 p-6 flex justify-center">
                <div className="w-full max-w-5xl md:ml-[120px]">
                  {/* Horizontal Navigation Tabs */}
                  <div className="mb-8 flex justify-center">
                    <div className="bg-gray-100 rounded-lg border border-gray-300 p-1 inline-flex">
                      <button
                        onClick={() => setActiveConverter('video')}
                        className={`px-6 py-3 rounded-md font-medium transition-colors ${
                          activeConverter === 'video'
                            ? 'bg-[#B19272] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Video Converter
                      </button>
                      <button
                        onClick={() => setActiveConverter('image')}
                        className={`px-6 py-3 rounded-md font-medium transition-colors ${
                          activeConverter === 'image'
                            ? 'bg-[#B19272] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Image Converter
                      </button>
                      <button
                        onClick={() => setActiveConverter('gif')}
                        className={`px-6 py-3 rounded-md font-medium transition-colors ${
                          activeConverter === 'gif'
                            ? 'bg-[#B19272] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        GIF Converter
                      </button>
                    </div>
                  </div>

                  {/* Sub-Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold mb-4">
                      {activeConverter === 'video' && 'Video Converter'}
                      {activeConverter === 'gif' && 'GIF Converter'}
                      {activeConverter === 'image' && 'Image Converter'}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {activeConverter === 'video' && 'Converts video files to .mp4 for a smaller file size and better compatibility with different platforms and devices.'}
                      {activeConverter === 'gif' && 'Convert videos to animated GIFs with custom quality and size settings.'}
                      {activeConverter === 'image' && 'Convert and optimize images between different formats with advanced compression options.'}
                    </p>
                  </div>

                  {/* Converter Content */}
                  {renderConverterContent()}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}